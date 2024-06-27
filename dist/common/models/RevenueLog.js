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

// src/common/models/RevenueLog.ts
var RevenueLog_exports = {};
__export(RevenueLog_exports, {
  default: () => RevenueLog_default
});
module.exports = __toCommonJS(RevenueLog_exports);
var import_mongoose = __toESM(require("mongoose"));
var Schema = import_mongoose.default.Schema;
var RevenueSchema = new Schema({
  // Winner id
  userid: {
    type: Schema.Types.ObjectId,
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
var RevenueLog = import_mongoose.default.model(
  "RevenueLog",
  RevenueSchema
);
var RevenueLog_default = RevenueLog;
//# sourceMappingURL=RevenueLog.js.map