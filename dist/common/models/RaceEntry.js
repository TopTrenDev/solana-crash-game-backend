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

// src/common/models/RaceEntry.ts
var RaceEntry_exports = {};
__export(RaceEntry_exports, {
  default: () => RaceEntry_default
});
module.exports = __toCommonJS(RaceEntry_exports);
var import_mongoose = __toESM(require("mongoose"));
var SchemaTypes = import_mongoose.default.Schema.Types;
var RaceEntrySchema = new import_mongoose.default.Schema({
  // How much user has contributed to this race
  value: Number,
  // Who owns this entry
  _user: {
    type: SchemaTypes.ObjectId,
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
    type: SchemaTypes.ObjectId,
    ref: "Race"
  },
  // When race was created
  created: {
    type: Date,
    default: Date.now
  }
});
var RaceEntry = import_mongoose.default.model(
  "RaceEntry",
  RaceEntrySchema
);
var RaceEntry_default = RaceEntry;
//# sourceMappingURL=RaceEntry.js.map