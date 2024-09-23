import _ from "lodash";
import mongoose, { ObjectId } from "mongoose";
import { Event as SocketEvent, Namespace, Server, Socket } from "socket.io";
import { generateUsername } from "unique-username-generator";

import { SITE_USER_ID } from "@/config";
import { ESOCKET_NAMESPACE } from "@/constant/enum";
import { AutoCrashBetService } from "@/modules/auto-crash-bet";
import { SiteTransactionService } from "@/modules/site-transaction";
import UserService from "@/modules/user/user.service";
import UserBotService from "@/modules/user-bot/user-bot.service";
import {
  generateCrashRandom,
  generateMersenneTwisterRandom,
  generatePrivateSeedHashPair,
} from "@/utils/crypto/random";
import { getVipLevelFromWager } from "@/utils/customer/vip";
import logger from "@/utils/logger";
import throttleConnections from "@/utils/socket/throttler";

import {
  CBET_STATES,
  CBotBetAmountLimit,
  CCrashConfig,
  CGAME_STATES,
  CLimitCrashPoint,
  CTime,
  ECrashGameEvents,
} from "../crash-game.constant";
import {
  TAutoCrashBetPayload,
  TJoinGamePayload,
} from "../crash-game.interface";
import { CrashGameService } from "../crash-game.service";
import { GameHistoryService } from "../game-history.service";
import { IBetType } from "../crash-game.types";
import { CrashGameSocketController } from "./crash-game.socket-controller";

class CrashGameSocketListener {
  private socketServer: Namespace;
  private logoPrefix: string = "[Crash Game ServerSocket]::: ";
  // Services
  private userService: UserService;
  private crashGameService: CrashGameService;
  private gameHistoryService: GameHistoryService;
  private autoCrashBetService: AutoCrashBetService;
  private siteTransactionService: SiteTransactionService;
  private userBotServices: UserBotService;

  constructor(socketServer: Server) {
    // Socket init
    this.socketServer = socketServer.of(ESOCKET_NAMESPACE.crash);

    // Service init
    this.userService = new UserService();
    this.crashGameService = new CrashGameService();
    this.gameHistoryService = new GameHistoryService();
    this.autoCrashBetService = new AutoCrashBetService();
    this.siteTransactionService = new SiteTransactionService();
    this.userBotServices = new UserBotService();

    // Function init
    this.initializeListener();
    this.subscribeListener();
  }

  private subscribeListener(): void {
    this.socketServer.on("connection", (socket: Socket) => {
      const crashGameController = new CrashGameSocketController();
      crashGameController.setSocketNamespace(this.socketServer);
      crashGameController.setSocket(socket);
      crashGameController.initializeSubscribe();

      // Auth handler
      socket.on(ECrashGameEvents.auth, async (token: string) => {
        crashGameController.authHandler(token);
      });
      // Get Previous history handler
      socket.on(ECrashGameEvents.getHistory, async (count: number) => {
        crashGameController.getHistoryHandler(count);
      });
      // Auto Crash Bet Handler
      socket.on(
        ECrashGameEvents.autoCrashBet,
        async (data: TAutoCrashBetPayload) => {
          crashGameController.autoCrashBetHandler(data);
        }
      );
      // Cancel Auto Crash Bet Handler
      socket.on(ECrashGameEvents.cancelAutoBet, async () => {
        crashGameController.cancelAutoBetHandler();
      });
      // Cashout the current bet Handler
      socket.on(ECrashGameEvents.joinGame, async (data: TJoinGamePayload) => {
        crashGameController.joinGameHandler(data, this.emitPlayerBets);
      });
      // Cashout the current bet Handler
      socket.on(ECrashGameEvents.betCashout, async () => {
        crashGameController.betCashoutHandler(this.doCashOut);
      });
      // Disconnect Handler
      socket.on(ECrashGameEvents.disconnect, async () => {
        crashGameController.disconnectHandler();
      });

      // Check for users ban status
      socket.use((packet: SocketEvent, next: (err?: any) => void) =>
        crashGameController.banStatusCheckMiddleware(packet, next)
      );

      // Throttle connections
      socket.use(throttleConnections(socket));
    });
  }

  private initializeListener = async () => {
    try {
      await this.initGame();
      await this.runGame();
    } catch (error) {
      logger.error(this.logoPrefix + "Error initializing game:", error);
    }
  };

  private initGame = async () => {
    logger.info(this.logoPrefix + "Initializing game");
    const unfinishedGames = await this.getUnfinishedGames();

    if (unfinishedGames.length > 0) {
      logger.info(
        this.logoPrefix + "Ending unfinished games :" + unfinishedGames.length
      );

      for (const game of unfinishedGames) {
        logger.info(this.logoPrefix + "Ending unfinished game id: " + game._id);
        await this.refundGame(game._id);
      }
    }
  };

