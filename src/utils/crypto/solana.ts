import { ADMIN_WALLET_ADDRESS, RPC_URI } from "@/config";
import * as web3 from "@solana/web3.js";
import bs58 from "bs58";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const solConnection = new web3.Connection(RPC_URI);

export const BANKROLL = web3.Keypair.fromSecretKey(
  bs58.decode(ADMIN_WALLET_ADDRESS)
);

export const createWallet = () => {
  const newKeypair = new web3.Keypair();
  const publicKey = newKeypair.publicKey.toString();
  const privateKey = bs58.encode(Buffer.from(newKeypair.secretKey));
  return { publicKey, privateKey };
};

export const importWallet = (privateKey: string) => {
  const privateKeyBuffer = bs58.decode(privateKey);
  const privateKeyUint8Array = new Uint8Array(privateKeyBuffer);
  const keypair = web3.Keypair.fromSecretKey(privateKeyUint8Array);
  const publicKey = keypair.publicKey.toBase58();
  return { publicKey, privateKey };
};

export const exportKeypair = (privateKey: string) => {
  const privateKeyBuffer = bs58.decode(privateKey);
  const privateKeyUint8Array = new Uint8Array(privateKeyBuffer);
  const keypair = web3.Keypair.fromSecretKey(privateKeyUint8Array);
  return keypair;
};

export const getTransaction = async (txHash: string) => {
  let info = await solConnection.getTransaction(txHash, {
    maxSupportedTransactionVersion: 0,
  });
  while (info == null) {
    info = await solConnection.getTransaction(txHash, {
      maxSupportedTransactionVersion: 0,
    });
  }
  return info;
};

export const autoTransfer = async (
  from: web3.Keypair,
  to: web3.PublicKey,
  amount?: number
) => {
  try {
    let i = 0;
    const ixs: web3.TransactionInstruction[] = [];
    await sleep(i * 1000);
    const accountInfo = await solConnection.getAccountInfo(from.publicKey);
    if (accountInfo) {
      const solBal = await solConnection.getBalance(from.publicKey);
      ixs.push(
        web3.SystemProgram.transfer({
          fromPubkey: from.publicKey,
          toPubkey: to,
          lamports: amount ? amount * web3.LAMPORTS_PER_SOL : solBal,
        })
      );
    }

    if (ixs.length) {
      const tx = new web3.Transaction().add(
        web3.ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 220_000,
        }),
        web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 350_000 }),
        ...ixs
      );
      tx.feePayer = BANKROLL.publicKey;
      tx.recentBlockhash = (await solConnection.getLatestBlockhash()).blockhash;
      const hash = await web3.sendAndConfirmTransaction(
        solConnection,
        tx,
        [from],
        {
          commitment: "confirmed",
        }
      );

      return hash;
    }
    return;
  } catch (e) {
    console.log(e);
    return;
  }
};
