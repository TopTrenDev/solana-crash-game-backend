"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/api/crash/crash.ts
var crash_exports = {};
__export(crash_exports, {
  formatGame: () => formatGame,
  formatGameHistory: () => formatGameHistory,
  getCurrentGame: () => getCurrentGame,
  getGameHistory: () => getGameHistory,
  getPrivateHash: () => getPrivateHash,
  listen: () => listen
});
module.exports = __toCommonJS(crash_exports);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
var import_lodash = __toESM(require("lodash"));

// src/controllers/throttler.ts
var import_safe = __toESM(require("colors/safe.js"));
var TIME_LIMIT = 250;
var throttleConnections = (socket) => (packet, next) => {
  if (canBeServed(socket, packet))
    return next();
  else
    return socket.emit("notify-error", "Slow down! You must wait a while before doing that again.");
};
var canBeServed = (socket, packet) => {
  if (socket.data.markedForDisconnect)
    return false;
  const previous = socket.data.lastAccess;
  const now = Date.now();
  if (previous) {
    const diff = now - previous;
    if (packet[0] === "auth") {
      socket.data.lastAccess = now;
      return true;
    }
    if (diff < TIME_LIMIT) {
      socket.data.markedForDisconnect = true;
      const clientIp = socket.handshake.headers["x-real-ip"];
      setTimeout(() => {
        console.log(
          import_safe.default.gray("Socket >> IP:"),
          import_safe.default.white(String(clientIp)),
          import_safe.default.gray(`Packet: [${packet.toString()}] NSP: ${socket.nsp.name} Disconnected, reason:`),
          import_safe.default.red("TOO_MANY_EMITS")
        );
        socket.emit("connection_kicked");
        socket.disconnect(true);
      }, 1e3);
      return false;
    }
  }
  socket.data.lastAccess = now;
  return true;
};
var throttler_default = throttleConnections;

// src/config/index.ts
var site = {
  // Site configurations on server startup
  enableMaintenanceOnStart: false,
  manualWithdrawsEnabled: true,
  enableLoginOnStart: true,
  // Site endpoints
  backend: {
    productionUrl: "",
    //kujiracasino.com is virtual domain
    developmentUrl: "http://localhost:8080"
  },
  frontend: {
    productionUrl: "",
    //localhost do http://localhost:3000 // else if you deploy it put "https://kujiracasino.com"
    developmentUrl: "http://localhost:3000"
  },
  adminFrontend: {
    productionUrl: "",
    developmentUrl: ""
  }
};
var games = {
  exampleGame: {
    minBetAmount: 1,
    // Min bet amount (in coins)
    maxBetAmount: 1e5,
    // Max bet amount (in coins)
    feePercentage: 0.1
    // House fee percentage
  },
  race: {
    prizeDistribution: [40, 20, 14.5, 7, 5.5, 4.5, 3.5, 2.5, 1.5, 1]
    // How is the prize distributed (place = index + 1)
  },
  vip: {
    minDepositForWithdraw: 5,
    // You must have deposited atleast this amount before withdrawing
    minWithdrawAmount: 5,
    // Minimum Withdraw Amount
    levelToChat: 2,
    // The level amount you need to chat
    levelToTip: 15,
    // The level to use the tip feature in chat
    levelToRain: 10,
    // The level amount to start a rain
    wagerToJoinRain: 5,
    // The wager amount to join the rain in chat
    minRakebackClaim: 2,
    // The min rakeback amount you need to claim rakeback
    numLevels: 500,
    // Number of total levels
    minWager: 0,
    // minWager
    maxWager: 502007,
    // maxWager
    rakeback: 21.66,
    // Max rakeback
    vipLevelNAME: ["Beginner", "Professional", "Expert", "Crown"],
    vipLevelCOLORS: ["rgb(215, 117, 88)", "rgb(71, 190, 219)", "rgb(96, 183, 100)", "rgb(152, 38, 38)"]
  },
  affiliates: {
    earningPercentage: 10
    // How many percentage of house edge the affiliator will get
  },
  coinflip: {
    minBetAmount: 0.1,
    // Min bet amount (in coins)
    maxBetAmount: 1e5,
    // Max bet amount (in coins)
    feePercentage: 0.05
    // House fee percentage
  },
  crash: {
    minBetAmount: 0.1,
    // Min bet amount (in coins)
    maxBetAmount: 100,
    // Max bet amount (in coins)
    maxProfit: 500,
    // Max profit on crash, forces auto cashout
    houseEdge: 0.05
    // House edge percentage
  }
};
var blochain = {
  // EOS Blockchain provider API root url
  // without following slashes
  httpProviderApi: "http://eos.greymass.com"
};
var authentication = {
  jwtSecret: "vf4Boy2WT1bVgphxFqjEY2GjciChkXvf4Boy2WT1hkXv2",
  // Secret used to sign JWT's. KEEP THIS AS A SECRET 45 length
  jwtExpirationTime: 36e4,
  // JWT-token expiration time (in seconds)
  revenueId: "65ab8f6ed19ce703808382b2"
};

// src/api/crash/crash.ts
var import_colors = __toESM(require("colors"));

// src/controllers/random.ts
var import_crypto = __toESM(require("crypto"));
var import_chance = __toESM(require("chance"));

// src/controllers/blockchain.ts
var import_eosjs = require("eosjs");
var import_node_fetch = __toESM(require("node-fetch"));
var rpc = new import_eosjs.JsonRpc(blochain.httpProviderApi, { fetch: import_node_fetch.default });
var generateHex = () => {
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += Math.floor(Math.random() * 16).toString(16).padStart(2, "0");
  }
  return result;
};

