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

// src/common/models/WalletTransaction.ts
var WalletTransaction_exports = {};
__export(WalletTransaction_exports, {
  default: () => WalletTransaction_default
});
module.exports = __toCommonJS(WalletTransaction_exports);
var import_mongoose = __toESM(require("mongoose"));
var { Schema, SchemaTypes } = import_mongoose.default;
var WalletTransactionSchema = new Schema({
  // Amount that was increased or decreased
  amount: Number,
  // Reason for this wallet transaction
  reason: String,
  // Extra data relating to this transaction
  // game data, crypto transaction data, etc.
  extraData: {
    coinflipGameId: {
      type: SchemaTypes.ObjectId,
      ref: "CoinflipGame"
    },
    jackpotGameId: {
      type: SchemaTypes.ObjectId,
      ref: "JackpotGame"
    },
    rouletteGameId: {
      type: SchemaTypes.ObjectId,
      ref: "RouletteGame"
    },
    crashGameId: {
      type: SchemaTypes.ObjectId,
      ref: "CrashGame"
    },
    transactionId: {
      type: SchemaTypes.ObjectId,
      ref: "CryptoTransaction"
    },
    couponId: {
      type: SchemaTypes.ObjectId,
      ref: "CouponCode"
    },
    affiliatorId: {
      type: SchemaTypes.ObjectId,
      ref: "User"
    },
    modifierId: {
      type: SchemaTypes.ObjectId,
      ref: "User"
    },
    raceId: {
      type: SchemaTypes.ObjectId,
      ref: "Race"
    },
    triviaGameId: {
      type: SchemaTypes.ObjectId,
      ref: "Trivia"
    }
  },
  // What user does this belong to
  _user: {
    type: SchemaTypes.ObjectId,
    ref: "User"
  },
  // When document was inserted
  created: {
    type: Date,
    default: Date.now
  }
});
var WalletTransaction = import_mongoose.default.model("WalletTransaction", WalletTransactionSchema);
var WalletTransaction_default = WalletTransaction;
//# sourceMappingURL=WalletTransaction.js.map