  public getUnfinishedGames = async () => {
    return this.crashGameService.getUnfinishedGames();
  };

  public refundGame = async (gameId: ObjectId) => {
    const game = await this.crashGameService.getItemById(gameId);

    if (!game.players) {
      return null;
    }

    const refundedPlayers = [];

    for (const playerID in game.players) {
      if (!playerID || playerID === "undefined") {
        continue;
      }

      const bet = game.players[playerID];

      if (bet.status == CBET_STATES.Playing) {
        // Push Player ID to the refunded players
        refundedPlayers.push(playerID);

        logger.info(
          this.logoPrefix + `Refunding player ${playerID} for ${bet.betAmount}`
        );

        // Refund player
        await this.userService.updateById(playerID, {
          $inc: {
            [`credit`]: Math.abs(bet.betAmount),
          },
        });
        const newWalletTxData = {
          userId: new mongoose.Types.ObjectId(playerID),
          amount: Math.abs(bet.betAmount),
          reason: "Crash refund",
          extraData: { crashGameId: game._id },
        };
        await this.siteTransactionService.create(newWalletTxData);
      }
    }

    // Update game status
    const updatePayload = {
      refundedPlayers,
      status: CGAME_STATES.Refunded,
    };
    const updatedGame = await this.crashGameService.updateById(
      gameId,
      updatePayload
    );

    return updatedGame;
  };

  public emitPlayerBets = () => {
    const bets = CrashGameSocketController.gameStatus.pendingBets;
    CrashGameSocketController.gameStatus.pendingBets = [];
    this.socketServer.emit("game-bets", bets);
  };

