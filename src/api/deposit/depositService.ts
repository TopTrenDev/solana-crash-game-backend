import * as web3 from '@solana/web3.js';
import { logger } from '@/server';
import User from '@/common/models/User';
import { getTransaction, solConnection } from '@/controllers/solana';
import { ITransaction } from '@/common/types';
import PaymentTx from '@/common/models/PaymentTx';

export const depositService = {
  // detect deposit
  detectDeposit: async () => {
    try {
      const users = await User.find({ 'wallet.publicKey': { $ne: null } }, ['_id', 'wallet.publicKey']);
      await Promise.all(
        users.map(async (user: any) => {
          const publicKey = user.wallet.publicKey;
          const signatures = await solConnection.getSignaturesForAddress(new web3.PublicKey(publicKey));
          await Promise.all(
            signatures.map(async (s: any) => {
              const exist = await PaymentTx.findOne({ hash: s.signature });
              if (exist) return;
              const info = await getTransaction(s.signature);
              const tx = info as ITransaction;
              const passed = new Date().getTime() / 1000 - tx.blockTime;
              if (passed > 5 * 60) return;
              const vaultId = tx.transaction.message.accountKeys.findIndex((pub) => pub.toString() === publicKey);
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
              }
            })
          );
        })
      );
    } catch (ex) {
      logger.error(ex);
    }
  },
};
