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

// src/common/models/Race.ts
var Race_exports = {};
__export(Race_exports, {
  default: () => Race_default
});
module.exports = __toCommonJS(Race_exports);
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
//# sourceMappingURL=Race.js.map