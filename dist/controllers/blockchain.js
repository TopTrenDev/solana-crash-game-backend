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

// src/controllers/blockchain.ts
var blockchain_exports = {};
__export(blockchain_exports, {
  generateHex: () => generateHex,
  getPublicSeed: () => getPublicSeed
});
module.exports = __toCommonJS(blockchain_exports);
var import_eosjs = require("eosjs");

// src/config/index.ts
var blochain = {
  // EOS Blockchain provider API root url
  // without following slashes
  httpProviderApi: "http://eos.greymass.com"
};

// src/controllers/blockchain.ts
var import_node_fetch = __toESM(require("node-fetch"));
var rpc = new import_eosjs.JsonRpc(blochain.httpProviderApi, { fetch: import_node_fetch.default });
var getPublicSeed = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const info = await rpc.get_info();
      const blockNumber = info.last_irreversible_block_num + 1;
      const block = await rpc.get_block(blockNumber || 1);
      resolve(block.id);
    } catch (error) {
      reject(error);
    }
  });
};
var generateHex = () => {
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += Math.floor(Math.random() * 16).toString(16).padStart(2, "0");
  }
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateHex,
  getPublicSeed
});
//# sourceMappingURL=blockchain.js.map