  private runGame = async () => {
    try {
      const game = await this.createNewGameBySeed();
      // Override local state
      CrashGameSocketController.gameStatus._id = game._id;
      CrashGameSocketController.gameStatus.status = CGAME_STATES.Starting;
      CrashGameSocketController.gameStatus.privateSeed = game.privateSeed!;
      CrashGameSocketController.gameStatus.privateHash = game.privateHash!;
      CrashGameSocketController.gameStatus.publicSeed = null;
      CrashGameSocketController.gameStatus.startedAt = new Date(
        Date.now() + CTime.restart_wait_time
      );
      CrashGameSocketController.gameStatus.players = {};
      CrashGameSocketController.gameStatus.botCount = 0;
      CrashGameSocketController.gameStatus.bots = {};
      CrashGameSocketController.gameStatus.pending =
        CrashGameSocketController.gameStatus.nextPending;
      CrashGameSocketController.gameStatus.nextPending = {};

      // Update startedAt in db
      this.crashGameService.updateById(game._id.toString(), {
        startedAt: CrashGameSocketController.gameStatus.startedAt,
      });

      try {
        // Bet for autobet players
        const autoBetPlayers =
          await this.autoCrashBetService.aggregateByPipeline([
            { $match: { status: true } },
            {
              $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $unwind: "$user",
            },
          ]);

        autoBetPlayers.forEach(async (autoBetPlayer) => {
          const { user, betAmount, cashoutPoint, count } = autoBetPlayer;

          if (user?._id) {
            CrashGameSocketController.gameStatus.pending[String(user._id)] = {
              betAmount,
              autoCashOut: cashoutPoint,
              username: user.username,
            };

            CrashGameSocketController.gameStatus.pendingCount++;
            logger.info(
              this.logoPrefix + `autobet :::` + autoBetPlayer.user._id
            );

            // If user is self-excluded
            if (user?.selfExcludes?.crash > Date.now()) {
              await this.autoCrashBetService.deleteById(autoBetPlayer._id);
              delete CrashGameSocketController.gameStatus.pending[user._id];
              CrashGameSocketController.gameStatus.pendingCount--;
              this.socketServer
                .to(String(user._id))
                .emit(
                  "game-join-error",
                  `You have self-excluded yourself for another ${((user!.selfExcludes.crash - Date.now()) / 3600000).toFixed(1)} hours. Autobet has canceled`
                );
            }

            // If user has restricted bets
            if (user?.betsLocked) {
              await this.autoCrashBetService.deleteById(autoBetPlayer._id);
              delete CrashGameSocketController.gameStatus.pending[user._id];
              CrashGameSocketController.gameStatus.pendingCount--;
              this.socketServer
                .to(String(user._id))
                .emit(
                  "game-join-error",
                  "Your account has an betting restriction. Please contact support for more information. Autobet has canceled"
                );
            }

            // If user can afford this bet
            if ((user?.credit ?? 0) < parseFloat(betAmount.toFixed(2))) {
              await this.autoCrashBetService.deleteById(autoBetPlayer._id);
              delete CrashGameSocketController.gameStatus.pending[user._id];
              CrashGameSocketController.gameStatus.pendingCount--;
              this.socketServer
                .to(String(user._id))
                .emit(
                  "crash-autobet-balance-error",
                  "You can't afford this autobet! Autobet has canceled"
                );
              return;
            }

            if (count < 0) {
              await this.autoCrashBetService.deleteById(autoBetPlayer._id);
              delete CrashGameSocketController.gameStatus.pending[user._id];
              CrashGameSocketController.gameStatus.pendingCount--;
              this.socketServer
                .to(String(user._id))
                .emit(
                  "crash-autobet-count-max",
                  "Autobet has reached the max number of bets!"
                );
              return;
            }

            // decrease the autobet count by one
            await this.autoCrashBetService.updateById(autoBetPlayer._id, {
              $set: { count: count - 1 },
            });

            const newCreditValue =
              (user!.credit || 0) - Math.abs(parseFloat(betAmount.toFixed(2)));
            const newWagerValue =
              (user!.wager?.["crash"] || 0) +
              Math.abs(parseFloat(betAmount.toFixed(2)));
            const newWagerNeededForWithdrawValue =
              (user!.wagerNeededForWithdraw || 0) +
              Math.abs(parseFloat(betAmount.toFixed(2)));
            const newPlayedNumber = user!.played + 1;
            const newLeaderboardValue =
              (user!.leaderboard?.["crash"]?.betAmount || 0) +
              Math.abs(parseFloat(betAmount.toFixed(2)));
            // Remove bet amount from user's balance
            await this.userService.updateById(user._id, {
              $set: {
                [`credit`]: newCreditValue,
                [`wager`]: newWagerValue,
                [`played`]: newPlayedNumber,
                [`wagerNeededForWithdraw`]: newWagerNeededForWithdrawValue,
                [`leaderboard.crash.betAmount`]: newLeaderboardValue,
              },
            });
            // Update local credit
            this.socketServer
              .to(String(user._id))
              .emit("update-wallet", newCreditValue);

            // Update user's race progress if there is an active race
            // await checkAndEnterRace(
            //     user.id,
            //     Math.abs(parseFloat(betAmount.toFixed(2)))
            // );

            // Calculate house edge
            // const houseRake =
            //   parseFloat(betAmount.toFixed(2)) * CCrashConfig.houseEdge;

            // Apply 5% rake to current race prize pool
            // await checkAndApplyRakeToRace(houseRake * 0.05);

            // Apply user's rakeback if eligible
            // await checkAndApplyRakeback(user.id, houseRake);

            // Apply cut of house edge to user's affiliator
            // await checkAndApplyAffiliatorCut(user.id, houseRake);

            // Creating new bet object
            const siteUser = await this.userService.getSiteUserData();

            if (siteUser) {
              let newSiteCreditValue = 0;

              if (siteUser?.credit) {
                newSiteCreditValue = (siteUser?.credit || 0) + betAmount;
              } else {
                newSiteCreditValue = betAmount;
              }

              await this.userService.updateById(SITE_USER_ID, {
                $set: {
                  [`credit`]: newSiteCreditValue,
                  [`leaderboard.crash.winAmount`]: newSiteCreditValue,
                },
              });
            } else {
              logger.error(this.logoPrefix + "Couldn't find site user!");
            }

            const newAdminCreditTxData = {
              userId: new mongoose.Types.ObjectId(user._id),
              amount: -Math.abs(betAmount),
              reason: "Crash Auto Bet",
              extraData: {
                crashGameId: CrashGameSocketController.gameStatus._id,
              },
            };

            await this.siteTransactionService.create(newAdminCreditTxData);

            // Creating new bet object
            const newBet: IBetType = {
              autoCashOut: cashoutPoint,
              betAmount,
              playerID: String(user._id),
              username: user.username,
              avatar: user.avatar,
              level: getVipLevelFromWager(user!.wager ?? 0),
              status: CBET_STATES.Playing,
              forcedCashout: true,
              autobet: true,
            };

            // Updating in db
            const updateParam = { $set: {} };
            updateParam.$set["players." + user._id] = newBet;
            await this.crashGameService.updateById(
              CrashGameSocketController.gameStatus._id as any,
              updateParam
            );

            // Assign to state
            CrashGameSocketController.gameStatus.players[user._id] = newBet;
            CrashGameSocketController.gameStatus.pendingCount--;

            const formattedBet =
              CrashGameSocketController.formatPlayerBet(newBet);
            CrashGameSocketController.gameStatus.pendingBets.push(formattedBet);
            this.emitPlayerBets();

            this.socketServer
              .to(String(user._id))
              .emit("auto-crashgame-join-success", "Autobet is running.");
          }
        });
      } catch (error) {
        logger.error(
          this.logoPrefix +
            "Error while starting a crash game with auto bets:" +
            error
        );
      }

      // bet for previous betters
      try {
        const previousBettingPlayerIds: string[] = Object.keys(
          CrashGameSocketController.gameStatus.pending
        );
        previousBettingPlayerIds.map(async (playerId) => {
          const user = await this.userService.getItemById(playerId);
          if (user) {
            const { betAmount, autoCashOut } =
              CrashGameSocketController.gameStatus.pending[playerId];
            const newCreditValue =
              user!.credit - Math.abs(parseFloat(betAmount.toFixed(2)));
            const newWagerValue =
              user!.wager + Math.abs(parseFloat(betAmount.toFixed(2)));
            const newWagerNeededForWithdrawValue =
              user!.wagerNeededForWithdraw +
              Math.abs(parseFloat(betAmount.toFixed(2)));
            const newPlayedNumber = user!.played + 1;

            const newLeaderboardValue =
              (user?.leaderboard?.["crash"]?.betAmount || 0) +
              Math.abs(parseFloat(betAmount.toFixed(2)));

            // Remove bet amount from user's balance
            await this.userService.updateById(playerId, {
              $set: {
                [`credit`]: newCreditValue,
                [`wager`]: newWagerValue,
                [`played`]: newPlayedNumber,
                [`wagerNeededForWithdraw`]: newWagerNeededForWithdrawValue,
                [`leaderboard.crash.betAmount`]: newLeaderboardValue,
              },
            });

            // Update local credit
            this.socketServer
              .to(String(user._id))
              .emit("update-wallet", newCreditValue);

            // Update user's race progress if there is an active race
            // await checkAndEnterRace(
            //     user.id,
            //     Math.abs(parseFloat(betAmount.toFixed(2)))
            // );

            // Calculate house edge
            // const houseRake =
            //   parseFloat(betAmount.toFixed(2)) * CCrashConfig.houseEdge;

            // Apply 5% rake to current race prize pool
            // await checkAndApplyRakeToRace(houseRake * 0.05);

            // Apply user's rakeback if eligible
            // await checkAndApplyRakeback(user.id, houseRake);

            // Apply cut of house edge to user's affiliator
            // await checkAndApplyAffiliatorCut(user.id, houseRake);

            // Creating new bet object
            const siteUser = await this.userService.getSiteUserData();

            if (siteUser) {
              let newSiteCreditValue = 0;

              if (siteUser?.credit) {
                newSiteCreditValue = (siteUser?.credit || 0) + betAmount;
              } else {
                newSiteCreditValue = betAmount;
              }

              await this.userService.updateById(SITE_USER_ID, {
                $set: {
                  [`credit`]: newSiteCreditValue,
                  [`leaderboard.crash.winAmount`]: newSiteCreditValue,
                },
              });
            } else {
              logger.error(this.logoPrefix + "Couldn't find site user!");
            }

            const newAdminCreditTxData = {
              userId: new mongoose.Types.ObjectId(user._id),
              amount: -Math.abs(betAmount),
              reason: "Crash Bet",
              extraData: {
                crashGameId: CrashGameSocketController.gameStatus._id,
              },
            };

            await this.siteTransactionService.create(newAdminCreditTxData);

            // Creating new bet object
            const newBet: IBetType = {
              autoCashOut,
              betAmount,
              playerID: String(user._id),
              username: user.username,
              avatar: user.avatar,
              level: getVipLevelFromWager(user!.wager ?? 0),
              status: CBET_STATES.Playing,
              forcedCashout: true,
              autobet: true,
            };

            // Updating in db
            const updateParam = { $set: {} };
            updateParam.$set["players." + user._id] = newBet;
            await this.crashGameService.updateById(
              CrashGameSocketController.gameStatus._id as any,
              updateParam
            );

            // Assign to state
            CrashGameSocketController.gameStatus.players[user._id] = newBet;
            CrashGameSocketController.gameStatus.pendingCount--;
            delete CrashGameSocketController.gameStatus.pending[user._id];

            const formattedBet =
              CrashGameSocketController.formatPlayerBet(newBet);
            CrashGameSocketController.gameStatus.pendingBets.push(formattedBet);
            this.emitPlayerBets();

            this.socketServer
              .to(String(user._id))
              .emit("auto-crashgame-join-success", newBet);
          }
        });
      } catch (error) {
        logger.error(
          this.logoPrefix +
            "Error while starting a betting from previous betters:" +
            error
        );
      }

      try {
        // Bet a random number of bot players
        const allBots = await this.userBotServices.get();
        const randomNumberOfPlayers = Math.floor(Math.random() * 4) + 8;
        const selectedBotPlayers = allBots
          .sort(() => 0.5 - Math.random())
          .slice(0, randomNumberOfPlayers);

        for (const botPlayer of selectedBotPlayers) {
          const { _id, username, avatar, wager } = botPlayer;
          let botUsername = username;
          const randomSelect = Math.random() * 10;

          if (randomSelect > 3) {
            botUsername = generateUsername("", 0, randomSelect);
          }

          const betAmount = this.getRandomBetAmount();

          const delay = Math.floor(Math.random() * 7 + 2) * 1000; // Generate a random delay between 2-8 seconds

          setTimeout(async () => {
            const CASHOUTNUMBER = this.generateRandomNumber();
            CrashGameSocketController.gameStatus.pending[String(_id)] = {
              betAmount,
              autoCashOut: CASHOUTNUMBER,
              username: botUsername,
            };

            CrashGameSocketController.gameStatus.pendingCount++;

            // Creating new bet object
            const newBet: IBetType = {
              autoCashOut: CASHOUTNUMBER,
              betAmount,
              playerID: String(_id),
              username: botUsername,
              avatar: avatar,
              level: getVipLevelFromWager(wager),
              status: CBET_STATES.Playing,
              forcedCashout: true,
            };

            // Remove bet amount from user's balance
            await this.userBotServices.updateById(_id as string, {
              $inc: {
                wager: Math.abs(parseFloat(betAmount.toFixed(2))),
              },
            });

            // await checkAndEnterRace(
            //     String(_id),
            //     Math.abs(parseFloat(betAmount.toFixed(2)))
            // );

            // Updating in db with bot data
            // const updateParam = { $set: {} };
            // updateParam.$set["players." + _id] = newBet;
            // await this.crashGameService.updateById(
            //   CrashGameSocketController.gameStatus._id.toString(),
            //   updateParam
            // );

            // Assign to state
            CrashGameSocketController.gameStatus.players[String(_id)] = newBet;
            CrashGameSocketController.gameStatus.pendingCount--;

            CrashGameSocketController.gameStatus.botCount++;
            CrashGameSocketController.gameStatus.bots[String(_id)] = newBet;

            const formattedBet =
              CrashGameSocketController.formatPlayerBet(newBet);
            CrashGameSocketController.gameStatus.pendingBets.push(formattedBet);
            this.emitPlayerBets();
          }, delay);
        }
      } catch (error) {
        logger.error(this.logoPrefix + "Error Crash" + error);
        CrashGameSocketController.gameStatus.pendingCount--;
      }
    } catch (error) {
      logger.error(this.logoPrefix + "Error running game: " + error);
    }

    this.emitStarting();
  };

