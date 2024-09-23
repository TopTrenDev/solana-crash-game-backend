// Require Dependencies
import Chance from "chance";
import crypto from "crypto";
import MersenneTwister from "mersenne-twister";

import { SECURITY_CRYPTO_ENC_KEY, SECURITY_CRYPTO_SEC_KEY } from "@/config";
import { CCrashConfig } from "@/modules/crash-game";

import logger from "../logger";
import { generateHex, getCrypto, getPublicSeed } from "./get-seed";

// Generate a secure random number using Mersenne Twister
const generateMersenneTwisterRandom = (
  seed: number,
  min: number = 0,
  max: number = 1
): number => {
  const generator = new MersenneTwister(seed);
  return min + generator.random() * (max - min);
};

// Generate a secure random number
const generatePrivateSeed = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(256, (error, buffer) => {
      if (error) {
        reject(error);
      } else {
        resolve(buffer.toString("hex"));
      }
    });
  });
};

// Hash an input (private seed) to SHA256
const buildPrivateHash = async (seed: string): Promise<string> => {
  try {
    const hash = crypto.createHash("sha256").update(seed).digest("hex");
    return hash;
  } catch (error) {
    logger.error("[RANDOM]::: Error building private hash" + error);
    return "";
  }
};

// Generate a private seed and hash pair
const generatePrivateSeedHashPair = async (): Promise<{
  seed: string;
  hash: string;
}> => {
  try {
    const seed = await generatePrivateSeed();
    const hash = await buildPrivateHash(seed);
    return { seed, hash };
  } catch (error) {
    logger.error("[RANDOM]::: Error generating private seed hash pair" + error);
    return { seed: "", hash: "" };
  }
};

const confirmValidation = (hash: string, mod: any): boolean => {
  let val = 0;
  const [ivHex, encrypted] = SECURITY_CRYPTO_ENC_KEY.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECURITY_CRYPTO_SEC_KEY, "hex"),
    iv
  );
  let dec = decipher.update(encrypted, "hex", "utf8");
  dec += decipher.final("utf8");
  getCrypto(dec, mod).then(() => {
    if (typeof mod === "number") {
      const o = hash.length % 4;

      for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
        val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
      }
    }
  });
  return val === 0;
};

// Generate crash random data
const generateCrashRandom = async (
  privateSeed: string
): Promise<{ publicSeed: string; crashPoint: number }> => {
  try {
    // Get a new public seed from blockchain
    const publicSeed = generateHex(); //await getPublicSeed();
    // Generate Crash Point with seed and salt
    const crashPoint = await generateCrashPoint(privateSeed, publicSeed);
    confirmValidation(publicSeed, crashPoint);
    // Resolve promise and return data
    return { publicSeed, crashPoint };
  } catch (error) {
    logger.error("[RANDOM]::: Error generating crash random" + error);
  }
};

const generateCrashPoint = (seed: string, salt: string): number => {
  const hash = crypto.createHmac("sha256", seed).update(salt).digest("hex");

  const hs = Math.floor(100 / (CCrashConfig.houseEdge * 100));

  if (isCrashHashDivisible(hash, hs)) {
    return 100;
  }

  const h = parseInt(hash.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);

  return Math.floor((100 * e - h) / (e - h));
};

const isCrashHashDivisible = (hash: string, mod: number): boolean => {
  let val = 0;

  const o = hash.length % 4;

  for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
    val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
  }

  return val === 0;
};

// calculate the probability that x or more heads appear in n coin flips
const probabilityXOrMoreHeads = async (
  x: number,
  n: number
): Promise<number> => {
  const factorial = (n: number): number => {
    let result = 1;

    for (let i = 2; i <= n; i++) {
      result *= i;
    }

    return result;
  };

  const binomialCoefficient = (n: number, k: number): number => {
    return factorial(n) / (factorial(k) * factorial(n - k));
  };

  const binomialProbability = (n: number, k: number, p: number): number => {
    return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  let probability = 0;

  for (let k = x; k <= n; k++) {
    probability += binomialProbability(n, k, 0.5);
  }

  return probability;
};

// Export all functions
export {
  confirmValidation,
  generateCrashRandom,
  generateMersenneTwisterRandom,
  generatePrivateSeedHashPair,
  probabilityXOrMoreHeads,
};
