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

// src/common/utils/connetDatabase.ts
var connetDatabase_exports = {};
__export(connetDatabase_exports, {
  default: () => connetDatabase_default
});
module.exports = __toCommonJS(connetDatabase_exports);

// src/config/index.ts
var database = {
  developmentMongoURI: "mongodb://127.0.0.1:27017/solcrash",
  // MongoURI to use in development
  productionMongoURI: "mongodb+srv://oliverb25f:FujiOka8-1225@cluster0.ughyjc0.mongodb.net/crash"
  // MongoURI to use in production
};

// src/common/utils/connetDatabase.ts
var import_mongoose = __toESM(require("mongoose"));
var MONGO_URI = process.env.NODE_ENV === "production" ? database.productionMongoURI : database.developmentMongoURI;
var connectDatabase = async () => {
  try {
    await import_mongoose.default.connect(MONGO_URI);
    console.log("MongoDB >> Connected!");
  } catch (error) {
    console.log(`MongoDB ERROR >> ${error.message}`);
    process.exit(1);
  }
};
var connetDatabase_default = connectDatabase;
//# sourceMappingURL=connetDatabase.js.map