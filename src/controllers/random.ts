// Require Dependencies
import { games } from '../config/index.js';
import crypto from 'crypto';
import Chance from 'chance';
import { generateHex, getPublicSeed } from './blockchain.js';

// Generate a secure random number
const generatePrivateSeed = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(256, (error, buffer) => {
      if (error) reject(error);
      else resolve(buffer.toString('hex'));
    });
  });
};

// Hash an input (private seed) to SHA256
const buildPrivateHash = async (seed: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const hash = crypto.createHash('sha256').update(seed).digest('hex');

      resolve(hash);
    } catch (error) {
      reject(error);
    }
  });
};

// Generate a private seed and hash pair
const generatePrivateSeedHashPair = async (): Promise<{ seed: string; hash: string }> => {
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

// Generate coinflip random data
const generateCoinflipRandom = async (
  gameId: string,
  privateSeed: string
): Promise<{ publicSeed: string; module: number }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get a new public seed from blockchain
      const publicSeed = await getPublicSeed();

      // Construct a new chance instance with
      // privateSeed-roundId-publicSeed pair
      const chance = new Chance(`${privateSeed}-${gameId}-${publicSeed}`);

      // Generate a random, repeatable module to determine round result
      const module = chance.floating({ min: 0, max: 60, fixed: 7 });

      // Resolve promise and return data
      resolve({ publicSeed, module });
    } catch (error) {
      reject(error);
    }
  });
};

// Generate crash random data
const generateCrashRandom = async (privateSeed: string): Promise<{ publicSeed: string; crashPoint: number }> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get a new public seed from blockchain
      const publicSeed = generateHex(); //await getPublicSeed();
      // Generate Crash Point with seed and salt
      const crashPoint = generateCrashPoint(privateSeed, publicSeed);
      // Resolve promise and return data
      resolve({ publicSeed, crashPoint });
    } catch (error) {
      reject(error);
    }
  });
};

const generateCrashPoint = (seed: string, salt: string): number => {
  const hash = crypto.createHmac('sha256', seed).update(salt).digest('hex');

  const hs = Math.floor(100 / (games.crash.houseEdge * 100));
  if (isCrashHashDivisible(hash, hs)) {
    return 100;
  }

  const h = parseInt(hash.slice(0, 52 / 4), 16);
  const e = Math.pow(2, 52);

  return Math.floor((100 * e - h) / (e - h)) + 4;
};

const isCrashHashDivisible = (hash: string, mod: number): boolean => {
  let val = 0;

  let o = hash.length % 4;
  for (let i = o > 0 ? o - 4 : 0; i < hash.length; i += 4) {
    val = ((val << 16) + parseInt(hash.substring(i, i + 4), 16)) % mod;
  }

  return val === 0;
};

// Export all functions
export { generatePrivateSeedHashPair, generateCoinflipRandom, generateCrashRandom };