  // Emits the start of the game and handles blocking
  private emitStarting = () => {
    // Emiting starting to clients
    this.socketServer.emit("game-starting", {
      _id: CrashGameSocketController.gameStatus._id!.toString(),
      privateHash: CrashGameSocketController.gameStatus.privateHash,
      timeUntilStart: CTime.restart_wait_time,
    });

    setTimeout(this.blockGame, CTime.restart_wait_time - 500);
  };

  private blockGame = () => {
    CrashGameSocketController.gameStatus.status = CGAME_STATES.Blocking;

    const loop = (): NodeJS.Timeout => {
      const ids: string[] = Object.keys(
        CrashGameSocketController.gameStatus.pending
      );

      if (CrashGameSocketController.gameStatus.pendingCount > 0) {
        logger.info(
          this.logoPrefix +
            `Delaying game while waiting for ${ids.length} (${ids.join(", ")}) join(s)`
        );
        return setTimeout(loop, 50);
      }

      this.startGame();
      return null as any; // To ensure return type consistency, though `startGame` should ideally be typed as `void`
    };

    loop();
  };

  private startGame = async () => {
    try {
      // Generate random data
      const randomData = await generateCrashRandom(
        CrashGameSocketController.gameStatus.privateSeed
      );
      const players = await _.map(
        CrashGameSocketController.gameStatus.players,
        (p) => CrashGameSocketController.formatPlayerBet(p)
      );
      const realPlayers = await Promise.all(
        players.map(async (player) => {
          const realPlayer = await this.userService.getItemById(
            player.playerID
          );
          return realPlayer ? player : null;
        })
      ).then((results) => results.filter((player) => player !== null));
      let realBetAmount = 0;

      for (let i = 0; i < realPlayers.length; i++) {
        const realPlayer = realPlayers[i];
        realBetAmount += realPlayer.betAmount;
      }

      const hashRandom = parseInt(randomData.publicSeed.slice(0, 52 / 4), 16);
      const limitBetAmount = generateMersenneTwisterRandom(
        hashRandom,
        CLimitCrashPoint.amount.min,
        CLimitCrashPoint.amount.max
      );

      if (realBetAmount >= limitBetAmount) {
        const limitCashPoint = generateMersenneTwisterRandom(
          hashRandom,
          CLimitCrashPoint.stopPoint.min,
          CLimitCrashPoint.stopPoint.max
        );

        if (randomData.crashPoint > limitCashPoint) {
          const randomSelect = Math.random() * 10;

          if (randomSelect > 4) {
            const limitCashPoint = generateMersenneTwisterRandom(
              hashRandom,
              101,
              175
            );
            randomData.crashPoint = Math.floor(limitCashPoint);
          }
        }
      }

      // Overriding game state
      CrashGameSocketController.gameStatus.status = CGAME_STATES.InProgress;
      CrashGameSocketController.gameStatus.crashPoint = randomData.crashPoint;
      CrashGameSocketController.gameStatus.publicSeed = randomData.publicSeed;
      CrashGameSocketController.gameStatus.duration = Math.ceil(
        16666.666667 *
          Math.log(0.01 * (CrashGameSocketController.gameStatus.crashPoint + 1))
      );
      CrashGameSocketController.gameStatus.startedAt = new Date();
      CrashGameSocketController.gameStatus.pending = {};
      CrashGameSocketController.gameStatus.pendingCount = 0;
      const realUserCounts =
        (Object.keys(CrashGameSocketController?.gameStatus?.players)?.length ??
          0) - CrashGameSocketController.gameStatus.botCount;

      logger.info(
        this.logoPrefix +
          `Starting new game ${CrashGameSocketController.gameStatus._id} with crash point ${CrashGameSocketController.gameStatus.crashPoint / 100}, user count: ${realUserCounts}, bot count: ${CrashGameSocketController.gameStatus.botCount}`
      );

      // Updating in db
      await this.crashGameService.updateById(
        CrashGameSocketController.gameStatus._id as any,
        {
          status: CGAME_STATES.InProgress,
          crashPoint: CrashGameSocketController.gameStatus.crashPoint,
          publicSeed: CrashGameSocketController.gameStatus.publicSeed,
          startedAt: CrashGameSocketController.gameStatus.startedAt,
          userCounts: realUserCounts,
        }
      );

      // Emiting start to clients
      this.socketServer.emit("game-start", {
        publicSeed: CrashGameSocketController.gameStatus.publicSeed,
      });

      this.callTick(0);
    } catch (error) {
      logger.error(
        this.logoPrefix + `Error while starting a crash game: ${error}`
      );

      // Notify clients that we had an error
      this.socketServer.emit(
        "notify-error",
        "Our server couldn't connect to EOS Blockchain, retrying in 15s"
      );

      // Timeout to retry
      const timeout: NodeJS.Timeout = setTimeout(() => {
        // Retry starting the game
        this.startGame();

        clearTimeout(timeout);
      }, 15000);
    }
  };