// src/controllers/random.ts
var generatePrivateSeed = async () => {
  return new Promise((resolve, reject) => {
    import_crypto.default.randomBytes(256, (error, buffer) => {
      if (error)
        reject(error);
      else
        resolve(buffer.toString("hex"));
    });
  });
};
var buildPrivateHash = async (seed) => {
  return new Promise((resolve, reject) => {
    try {
      const hash = import_crypto.default.createHash("sha256").update(seed).digest("hex");
      resolve(hash);
    } catch (error) {
      reject(error);
    }
  });
};
var generatePrivateSeedHashPair = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const seed = await generatePrivateSeed();
      const hash = await buildPrivateHash(seed);
      resolve({ seed, hash });
    } catch (error) {
      reject(error);
    }
  });
};
var generateCrashRandom = async (privateSeed) => {
  return new Promise(async (resolve, reject) => {
    try {
      const publicSeed = generateHex();
      const crashPoint = generateCrashPoint(privateSeed, publicSeed);
      resolve({ publicSeed, crashPoint });
    } catch (error) {
      reject(error);
    }
  });
};
var generateCrashPoint = (seed, salt) => {
  const hash = import_crypto.default.createHmac("sha256", seed).update(salt).digest("hex");
  const hs = Math.floor(100 / (games.crash.houseEdge * 100));
  if (isCrashHashDivisible(hash, hs)) {
    return 100;
  }
  const h = parseInt(hash.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);
  return Math.floor((100 * e - h) / (e - h));
};
var isCrashHashDivisible = (hash, mod) => {
  let val = 0;
  let o = hash.length % 4;
  for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
    val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
  }
  return val === 0;
};

// src/common/models/Race.ts
var import_mongoose = __toESM(require("mongoose"));
var { Schema, Types: SchemaTypes } = import_mongoose.default;
var RaceSchema = new Schema({
  // Basic fields
  active: Boolean,
  prize: Number,
  endingDate: Date,
  // Race winners
  winners: {
    type: [
      {
        type: SchemaTypes.ObjectId,
        ref: "User"
      }
    ],
    default: []
  },
  // When race was created
  created: {
    type: Date,
    default: Date.now
  }
});
var Race = import_mongoose.default.model("Race", RaceSchema);
var Race_default = Race;

// src/common/models/RaceEntry.ts
var import_mongoose2 = __toESM(require("mongoose"));
var SchemaTypes2 = import_mongoose2.default.Schema.Types;
var RaceEntrySchema = new import_mongoose2.default.Schema({
  // How much user has contributed to this race
  value: Number,
  // Who owns this entry
  _user: {
    type: SchemaTypes2.ObjectId,
    ref: "User"
  },
  user_level: {
    type: String
  },
  user_levelColor: {
    type: String
  },
  username: {
    type: String
  },
  avatar: {
    type: String
  },
  // What race is this entry for
  _race: {
    type: SchemaTypes2.ObjectId,
    ref: "Race"
  },
  // When race was created
  created: {
    type: Date,
    default: Date.now
  }
});
var RaceEntry = import_mongoose2.default.model(
  "RaceEntry",
  RaceEntrySchema
);
var RaceEntry_default = RaceEntry;

// src/common/models/User.ts
var import_mongoose3 = __toESM(require("mongoose"));
var { Schema: Schema2, Types } = import_mongoose3.default;
var UserSchema = new Schema2({
  // Authentication related fields
  provider: String,
  providerId: String,
  username: String,
  password: String,
  avatar: String,
  // User's on-site rank
  rank: {
    type: Number,
    default: 1
    /**
     * Ranks:
     *
     * 1 = User
     * 2 = Sponsor
     * 3 = Developer
     * 4 = Moderator
     * 5 = Admin
     */
  },
  // Site balance
  wallet: {
    type: Number,
    default: 0
  },
  // Wager amount
  wager: {
    type: Number,
    default: 0
  },
  // Holds user's crypto address information (addresses)
  crypto: Object,
  // Whether the user has verified their account (via mobile phone or csgo loyalty badge) normal it is false
  hasVerifiedAccount: {
    type: Boolean,
    default: true
  },
  // Store their phone number to prevent multi-account verifications
  verifiedPhoneNumber: {
    type: String,
    default: null
  },
  // When the account was verified
  accountVerified: {
    type: Date,
    default: null
  },
  // Unix ms timestamp when the ban will end, 0 = no ban
  banExpires: {
    type: String,
    default: "0"
  },
  // Unix ms timestamps when the self-exclude will end, 0 = no ban
  selfExcludes: {
    crash: {
      type: Number,
      default: 0
    },
    jackpot: {
      type: Number,
      default: 0
    },
    coinflip: {
      type: Number,
      default: 0
    },
    roulette: {
      type: Number,
      default: 0
    }
  },
  // Unix ms timestamp when the mute will end, 0 = no mute
  muteExpires: {
    type: String,
    default: "0"
  },
  // If user has restricted transactions
  transactionsLocked: {
    type: Boolean,
    default: false
  },
  // If user has restricted bets
  betsLocked: {
    type: Boolean,
    default: false
  },
  // UserID of the user who affiliated
  _affiliatedBy: {
    type: Types.ObjectId,
    ref: "User",
    default: null
  },
  // When the affiliate was redeemed
  affiliateClaimed: {
    type: Date,
    default: null
  },
  // Unique affiliate code
  affiliateCode: {
    type: String,
    default: null
    // unique: true, // doesn't work with multiple "null" values :(
  },
  // User affiliation bonus amount
  affiliateMoney: {
    type: Number,
    default: 0
  },
  // How much affiliation bonus has been claimed (withdrawn)
  affiliateMoneyCollected: {
    type: Number,
    default: 0
  },
  // Forgot Password
  forgotToken: {
    type: String,
    default: null
  },
  forgotExpires: {
    type: Number,
    default: 0
  },
  // How much rakeback has been collected
  rakebackBalance: {
    type: Number,
    default: 0
  },
  // Keep track of 50% deposit amount
  // required by mitch :/
  wagerNeededForWithdraw: {
    type: Number,
    default: 0
  },
  // Total amount of deposits
  totalDeposited: {
    type: Number,
    default: 0
  },
  // Total amount of withdraws
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  // User custom wager limit (for sponsors)
  customWagerLimit: {
    type: Number,
    default: 0
  },
  // User avatar last update
  avatarLastUpdate: {
    type: Number,
    default: 0
  },
  // When user was created (registered)
  created: {
    type: Date,
    default: Date.now
  }
});
var User = import_mongoose3.default.model("User", UserSchema);
var User_default = User;

