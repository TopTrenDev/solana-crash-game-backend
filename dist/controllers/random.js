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

// src/controllers/random.ts
var random_exports = {};
__export(random_exports, {
  generateCoinflipRandom: () => generateCoinflipRandom,
  generateCrashRandom: () => generateCrashRandom,
  generatePrivateSeedHashPair: () => generatePrivateSeedHashPair
});
module.exports = __toCommonJS(random_exports);

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
var blochain = {
  // EOS Blockchain provider API root url
  // without following slashes
  httpProviderApi: "http://eos.greymass.com"
};

// src/controllers/random.ts
var import_crypto = __toESM(require("crypto"));
var import_chance = __toESM(require("chance"));

// src/controllers/blockchain.ts
var import_eosjs = require("eosjs");
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
var generateCoinflipRandom = async (gameId, privateSeed) => {
  return new Promise(async (resolve, reject) => {
    try {
      const publicSeed = await getPublicSeed();
      const chance = new import_chance.default(`${privateSeed}-${gameId}-${publicSeed}`);
      const module2 = chance.floating({ min: 0, max: 60, fixed: 7 });
      resolve({ publicSeed, module: module2 });
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  generateCoinflipRandom,
  generateCrashRandom,
  generatePrivateSeedHashPair
});
//# sourceMappingURL=random.js.map