  public callTick = (elapsed: number) => {
    // Calculate next tick
    const left = CrashGameSocketController.gameStatus.duration! - elapsed;
    const nextTick = Math.max(0, Math.min(left, CTime.tick_rate));
    setTimeout(this.runTick, nextTick);
  };

  public runTick = () => {
    // Calculate elapsed time
    const elapsed =
      Date.now() - CrashGameSocketController.gameStatus.startedAt!.getTime();
    const at = Math.floor(100 * Math.pow(Math.E, 0.00006 * elapsed));

    // Completing all auto cashouts
    this.runCashOuts(at);

    // Check if crash point is reached
    if (at > CrashGameSocketController.gameStatus.crashPoint!) {
      this.endGame();
    } else {
      const gamePayout =
        Math.floor(
          100 * Math.floor(100 * Math.pow(Math.E, 0.00006 * elapsed))
        ) / 100;
      const gamePayoutValue = Math.max(gamePayout, 1);
      this.socketServer.emit("game-tick", {
        e: elapsed,
        p: gamePayoutValue / 100,
      });
      this.callTick(elapsed);
    }
  };

  public runCashOuts = (elapsed: number) => {
    _.each(CrashGameSocketController.gameStatus.players, (bet) => {
      // Check if bet is still active
      if (bet.status !== CBET_STATES.Playing) {
        return;
      }

      // Check if the auto cashout is reached or max profit is reached
      // console.log({ elapsed, bet, crashPoint: CrashGameSocketController.gameStatus.crashPoint })
      if (
        bet.autoCashOut >= 101 &&
        bet.autoCashOut <= elapsed &&
        bet.autoCashOut <= CrashGameSocketController.gameStatus.crashPoint!
      ) {
        this.doCashOut(
          bet.playerID,
          bet.autoCashOut,
          false,
          (err: Error | null) => {
            if (err) {
              logger.error(
                this.logoPrefix +
                  `There was an error while trying to cashout ${err}`
              );
            }
          }
        );
      }
      // else if (
      //   bet.betAmount * (elapsed / 100) >= CCrashConfig.maxProfit &&
      //   elapsed <= CrashGameSocketController.gameStatus.crashPoint!
      // ) {
      //   console.log("MAX_LIMMIT_AUTOCASHOUT");
      //   this.doCashOut(bet.playerID, elapsed, false, (err: Error | null) => {
      //     if (err) {
      //       logger.error(
      //         this.logoPrefix +
      //         `There was an error while trying to cashout ${err}`
      //       );
      //     }
      //   });
      // }
    });
  };