// src/common/models/Usero.ts
var import_mongoose4 = __toESM(require("mongoose"));
var { Schema: Schema3, SchemaTypes: SchemaTypes3 } = import_mongoose4.default;
var UseroSchema = new Schema3({
  // Authentication related fields
  provider: String,
  providerId: String,
  username: String,
  password: String,
  avatar: String,
  // User's on-site rank
  rank: {
    type: Number,
    default: 1
    /**
     * Ranks:
     *
     * 1 = User
     * 2 = Sponsor
     * 3 = Developer
     * 4 = Moderator
     * 5 = Admin
     */
  },
  // Site balance
  wallet: {
    type: Number,
    default: 0
  },
  // Wager amount
  wager: {
    type: Number,
    default: 0
  },
  // Holds user's crypto address information (addresses)
  crypto: Object,
  // Whether the user has verified their account (via mobile phone or csgo loyalty badge) normal it is false
  hasVerifiedAccount: {
    type: Boolean,
    default: true
  },
  // Store their phone number to prevent multi-account verifications
  verifiedPhoneNumber: {
    type: String,
    default: null
  },
  // When the account was verified
  accountVerified: {
    type: Date,
    default: null
  },
  // Unix ms timestamp when the ban will end, 0 = no ban
  banExpires: {
    type: String,
    default: "0"
  },
  // Unix ms timestamps when the self-exclude will end, 0 = no ban
  selfExcludes: {
    crash: {
      type: Number,
      default: 0
    },
    jackpot: {
      type: Number,
      default: 0
    },
    coinflip: {
      type: Number,
      default: 0
    },
    roulette: {
      type: Number,
      default: 0
    }
  },
  // Unix ms timestamp when the mute will end, 0 = no mute
  muteExpires: {
    type: String,
    default: "0"
  },
  // If user has restricted transactions
  transactionsLocked: {
    type: Boolean,
    default: false
  },
  // If user has restricted bets
  betsLocked: {
    type: Boolean,
    default: false
  },
  // UserID of the user who affiliated
  _affiliatedBy: {
    type: SchemaTypes3.ObjectId,
    ref: "User",
    default: null
  },
  // When the affiliate was redeemed
  affiliateClaimed: {
    type: Date,
    default: null
  },
  // Unique affiliate code
  affiliateCode: {
    type: String,
    default: null
    // unique: true, // doesn't work with multiple "null" values :(
  },
  // User affiliation bonus amount
  affiliateMoney: {
    type: Number,
    default: 0
  },
  // How much affiliation bonus has been claimed (withdrawn)
  affiliateMoneyCollected: {
    type: Number,
    default: 0
  },
  // Forgot Password
  forgotToken: {
    type: String,
    default: null
  },
  forgotExpires: {
    type: Number,
    default: 0
  },
  // How much rakeback has been collected
  rakebackBalance: {
    type: Number,
    default: 0
  },
  // Keep track of 50% deposit amount
  // required by mitch :/
  wagerNeededForWithdraw: {
    type: Number,
    default: 0
  },
  // Total amount of deposits
  totalDeposited: {
    type: Number,
    default: 0
  },
  // Total amount of withdraws
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  // User custom wager limit (for sponsors)
  customWagerLimit: {
    type: Number,
    default: 0
  },
  // User avatar last update
  avatarLastUpdate: {
    type: Number,
    default: 0
  },
  // When user was created (registered)
  created: {
    type: Date,
    default: Date.now
  }
});
var Usero = import_mongoose4.default.model("Usero", UseroSchema);
var Usero_default = Usero;

