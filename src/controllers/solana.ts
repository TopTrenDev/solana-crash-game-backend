import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';

export const createWallet = () => {
  const newKepair = new web3.Keypair();
  const publicKey = newKepair.publicKey.toString();
  const privateKey = bs58.encode(Buffer.from(newKepair.secretKey));
  return { publicKey, privateKey };
};

export const importWallet = (privateKey: string) => {
  const privateKeyBuffer = bs58.decode(privateKey);
  const privateKeyUint8Array = new Uint8Array(privateKeyBuffer);
  const keypair = web3.Keypair.fromSecretKey(privateKeyUint8Array);
  const publicKey = keypair.publicKey.toBase58();
  return { publicKey, privateKey };
};