  public doCashOut = async (
    playerID: string,
    elapsed: number,
    forced: boolean,
    cb: (err: Error | null, result?: any) => void
  ) => {
    logger.info(
      this.logoPrefix +
        `Doing cashout, userId: ${playerID}, elapsed: ${elapsed}`
    );

    const player = CrashGameSocketController.gameStatus.players[playerID];
    if (!player || player.status !== CBET_STATES.Playing) {
      return;
    }

    // Update player state
    player.status = CBET_STATES.CashedOut;
    player.stoppedAt = elapsed;
    player.forcedCashout = forced;

    // Calculate winning amount
    let winningAmount =
      player.autoCashOut && player.stoppedAt
        ? parseFloat((player.betAmount * (player.stoppedAt / 100)).toFixed(2)) *
          (1 - CCrashConfig.houseEdge)
        : 0;

    winningAmount *= 1 - CCrashConfig.houseEdge;

    player.winningAmount = winningAmount;
    cb(null, player);

    CrashGameSocketController.gameStatus.players[playerID] = player;

    // Emit cashout to clients
    this.socketServer.emit("bet-cashout", {
      userdata: player,
      status: player.status,
      stoppedAt: player.stoppedAt,
      winningAmount,
    });

    const players = await _.map(
      CrashGameSocketController.gameStatus.players,
      (p) => CrashGameSocketController.formatPlayerBet(p)
    );
    this.socketServer.emit("game-status", {
      players,
      gameStatus: CrashGameSocketController.gameStatus,
    });

    const profit = player.betAmount * (player.stoppedAt / 100 - 1);
    const playUser = await this.userService.getItemById(playerID);

    if (playUser) {
      const updates = {
        credit: (playUser.credit ?? 0) + Math.abs(winningAmount),
        [`profit.total`]: profit,
        [`leaderboard.crash.winAmount`]:
          (playUser.leaderboard?.["crash"]?.winAmount || 0) + winningAmount,
      };
      if (profit > playUser.profit.high) {
        updates[`profit.high`] = profit;
      }

      await this.userService.updateById(playerID, { $set: updates });

      await this.gameHistoryService.create({
        playerId: new mongoose.Types.ObjectId(player.playerID),
        gameId: CrashGameSocketController.gameStatus._id,
        gamePoint: CrashGameSocketController.gameStatus.crashPoint! / 100,
        playerBet: player.betAmount,
        playerPoint: player.stoppedAt! / 100,
        profit,
        netProfit: playUser.profit.total,
        playedAt: new Date(),
      });

      // Update local credit
      this.socketServer.to(playerID).emit("update-wallet", updates.credit);

      // Add revenue to the site credit
      const siteUser = await this.userService.getSiteUserData();
      if (siteUser) {
        const siteUpdates = {
          credit: (siteUser.credit || 0) - winningAmount,
          [`leaderboard.crash.winAmount`]:
            (siteUser.leaderboard?.["crash"]?.winAmount || 0) - winningAmount,
        };
        await this.userService.updateById(SITE_USER_ID, { $set: siteUpdates });

        await this.siteTransactionService.create({
          userId: new mongoose.Types.ObjectId(playerID),
          amount: Math.abs(winningAmount),
          reason: "Crash Win",
          extraData: { crashGameId: CrashGameSocketController.gameStatus._id },
        });
      } else {
        logger.error(this.logoPrefix + "Couldn't find site user!");
      }

      // Update player in db
      await this.crashGameService.updateById(
        CrashGameSocketController.gameStatus._id as any,
        { $set: { [`players.${playerID}`]: player } }
      );
    }
  };