// src/controllers/vip.ts
var { numLevels, minWager, maxWager, rakeback, vipLevelNAME, vipLevelCOLORS } = games.vip;
var generateVIPLevels = (numLevels2, minWager2, maxWager2, rakeback2, levelNames, levelColors) => {
  const levels = [];
  for (let i = 0; i < numLevels2; i++) {
    const level = {
      name: (i + 1).toString(),
      wagerNeeded: (minWager2 + (maxWager2 - minWager2) * Math.pow(i / numLevels2, 2)).toFixed(2),
      rakebackPercentage: (rakeback2 / (1 + Math.exp(-5 * (i / numLevels2 - 0.5)))).toFixed(2),
      levelName: levelNames[Math.floor(i * levelNames.length / numLevels2)],
      levelColor: levelColors[Math.floor(i * levelColors.length / numLevels2)]
    };
    levels.push(level);
  }
  return levels;
};
var vipLevels = generateVIPLevels(numLevels, minWager, maxWager, rakeback, vipLevelNAME, vipLevelCOLORS);
var getVipLevelFromWager = (wager) => {
  if (wager < vipLevels[1].wagerNeeded) {
    return vipLevels[0];
  } else if (wager > vipLevels[numLevels - 1].wagerNeeded) {
    return vipLevels[numLevels - 1];
  } else {
    return vipLevels.filter((level) => wager >= level.wagerNeeded).sort((a, b) => b.wagerNeeded - a.wagerNeeded)[0];
  }
};
var checkAndApplyRakeback = async (userId, houseRake) => {
  return new Promise(async (resolve, reject) => {
    try {
      const usero = await Usero_default.findOne({ _id: userId });
      if (usero) {
        resolve();
        return;
      }
      const user = await User_default.findOne({ _id: userId });
      if (!user) {
        resolve();
        return;
      }
      const currentLevel = getVipLevelFromWager(user.wager);
      await User_default.updateOne(
        { _id: user.id },
        {
          $inc: { rakebackBalance: houseRake * (currentLevel.rakebackPercentage / 100) }
        }
      );
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// src/controllers/race.ts
async function checkAndEnterRace(userId, amount) {
  return new Promise(async (resolve, reject) => {
    try {
      const activeRace = await Race_default.findOne({ active: true });
      if (activeRace) {
        const users = await Usero_default.findOne({ _id: userId });
        if (users) {
          const user = await Usero_default.findOne({ _id: userId });
          if (!user || user.rank > 1) {
            return resolve();
          }
          const existingEntry = await RaceEntry_default.findOne({
            _user: userId,
            _race: activeRace.id
          });
          if (existingEntry) {
            await RaceEntry_default.updateOne(
              { _id: existingEntry.id },
              {
                $inc: { value: amount },
                $set: {
                  user_level: getVipLevelFromWager(user.wager).name,
                  user_levelColor: getVipLevelFromWager(user.wager).levelColor,
                  username: user.username,
                  avatar: user.avatar
                }
              }
            );
          } else {
            const newEntry = new RaceEntry_default({
              value: amount,
              _user: userId,
              user_level: getVipLevelFromWager(user.wager).name,
              user_levelColor: getVipLevelFromWager(user.wager).levelColor,
              _race: activeRace.id,
              username: user.username,
              avatar: user.avatar
            });
            await newEntry.save();
          }
        } else {
          const user = await User_default.findOne({ _id: userId });
          if (!user || user.rank > 1) {
            return resolve();
          }
          const existingEntry = await RaceEntry_default.findOne({
            _user: userId,
            _race: activeRace.id
          });
          if (existingEntry) {
            await RaceEntry_default.updateOne(
              { _id: existingEntry.id },
              {
                $inc: { value: amount },
                $set: {
                  user_level: getVipLevelFromWager(user.wager).name,
                  user_levelColor: getVipLevelFromWager(user.wager).levelColor,
                  username: user.username,
                  avatar: user.avatar
                }
              }
            );
          } else {
            const newEntry = new RaceEntry_default({
              value: amount,
              _user: userId,
              user_level: getVipLevelFromWager(user.wager).name,
              user_levelColor: getVipLevelFromWager(user.wager).levelColor,
              _race: activeRace.id,
              username: user.username,
              avatar: user.avatar
            });
            await newEntry.save();
          }
        }
        resolve();
      } else {
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}
async function checkAndApplyRakeToRace(rakeValue) {
  return new Promise(async (resolve, reject) => {
    try {
      const activeRace = await Race_default.findOne({ active: true });
      if (activeRace) {
        await Race_default.updateOne({ _id: activeRace.id }, { $inc: { prize: 0 } });
        resolve();
      } else {
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}

// src/controllers/affiliates.ts
async function checkAndApplyAffiliatorCut(userId, houseRake) {
  return new Promise(async (resolve, reject) => {
    try {
      const usero = await Usero_default.findOne({ _id: userId });
      if (usero) {
        resolve();
        return;
      }
      const user = await User_default.findOne({ _id: userId });
      if (!user) {
        resolve();
        return;
      }
      const affiliator = await User_default.findOne({ _id: user._affiliatedBy });
      if (affiliator) {
        await User_default.updateOne(
          { _id: affiliator.id },
          {
            $inc: {
              affiliateMoney: houseRake * (games.affiliates.earningPercentage / 100)
            }
          }
        );
        resolve();
      } else {
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}

// src/controllers/site-settings.ts
var MAINTENANCE_ENABLED = site.enableMaintenanceOnStart;
var LOGIN_ENABLED = site.enableLoginOnStart;
var CRASH_ENABLED = true;
var getCrashState = () => CRASH_ENABLED;

// src/common/models/WalletTransaction.ts
var import_mongoose5 = __toESM(require("mongoose"));
var { Schema: Schema4, SchemaTypes: SchemaTypes4 } = import_mongoose5.default;
var WalletTransactionSchema = new Schema4({
  // Amount that was increased or decreased
  amount: Number,
  // Reason for this wallet transaction
  reason: String,
  // Extra data relating to this transaction
  // game data, crypto transaction data, etc.
  extraData: {
    coinflipGameId: {
      type: SchemaTypes4.ObjectId,
      ref: "CoinflipGame"
    },
    jackpotGameId: {
      type: SchemaTypes4.ObjectId,
      ref: "JackpotGame"
    },
    rouletteGameId: {
      type: SchemaTypes4.ObjectId,
      ref: "RouletteGame"
    },
    crashGameId: {
      type: SchemaTypes4.ObjectId,
      ref: "CrashGame"
    },
    transactionId: {
      type: SchemaTypes4.ObjectId,
      ref: "CryptoTransaction"
    },
    couponId: {
      type: SchemaTypes4.ObjectId,
      ref: "CouponCode"
    },
    affiliatorId: {
      type: SchemaTypes4.ObjectId,
      ref: "User"
    },
    modifierId: {
      type: SchemaTypes4.ObjectId,
      ref: "User"
    },
    raceId: {
      type: SchemaTypes4.ObjectId,
      ref: "Race"
    },
    triviaGameId: {
      type: SchemaTypes4.ObjectId,
      ref: "Trivia"
    }
  },
  // What user does this belong to
  _user: {
    type: SchemaTypes4.ObjectId,
    ref: "User"
  },
  // When document was inserted
  created: {
    type: Date,
    default: Date.now
  }
});
var WalletTransaction = import_mongoose5.default.model("WalletTransaction", WalletTransactionSchema);
var WalletTransaction_default = WalletTransaction;

// src/common/utils/insertNewWalletTransaction.ts
var insertNewWalletTransaction = async (userId, amount, reason, extraData) => {
  try {
    const data = { _user: userId, amount, reason, extraData };
    const newTransaction = new WalletTransaction_default(data);
    await newTransaction.save();
    return newTransaction.toObject();
  } catch (error) {
    console.error("Error while inserting wallet transaction!", error);
    throw new Error("Failed to insert wallet transaction!");
  }
};
var insertNewWalletTransaction_default = insertNewWalletTransaction;

// src/common/models/CrashGame.ts
var import_mongoose6 = __toESM(require("mongoose"));
var CrashGameSchema = new import_mongoose6.default.Schema(
  {
    // Basic fields
    crashPoint: Number,
    players: Object,
    refundedPlayers: Array,
    // Provably Fair fields
    privateSeed: String,
    privateHash: String,
    publicSeed: {
      type: String,
      default: null
    },
    // Game status
    status: {
      type: Number,
      default: 1
      /**
       * Status list:
       *
       * 1 = Not Started
       * 2 = Starting
       * 3 = In Progress
       * 4 = Over
       * 5 = Blocking
       * 6 = Refunded
       */
    },
    // When game was created
    created: {
      type: Date,
      default: Date.now
    },
    // When game was started
    startedAt: {
      type: Date
    }
  },
  {
    minimize: false
  }
);
var CrashGame = import_mongoose6.default.model("CrashGame", CrashGameSchema);
var CrashGame_default = CrashGame;

// src/common/models/RevenueLog.ts
var import_mongoose7 = __toESM(require("mongoose"));
var Schema5 = import_mongoose7.default.Schema;
var RevenueSchema = new Schema5({
  // Winner id
  userid: {
    type: Schema5.Types.ObjectId,
    ref: "users",
    required: true
  },
  // Revenue type 4: coinflip, 3: jackpot, 1: roulette, 2: crash
  revenueType: {
    type: Number,
    required: true
  },
  // Balance
  revenue: {
    type: Number,
    require: true
  },
  // Last balance
  lastBalance: {
    type: Number,
    require: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});
var RevenueLog = import_mongoose7.default.model(
  "RevenueLog",
  RevenueSchema
);
var RevenueLog_default = RevenueLog;

// src/api/crash/crash.ts
var TICK_RATE = 150;
var START_WAIT_TIME = 4e3;
var RESTART_WAIT_TIME = 9e3;
var growthFunc = (ms) => Math.floor(100 * Math.pow(Math.E, 6e-5 * ms));
var inverseGrowth = (result) => 16666.666667 * Math.log(0.01 * result);
var GAME_STATES = {
  NotStarted: 1,
  Starting: 2,
  InProgress: 3,
  Over: 4,
  Blocking: 5,
  Refunded: 6
};
var BET_STATES = {
  Playing: 1,
  CashedOut: 2
};
var GAME_STATE = {
  _id: null,
  status: GAME_STATES.Starting,
  crashPoint: null,
  startedAt: null,
  duration: null,
  players: {},
  pending: {},
  pendingCount: 0,
  pendingBets: [],
  privateSeed: null,
  privateHash: null,
  publicSeed: null
};
var getCurrentGame = () => formatGame(GAME_STATE);
var getPrivateHash = () => GAME_STATE.privateSeed;
var formatGame = (game) => {
  const formatted = {
    _id: game._id,
    status: game.status,
    startedAt: game.startedAt,
    elapsed: Date.now() - game.startedAt.getTime(),
    players: import_lodash.default.map(game.players, (p) => formatPlayerBet(p)),
    privateHash: game.privateHash,
    publicSeed: game.publicSeed
  };
  if (game.status === GAME_STATES.Over && game.crashPoint) {
    formatted.crashPoint = game.crashPoint;
  }
  return formatted;
};
var formatGameHistory = (game) => {
  const formatted = {
    _id: game._id,
    createdAt: game.createdAt,
    privateHash: game.privateHash,
    privateSeed: game.privateSeed,
    publicSeed: game.publicSeed,
    crashPoint: game.crashPoint / 100
  };
  return formatted;
};
var formatPlayerBet = (bet) => {
  const formatted = {
    playerID: bet.playerID,
    username: bet.username,
    avatar: bet.avatar,
    betAmount: bet.betAmount,
    status: bet.status,
    level: bet.level
  };
  if (bet.status !== BET_STATES.Playing) {
    formatted.stoppedAt = bet.stoppedAt;
    formatted.winningAmount = bet.winningAmount;
  }
  return formatted;
};
var calculateGamePayout = (ms) => {
  const gamePayout = Math.floor(100 * growthFunc(ms)) / 100;
  return Math.max(gamePayout, 1);
};
var getGameHistory = async (limit) => {
  try {
    return await CrashGame_default.aggregate([
      {
        $match: {
          status: GAME_STATES.Over
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $limit: limit ? limit : 20
      }
    ]);
  } catch (e) {
    console.error(e);
    return [];
  }
};
var listen = (io) => {
  const _emitPendingBets = () => {
    const bets = GAME_STATE.pendingBets;
    GAME_STATE.pendingBets = [];
    io.of("/crash").emit("game-bets", bets);
  };
  const emitPlayerBets = import_lodash.default.throttle(_emitPendingBets, 600);
  const createNewGame = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const provablyData = await generatePrivateSeedHashPair();
        const newGame = new CrashGame_default({
          privateSeed: provablyData.seed,
          privateHash: provablyData.hash,
          players: {},
          status: GAME_STATES.Starting
        });
        await newGame.save();
        console.log(import_colors.default.cyan("Crash >> Generated new game with the id"), newGame._id);
        resolve(newGame);
      } catch (error) {
        console.log(import_colors.default.cyan(`Crash >> Couldn't create a new game ${error}`));
        reject(error);
      }
    });
  };
  const runGame = async () => {
    const game = await createNewGame();
    GAME_STATE._id = game._id.toString();
    GAME_STATE.status = GAME_STATES.Starting;
    GAME_STATE.privateSeed = game.privateSeed;
    GAME_STATE.privateHash = game.privateHash;
    GAME_STATE.publicSeed = null;
    GAME_STATE.startedAt = new Date(Date.now() + RESTART_WAIT_TIME);
    GAME_STATE.players = {};
    game.startedAt = GAME_STATE.startedAt;
    await game.save();
    const getRandomSubset = (array, subsetSize) => {
      const shuffledArray = array.sort(() => 0.5 - Math.random());
      return shuffledArray.slice(0, subsetSize);
    };
    const getRandomBetAmount = () => {
      const randomNumber = Math.random();
      let betAmount;
      if (randomNumber <= 0.95) {
        if (Math.random() <= 0.65) {
          betAmount = Math.floor(Math.random() * 8) + 1;
        } else {
          betAmount = Math.random() * (8 - 0.1) + 0.1;
        }
      } else {
        if (Math.random() <= 0.65) {
          betAmount = Math.floor(Math.random() * (120.2 - 8)) + 8;
        } else {
          betAmount = Math.random() * (120.2 - 8) + 8;
        }
      }
      return parseFloat(betAmount.toFixed(2));
    };
    try {
      const allPlayers = await Usero_default.find({});
      const randomNumberOfPlayers = Math.floor(Math.random() * 4) + 8;
      const selectedPlayers = getRandomSubset(allPlayers, randomNumberOfPlayers);
      selectedPlayers.forEach((fakeUser, index) => {
        const { username, avatar, wager, _id } = fakeUser;
        const betAmount = getRandomBetAmount();
        const delay = Math.floor(Math.random() * 7 + 2) * 1e3;
        function generateRandomNumber() {
          const min = 105;
          const max = 2e3;
          const random = Math.random();
          let randomNumber;
          if (random < 0.3) {
            randomNumber = min + Math.random() * (150 - min);
          } else if (random < 0.5) {
            randomNumber = min + Math.random() * (200 - min);
          } else if (random < 0.7) {
            randomNumber = min + Math.random() * (300 - min);
          } else {
            randomNumber = min + Math.random() * (max - min);
          }
          return randomNumber;
        }
        setTimeout(async () => {
          const CASHOUTNUMBER = generateRandomNumber();
          GAME_STATE.pending[String(_id)] = {
            betAmount,
            autoCashOut: CASHOUTNUMBER,
            username
          };
          GAME_STATE.pendingCount++;
          const newBet = {
            autoCashOut: CASHOUTNUMBER,
            betAmount,
            createdAt: /* @__PURE__ */ new Date(),
            playerID: String(_id),
            username,
            avatar,
            level: getVipLevelFromWager(wager),
            status: BET_STATES.Playing,
            forcedCashout: true
          };
          await Usero_default.updateOne(
            { _id },
            {
              $inc: {
                wager: Math.abs(parseFloat(betAmount.toFixed(2)))
              }
            }
          );
          await checkAndEnterRace(String(_id), Math.abs(parseFloat(betAmount.toFixed(2))));
          const updateParam = { $set: {} };
          updateParam.$set["players." + _id] = newBet;
          await CrashGame_default.updateOne({ _id: GAME_STATE._id }, updateParam);
          GAME_STATE.players[String(_id)] = newBet;
          GAME_STATE.pendingCount--;
          const formattedBet = formatPlayerBet(newBet);
          GAME_STATE.pendingBets.push(formattedBet);
          return emitPlayerBets();
        }, delay);
      });
    } catch (error) {
      console.log("ERROR Crash", error);
      GAME_STATE.pendingCount--;
    }
    emitStarting();
  };
  const emitStarting = () => {
    io.of("/crash").emit("game-starting", {
      _id: GAME_STATE._id,
      privateHash: GAME_STATE.privateHash,
      timeUntilStart: RESTART_WAIT_TIME
    });
    setTimeout(blockGame, RESTART_WAIT_TIME - 500);
  };
  const blockGame = () => {
    GAME_STATE.status = GAME_STATES.Blocking;
    const loop = () => {
      const ids = Object.keys(GAME_STATE.pending);
      if (GAME_STATE.pendingCount > 0) {
        console.log(import_colors.default.cyan(`Crash >> Delaying game while waiting for ${ids.length} (${ids.join(", ")}) join(s)`));
        return setTimeout(loop, 50);
      }
      startGame();
      return null;
    };
    loop();
  };
  const startGame = async () => {
    try {
      const randomData = await generateCrashRandom(GAME_STATE.privateSeed);
      GAME_STATE.status = GAME_STATES.InProgress;
      GAME_STATE.crashPoint = randomData.crashPoint;
      GAME_STATE.publicSeed = randomData.publicSeed;
      GAME_STATE.duration = Math.ceil(inverseGrowth(GAME_STATE.crashPoint + 1));
      GAME_STATE.startedAt = /* @__PURE__ */ new Date();
      GAME_STATE.pending = {};
      GAME_STATE.pendingCount = 0;
      console.log(
        import_colors.default.cyan("Crash >> Starting new game"),
        GAME_STATE._id,
        import_colors.default.cyan("with crash point"),
        GAME_STATE.crashPoint / 100
      );
      await CrashGame_default.updateOne(
        { _id: GAME_STATE._id },
        {
          status: GAME_STATES.InProgress,
          crashPoint: GAME_STATE.crashPoint,
          publicSeed: GAME_STATE.publicSeed,
          startedAt: GAME_STATE.startedAt
        }
      );
      io.of("/crash").emit("game-start", {
        publicSeed: GAME_STATE.publicSeed
      });
      callTick(0);
    } catch (error) {
      console.log("Error while starting a crash game:", error);
      io.of("/crash").emit("notify-error", "Our server couldn't connect to EOS Blockchain, retrying in 15s");
      const timeout = setTimeout(() => {
        startGame();
        clearTimeout(timeout);
      }, 15e3);
    }
  };
  const callTick = (elapsed) => {
    const left = GAME_STATE.duration - elapsed;
    const nextTick = Math.max(0, Math.min(left, TICK_RATE));
    setTimeout(runTick, nextTick);
  };
  const runTick = () => {
    const elapsed = Date.now() - GAME_STATE.startedAt.getTime();
    const at = growthFunc(elapsed);
    runCashOuts(at);
    if (at > GAME_STATE.crashPoint) {
      endGame();
    } else {
      tick(elapsed);
    }
  };
  const runCashOuts = (elapsed) => {
    import_lodash.default.each(GAME_STATE.players, (bet) => {
      if (bet.status !== BET_STATES.Playing)
        return;
      if (bet.autoCashOut >= 101 && bet.autoCashOut <= elapsed && bet.autoCashOut <= GAME_STATE.crashPoint) {
        doCashOut(bet.playerID, bet.autoCashOut, false, (err) => {
          if (err) {
            console.log(import_colors.default.cyan(`Crash >> There was an error while trying to cashout`), err);
          }
        });
      } else if (bet.betAmount * (elapsed / 100) >= games.crash.maxProfit && elapsed <= GAME_STATE.crashPoint) {
        doCashOut(bet.playerID, elapsed, true, (err) => {
          if (err) {
            console.log(import_colors.default.cyan(`Crash >> There was an error while trying to cashout`), err);
          }
        });
      }
    });
  };
  const doCashOut = async (playerID, elapsed, forced, cb) => {
    if (GAME_STATE.players[playerID].status !== BET_STATES.Playing)
      return;
    GAME_STATE.players[playerID].status = BET_STATES.CashedOut;
    GAME_STATE.players[playerID].stoppedAt = elapsed;
    if (forced)
      GAME_STATE.players[playerID].forcedCashout = true;
    const bet = GAME_STATE.players[playerID];
    let winningAmount = 0;
    if (bet.autoCashOut !== void 0 && bet.stoppedAt !== void 0) {
      winningAmount = parseFloat(
        (bet.betAmount * ((bet.autoCashOut === bet.stoppedAt ? bet.autoCashOut : bet.stoppedAt) / 100)).toFixed(2)
      );
    } else {
      console.error("Error: autoCashOut or stoppedAt is undefined.");
    }
    const houseAmount = winningAmount * games.crash.houseEdge;
    winningAmount *= 1 - games.crash.houseEdge;
    console.log("winningAmount", winningAmount);
    GAME_STATE.players[playerID].winningAmount = winningAmount;
    if (cb)
      cb(null, GAME_STATE.players[playerID]);
    const { status, stoppedAt } = GAME_STATE.players[playerID];
    io.of("/crash").emit("bet-cashout", {
      playerID,
      status,
      stoppedAt,
      winningAmount
    });
    await User_default.updateOne(
      { _id: playerID },
      {
        $inc: {
          wallet: Math.abs(winningAmount)
        }
      }
    );
    await User_default.updateOne(
      {
        _id: authentication.revenueId
      },
      {
        $inc: {
          wallet: houseAmount
        }
      }
    );
    const siteuser = await User_default.findById(authentication.revenueId);
    const newLog = new RevenueLog_default({
      userid: playerID,
      // Revenue type 4: coinflip, 3: jackpot, 1: roulette, 2: crash
      revenueType: 2,
      // Balance
      revenue: houseAmount,
      lastBalance: siteuser.wallet
    });
    await newLog.save();
    insertNewWalletTransaction_default(playerID, Math.abs(winningAmount), "Crash win", {
      crashGameId: GAME_STATE._id
    });
    io.of("/crash").to(playerID).emit("update-wallet", Math.abs(winningAmount));
    const updateParam = { $set: {} };
    updateParam.$set["players." + playerID] = GAME_STATE.players[playerID];
    await CrashGame_default.updateOne({ _id: GAME_STATE._id }, updateParam);
  };
  const endGame = async () => {
    console.log(import_colors.default.cyan(`Crash >> Ending game at`), GAME_STATE.crashPoint / 100);
    const crashTime = Date.now();
    GAME_STATE.status = GAME_STATES.Over;
    io.of("/crash").emit("game-end", {
      game: formatGameHistory(GAME_STATE)
    });
    setTimeout(
      () => {
        runGame();
      },
      crashTime + START_WAIT_TIME - Date.now()
    );
    await CrashGame_default.updateOne(
      { _id: GAME_STATE._id },
      {
        status: GAME_STATES.Over
      }
    );
  };
  const tick = (elapsed) => {
    io.of("/crash").emit("game-tick", calculateGamePayout(elapsed) / 100);
    callTick(elapsed);
  };
  const refundGames = async (games2) => {
    for (let game of games2) {
      console.log(import_colors.default.cyan(`Crash >> Refunding game`), game._id);
      const refundedPlayers = [];
      try {
        for (let playerID in game.players) {
          const bet = game.players[playerID];
          if (bet.status == BET_STATES.Playing) {
            refundedPlayers.push(playerID);
            console.log(import_colors.default.cyan(`Crash >> Refunding player ${playerID} for ${bet.betAmount}`));
            await User_default.updateOne(
              { _id: playerID },
              {
                $inc: {
                  wallet: Math.abs(bet.betAmount)
                }
              }
            );
            insertNewWalletTransaction_default(playerID, Math.abs(bet.betAmount), "Crash refund", { crashGameId: game._id });
          }
        }
        game.refundedPlayers = refundedPlayers;
        game.status = GAME_STATES.Refunded;
        await game.save();
      } catch (error) {
        console.log(import_colors.default.cyan(`Crash >> Error while refunding crash game ${GAME_STATE._id}: ${error}`));
      }
    }
  };
  const initGame = async () => {
    console.log(import_colors.default.cyan("Crash >> Starting up"));
    const unfinishedGames = await CrashGame_default.find({
      $or: [{ status: GAME_STATES.Starting }, { status: GAME_STATES.Blocking }, { status: GAME_STATES.InProgress }]
    });
    if (unfinishedGames.length > 0) {
      console.log(import_colors.default.cyan(`Crash >> Ending`), unfinishedGames.length, import_colors.default.cyan(`unfinished games`));
      await refundGames(unfinishedGames);
    }
    runGame();
  };
  initGame();
  io.of("/crash").on(
    "connection",
    (socket) => {
      let loggedIn = false;
      let user = null;
      socket.use(throttler_default(socket));
      socket.on("auth", async (token) => {
        if (!token) {
          loggedIn = false;
          user = null;
          return socket.emit("error", "No authentication token provided, authorization declined");
        }
        try {
          const decoded = import_jsonwebtoken.default.verify(token, authentication.jwtSecret);
          user = await User_default.findOne({ _id: decoded.user.id });
          if (user) {
            if (parseInt(user.banExpires) > (/* @__PURE__ */ new Date()).getTime()) {
              loggedIn = false;
              user = null;
              return socket.emit("user banned");
            } else {
              loggedIn = true;
              socket.join(String(user._id));
            }
          }
        } catch (error) {
          loggedIn = false;
          console.log("error handle", error);
          user = null;
          return socket.emit("notify-error", "Authentication token is not valid");
        }
      });
      socket.use(async (packet, next) => {
        if (loggedIn && user) {
          try {
            const dbUser = await User_default.findOne({ _id: user.id });
            if (dbUser && parseInt(dbUser.banExpires) > (/* @__PURE__ */ new Date()).getTime()) {
              return socket.emit("user banned");
            } else {
              return next();
            }
          } catch (error) {
            return socket.emit("user banned");
          }
        } else {
          return next();
        }
      });
      socket.on("previous-crashgame-history", async (limit) => {
        if (typeof limit !== "number" || isNaN(limit))
          return socket.emit("get-crashgame-history-error", "Invalid limit type!");
        const histories = await getGameHistory(limit);
        return socket.emit("previous-crashgame-history-response", histories);
      });
      socket.on("join-game", async (target, betAmount) => {
        if (typeof betAmount !== "number" || isNaN(betAmount))
          return socket.emit("game-join-error", "Invalid betAmount type!");
        if (!loggedIn) {
          return socket.emit("game-join-error", "You are not logged in!");
        }
        const isEnabled = getCrashState();
        if (!isEnabled) {
          return socket.emit("game-join-error", "Crash is currently disabled! Contact admins for more information.");
        }
        const { minBetAmount, maxBetAmount } = games.crash;
        if (parseFloat(betAmount.toFixed(2)) < minBetAmount || parseFloat(betAmount.toFixed(2)) > maxBetAmount) {
          return socket.emit(
            "game-join-error",
            `Your bet must be a minimum of ${minBetAmount} credits and a maximum of ${maxBetAmount} credits!`
          );
        }
        if (GAME_STATE.status !== GAME_STATES.Starting)
          return socket.emit("game-join-error", "Game is currently in progress!");
        if (GAME_STATE.pending[user.id] || GAME_STATE.players[user.id])
          return socket.emit("game-join-error", "You have already joined this game!");
        let autoCashOut = -1;
        if (typeof target === "number" && !isNaN(target) && target > 100) {
          autoCashOut = target;
        }
        GAME_STATE.pending[user.id] = {
          betAmount,
          autoCashOut,
          username: user.username
        };
        GAME_STATE.pendingCount++;
        try {
          const dbUser = await User_default.findOne({ _id: user.id });
          if (dbUser.selfExcludes.crash > Date.now()) {
            return socket.emit(
              "game-join-error",
              `You have self-excluded yourself for another ${((dbUser.selfExcludes.crash - Date.now()) / 36e5).toFixed(1)} hours.`
            );
          }
          if (dbUser.betsLocked) {
            delete GAME_STATE.pending[user.id];
            GAME_STATE.pendingCount--;
            return socket.emit(
              "game-join-error",
              "Your account has an betting restriction. Please contact support for more information."
            );
          }
          if (dbUser.wallet < parseFloat(betAmount.toFixed(2))) {
            delete GAME_STATE.pending[user.id];
            GAME_STATE.pendingCount--;
            return socket.emit("game-join-error", "You can't afford this bet!");
          }
          await User_default.updateOne(
            { _id: user.id },
            {
              $inc: {
                wallet: -Math.abs(parseFloat(betAmount.toFixed(2))),
                wager: Math.abs(parseFloat(betAmount.toFixed(2))),
                wagerNeededForWithdraw: -Math.abs(parseFloat(betAmount.toFixed(2)))
              }
            }
          );
          insertNewWalletTransaction_default(user.id, -Math.abs(parseFloat(betAmount.toFixed(2))), "Crash play", {
            crashGameId: GAME_STATE._id
          });
          socket.emit("update-wallet", -Math.abs(parseFloat(betAmount.toFixed(2))));
          await checkAndEnterRace(user.id, Math.abs(parseFloat(betAmount.toFixed(2))));
          const houseRake = parseFloat(betAmount.toFixed(2)) * games.crash.houseEdge;
          await checkAndApplyRakeToRace(houseRake * 0.05);
          await checkAndApplyRakeback(user.id, houseRake);
          await checkAndApplyAffiliatorCut(user.id, houseRake);
          const newBet = {
            autoCashOut,
            betAmount,
            createdAt: /* @__PURE__ */ new Date(),
            playerID: user.id,
            username: user.username,
            avatar: user.avatar,
            level: getVipLevelFromWager(dbUser.wager),
            status: BET_STATES.Playing,
            forcedCashout: false
          };
          const updateParam = { $set: {} };
          updateParam.$set["players." + user.id] = newBet;
          await CrashGame_default.updateOne({ _id: GAME_STATE._id }, updateParam);
          GAME_STATE.players[user.id] = newBet;
          GAME_STATE.pendingCount--;
          const formattedBet = formatPlayerBet(newBet);
          GAME_STATE.pendingBets.push(formattedBet);
          emitPlayerBets();
          return socket.emit("game-join-success", formattedBet);
        } catch (error) {
          console.error(error);
          delete GAME_STATE.pending[user.id];
          GAME_STATE.pendingCount--;
          return socket.emit("game-join-error", "There was an error while proccessing your bet");
        }
      });
      socket.on("bet-cashout", async () => {
        if (!loggedIn)
          return socket.emit("bet-cashout-error", "You are not logged in!");
        if (GAME_STATE.status !== GAME_STATES.InProgress)
          return socket.emit("bet-cashout-error", "There is no game in progress!");
        const elapsed = Date.now() - GAME_STATE.startedAt.getTime();
        let at = growthFunc(elapsed);
        if (at < 101)
          return socket.emit("bet-cashout-error", "The minimum cashout is 1.01x!");
        const bet = GAME_STATE.players[user.id];
        if (!bet)
          return socket.emit("bet-cashout-error", "Coudn't find your bet!");
        if (bet.autoCashOut > 100 && bet.autoCashOut <= at) {
          at = bet.autoCashOut;
        }
        if (at > GAME_STATE.crashPoint)
          return socket.emit("bet-cashout-error", "The game has already ended!");
        if (bet.status !== BET_STATES.Playing)
          return socket.emit("bet-cashout-error", "You have already cashed out!");
        doCashOut(bet.playerID, at, false, (err, result) => {
          if (err) {
            console.log(import_colors.default.cyan(`Crash >> There was an error while trying to cashout a player`), err);
            return socket.emit("bet-cashout-error", "There was an error while cashing out!");
          }
          socket.emit("bet-cashout-success", result);
        });
      });
    }
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatGame,
  formatGameHistory,
  getCurrentGame,
  getGameHistory,
  getPrivateHash,
  listen
});
//# sourceMappingURL=crash.js.map