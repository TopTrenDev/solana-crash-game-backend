import * as web3 from '@solana/web3.js';
import bs58 from 'bs58';
import { logger } from '@/server';
import User from '@/common/models/User';
import { BANKROLL, createWallet, getTransaction, solConnection } from '@/controllers/solana';
import { ITransaction } from '@/common/types';
import PaymentTx from '@/common/models/PaymentTx';
import { userRegistry } from '../user/userRouter';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface WithdrawProps {
  userId: string;
  walletAddress: string;
  amount: number;
  password: string;
}

export const depositService = {
  // detect deposit
  detectDeposit: async () => {
    try {
      const users = await User.find({ 'wallet.publicKey': { $ne: null } }, ['_id', 'wallet']);
      let i = 0;
      await Promise.all(
        users.map(async (user: any) => {
          const kp = web3.Keypair.fromSecretKey(bs58.decode(user.wallet.privateKey));

          const signatures = await solConnection.getSignaturesForAddress(new web3.PublicKey(kp.publicKey));
          await Promise.all(
            signatures.map(async (s: any) => {
              const exist = await PaymentTx.findOne({ hash: s.signature });
              if (exist) return;
              const info = await getTransaction(s.signature);
              const tx = info as ITransaction;
              const passed = new Date().getTime() / 1000 - tx.blockTime;
              if (passed > 5 * 60) return;
              const vaultId = tx.transaction.message.accountKeys.findIndex(
                (pub) => pub.toString() === kp.publicKey.toString()
              );
              const payAmount = tx.meta.postBalances[vaultId] - tx.meta.preBalances[vaultId];
              const addedAmounts = (payAmount / web3.LAMPORTS_PER_SOL) * 1000;
              if (addedAmounts) {
                await User.findByIdAndUpdate(user._id, { $inc: { credit: addedAmounts } });
                const depositTx = new PaymentTx({
                  description: 'Deposit',
                  amount: payAmount / web3.LAMPORTS_PER_SOL,
                  hash: s.signature,
                  blockTime: new Date(tx.blockTime * 1000),
                  _user: user._id,
                });
                await depositTx.save();

                const ixs: web3.TransactionInstruction[] = [];
                await sleep(i * 1000);
                const accountInfo = await solConnection.getAccountInfo(kp.publicKey);

                if (accountInfo) {
                  const solBal = await solConnection.getBalance(kp.publicKey);
                  ixs.push(
                    web3.SystemProgram.transfer({
                      fromPubkey: kp.publicKey,
                      toPubkey: BANKROLL.publicKey,
                      lamports: solBal,
                    })
                  );
                }

                if (ixs.length) {
                  const tx = new web3.Transaction().add(
                    web3.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 220_000 }),
                    web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 350_000 }),
                    ...ixs
                  );
                  tx.feePayer = BANKROLL.publicKey;
                  tx.recentBlockhash = (await solConnection.getLatestBlockhash()).blockhash;
                  console.log(await solConnection.simulateTransaction(tx));
                  const sig = await web3.sendAndConfirmTransaction(solConnection, tx, [BANKROLL, kp], {
                    commitment: 'confirmed',
                  });
                  console.log(`Closed and gathered SOL from wallets : https://solscan.io/tx/${sig}`);

                  const wallet = createWallet();
                  await User.findByIdAndUpdate(user._id, { wallet });

                  i++;
                  return;
                }
              }
            })
          );
        })
      );
    } catch (ex) {
      logger.error(ex);
    }
  },

  withdraw: async ({ userId, walletAddress, amount, password }: WithdrawProps) => {
    console.log(`${amount} sol is withdrawing to ${walletAddress} by user ${userId}`);
    try {
      const user = await User.findById(userId);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.BAD_REQUEST);
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return new ServiceResponse(ResponseStatus.Failed, 'Incorrect password', null, StatusCodes.BAD_REQUEST);
      }

      if (user.credit < amount * 1100) {
        return new ServiceResponse(ResponseStatus.Failed, 'Insufficient balance', null, StatusCodes.BAD_REQUEST);
      }

      const ixs: web3.TransactionInstruction[] = [];
      const receiver = new web3.PublicKey(walletAddress);

      ixs.push(
        web3.SystemProgram.transfer({
          fromPubkey: BANKROLL.publicKey,
          toPubkey: receiver,
          lamports: amount * web3.LAMPORTS_PER_SOL,
        })
      );

      if (ixs.length) {
        const tx = new web3.Transaction().add(
          web3.ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 220_000 }),
          web3.ComputeBudgetProgram.setComputeUnitLimit({ units: 350_000 }),
          ...ixs
        );
        tx.feePayer = BANKROLL.publicKey;
        tx.recentBlockhash = (await solConnection.getLatestBlockhash()).blockhash;
        const sig = await web3.sendAndConfirmTransaction(solConnection, tx, [BANKROLL], {
          commitment: 'confirmed',
        });

        const txLink = `https://solscan.io/tx/${sig}`;
        console.log(`withdraw link : ${txLink}`);

        return new ServiceResponse(ResponseStatus.Success, 'Successfully withdraw', { txLink }, StatusCodes.OK);
      }
      return new ServiceResponse(ResponseStatus.Failed, 'Withdraw', { txLink: '' }, StatusCodes.INTERNAL_SERVER_ERROR);
    } catch (ex) {
      console.error(ex);
      const errorMessage = `Error withdrawing user with userId ${userId}:, ${(ex as Error).message}`;
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