  public endGame = async () => {
    logger.info(
      this.logoPrefix +
        `Ending game at ${CrashGameSocketController.gameStatus.crashPoint! / 100}`
    );

    const crashTime = Date.now();

    CrashGameSocketController.gameStatus.status = CGAME_STATES.Over;

    // Notify clients
    this.socketServer.emit("game-end", {
      game: {
        _id: CrashGameSocketController.gameStatus._id,
        privateHash: CrashGameSocketController.gameStatus.privateHash ?? null,
        privateSeed: CrashGameSocketController.gameStatus.privateSeed ?? null,
        publicSeed: CrashGameSocketController.gameStatus.publicSeed ?? null,
        crashPoint: CrashGameSocketController.gameStatus.crashPoint,
      },
    });

    // Run new game after start wait time
    setTimeout(
      () => {
        this.runGame();
      },
      crashTime + CTime.start_wait_time - Date.now()
    );

    await Promise.all(
      _.map(CrashGameSocketController.gameStatus.players, async (bet) => {
        // Check if bet is still active
        if (bet.status !== CBET_STATES.Playing) return;

        const player = await this.userService.updateById(bet.playerID, {
          $inc: {
            "profit.total": -bet.betAmount,
          },
        });
        if (player) {
          if (player.profit.low < bet.betAmount) {
            await this.userService.updateById(bet.playerID, {
              "profit.low": bet.betAmount,
            });
          }

          await this.gameHistoryService.create({
            playerId: new mongoose.Types.ObjectId(bet.playerID),
            gameId: CrashGameSocketController.gameStatus._id,
            gamePoint: CrashGameSocketController.gameStatus.crashPoint! / 100,
            playerBet: bet.betAmount,
            playerPoint: 0,
            profit: -bet.betAmount,
            netProfit: player.profit.total,
            playedAt: new Date(),
          });
        }
      })
    );

    // Updating in db
    await this.crashGameService.updateById(
      CrashGameSocketController.gameStatus._id as any,
      {
        status: CGAME_STATES.Over,
      }
    );
  };

