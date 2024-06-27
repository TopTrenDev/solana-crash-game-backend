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

// src/controllers/race.ts
var race_exports = {};
__export(race_exports, {
  checkAndApplyRakeToRace: () => checkAndApplyRakeToRace,
  checkAndEnterRace: () => checkAndEnterRace
});
module.exports = __toCommonJS(race_exports);

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

// src/config/index.ts
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkAndApplyRakeToRace,
  checkAndEnterRace
});
//# sourceMappingURL=race.js.map