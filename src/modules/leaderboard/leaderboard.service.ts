// need add model to mongo index file
import mongoose from "mongoose";

import { ALLOW_GAME_LIST, SITE_USER_ID } from "@/config";
import BaseService from "@/utils/base/service";
import { User } from "@/utils/db";
import logger from "@/utils/logger";

// need add types
import { TLeaderboardDocumentType } from "./leaderboard.types";
import { PaymentService } from "../payment";

export class LeaderboardService extends BaseService<TLeaderboardDocumentType> {
  private gameList = ALLOW_GAME_LIST;
  private paymentService: PaymentService;

  constructor() {
    super(User);
    this.paymentService = new PaymentService();
  }

  getTopLeaderboards = async (count: number) => {
    const ignoreId = SITE_USER_ID;
    const leaderboard: { [key: string]: TLeaderboardDocumentType[] } = {};

    for (const game of this.gameList) {
      const createPipeline = () => [
        {
          $match: { _id: { $ne: new mongoose.Types.ObjectId(ignoreId) } },
        },
        {
          $addFields: {
            totalBetAmount: `$wager`,
          },
        },
        { $sort: { totalBetAmount: -1 as 1 | -1 } },
        { $limit: count },
        {
          $project: {
            _id: 1,
            username: 1,
            leaderboard: 1,
            avatar: 1,
            createdAt: 1,
            hasVerifiedAccount: 1,
            totalBetAmount: 1,
            rank: 1,
          },
        },
      ];

      const gameLeaderboard = await this.aggregateByPipeline(createPipeline());

      leaderboard[game] = gameLeaderboard;
    }

    return leaderboard;
  };

  getStats = async () => {
    const ignoreId = SITE_USER_ID;

    const createPipeline = () => [
      {
        $match: { _id: { $ne: new mongoose.Types.ObjectId(ignoreId) } },
      },
      {
        $group: {
          _id: null, // Grouping without specific field to aggregate all documents
          totalWageredAmount: { $sum: "$wager" }, // Summing up the 'wager' field
          totalUsers: { $sum: 1 }, // Counting the number of users
        },
      },
    ];

    const stats = await this.aggregateByPipeline(createPipeline());

    const bankroll = await this.paymentService.getAdminBalance();

    return { ...stats[0], bankroll };
  };

  fetchTopPlayers = async (
    count: number
  ): Promise<{ [key: string]: { winners: any[]; losers: any[] } } | []> => {
    try {
      const dashboard: { [key: string]: { winners: any[]; losers: any[] } } =
        {};
      const ignoreId = SITE_USER_ID;

      const createPipeline = (game: string, sortOrder: 1 | -1) => [
        {
          $match: { _id: { $ne: new mongoose.Types.ObjectId(ignoreId) } },
        },
        {
          $addFields: {
            totalWinAmount: {
              $sum: {
                $map: {
                  input: {
                    $objectToArray: `$leaderboard.${game}`,
                  },
                  as: "item",
                  in: { $toDouble: "$$item.v" },
                },
              },
            },
          },
        },
        {
          $addFields: {
            totalBetAmount: {
              $sum: {
                $map: {
                  input: {
                    $objectToArray: `$leaderboard.${game}`,
                  },
                  as: "item",
                  in: { $toDouble: "$$item.v" },
                },
              },
            },
          },
        },
        {
          $addFields: {
            profit: {
              $subtract: ["$totalWinAmount", "$totalBetAmount"],
            },
          },
        },
        {
          $match: {
            profit: sortOrder === -1 ? { $gt: 0 } : { $lt: 0 },
          },
        },
        { $sort: { profit: sortOrder } },
        { $limit: count },
      ];

      for (const game of this.gameList) {
        const winnersPipeline = createPipeline(game, -1);
        const losersPipeline = createPipeline(game, 1);

        const winners = await User.aggregate(winnersPipeline);
        const losers = await User.aggregate(losersPipeline);

        dashboard[game] = { winners, losers };
      }

      return dashboard;
    } catch (ex) {
      logger.error("Error finding top players", ex);
      return [];
    }
  };
}
