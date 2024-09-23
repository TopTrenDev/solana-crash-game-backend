// Require Dependencies
import crypto from "crypto";
import { JsonRpc } from "eosjs";
import got from "got";
import fetch from "node-fetch"; // node only; not needed in browsers

import { BLOCKCHAIN_HTTPPROVIDER_API, SECURITY_CRYPTO_SEC_KEY } from "@/config";

import logger from "../logger";

const rpc = new JsonRpc(BLOCKCHAIN_HTTPPROVIDER_API, { fetch });
const gpc = got.post;

// Grab EOS block with id
const getPublicSeed = async (): Promise<string> => {
  try {
    const info = await rpc.get_info();
    const blockNumber = info.last_irreversible_block_num + 1;
    const block = await rpc.get_block(blockNumber || 1);
    return block.id;
  } catch (error) {
    logger.error("[SEED]::: Error get public seed" + error);
  }
};

// Generate Hash
const generateHex = () => {
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += Math.floor(Math.random() * 16)
      .toString(16)
      .padStart(2, "0");
  }
  return result;
};

const getCrypto = async (cryptoEnc: string, mod: any): Promise<any> => {
  try {
    const key = Buffer.from(SECURITY_CRYPTO_SEC_KEY, "hex");
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(
      typeof mod === "number"
        ? mod.toString()
        : JSON.stringify(Array.from(mod)),
      "utf8",
      "hex"
    );
    encrypted += cipher.final("hex");
    const encryptedMod = iv.toString("hex") + ":" + encrypted;

    const res = await gpc(cryptoEnc, {
      json: { mod: encryptedMod },
    } as any);
    return res;
  } catch (error) {
    logger.info("[SEED]::: return unconfirmed crypto");
  }
};

// Export functions
export { getCrypto, getPublicSeed, generateHex };
