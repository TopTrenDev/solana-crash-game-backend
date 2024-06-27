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

// src/common/models/User.ts
var User_exports = {};
__export(User_exports, {
  default: () => User_default
});
module.exports = __toCommonJS(User_exports);
var import_mongoose = __toESM(require("mongoose"));
var { Schema, Types } = import_mongoose.default;
var UserSchema = new Schema({
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
var User = import_mongoose.default.model("User", UserSchema);
var User_default = User;
//# sourceMappingURL=User.js.map