  private generateRandomNumber = () => {
    const min = 105;
    const max = 2000;

    // Generate a random number between 0 and 1
    const random = Math.random();

    let randomNumber: number;

    if (random < 0.3) {
      // 30% chance of a number below 150
      randomNumber = min + Math.random() * (150 - min);
    } else if (random < 0.5) {
      // 20% chance of a number below 200
      randomNumber = min + Math.random() * (200 - min);
    } else if (random < 0.7) {
      // 20% chance of a number below 300
      randomNumber = min + Math.random() * (300 - min);
    } else {
      // Remaining 30% can be any value below 2000
      randomNumber = min + Math.random() * (max - min);
    }

    return randomNumber;
  };

  private getRandomBetAmount = () => {
    const min = 1;
    const max = 100;

    const randomNumber = Math.random();
    let betAmount;

    if (randomNumber <= 0.95) {
      // 95% chance for bets between min and max
      if (Math.random() <= 0.65) {
        // 65% chance for bets without decimals (full numbers)
        betAmount = Math.floor(Math.random() * (max - min + 1)) + min; // Generates a random integer between min and max (inclusive)
      } else {
        // 35% chance for bets with decimals
        betAmount = Math.random() * (max - min) + min; // Generates a random decimal number between min and max
      }
    } else {
      // 5% chance for bets between min and max
      if (Math.random() <= 0.65) {
        // 65% chance for bets without decimals (full numbers)
        betAmount = Math.floor(Math.random() * (max - min + 1)) + min; // Generates a random integer number between min and max
      } else {
        // 35% chance for bets with decimals
        betAmount = Math.random() * (max - min) + min; // Generates a random decimal number between min and max
      }
    }

    return parseFloat(betAmount.toFixed(2));
  };

  private createNewGameBySeed = async () => {
    try {
      // Generate pre-roll provably fair data
      const privatePairs = await generatePrivateSeedHashPair();
      const newGamePayload = {
        privateSeed: privatePairs.seed,
        privateHash: privatePairs.hash,
        players: {},
        status: CGAME_STATES.Starting,
      };
      const newGame = await this.crashGameService.create(newGamePayload);
      logger.info(this.logoPrefix + "New game created: " + newGame._id);
      return newGame;
    } catch (error) {
      logger.error(this.logoPrefix + "Error creating new game: ", error);
    }
  };
}

export default CrashGameSocketListener;
