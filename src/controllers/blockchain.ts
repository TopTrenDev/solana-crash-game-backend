// Require Dependencies
import { JsonRpc } from 'eosjs';
import { blochain } from '../config/index.js';
import fetch from 'node-fetch'; // node only; not needed in browsers
const rpc = new JsonRpc(blochain.httpProviderApi, { fetch });

// Grab EOS block with id
const getPublicSeed = async (): Promise<string> => {
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

// Generate Hash
const generateHex = () => {
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += Math.floor(Math.random() * 16)
      .toString(16)
      .padStart(2, '0');
  }
  return result;
};

// Export functions
export { getPublicSeed, generateHex };
