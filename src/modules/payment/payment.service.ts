import * as web3 from "@solana/web3.js";
import bs58 from "bs58";

import BaseService from "@/utils/base/service";
import { Payment } from "@/utils/db";
import logger from "@/utils/logger";

import {
  IPaymentModel,
  TCheckDepositParam,
  TransactionDetails,
  TWithDrawProps,
} from ".";
import {
  autoTransfer,
  BANKROLL,
  exportKeypair,
  getTransaction,
  solConnection,
} from "@/utils/crypto/solana";
import { ITransaction } from "@/utils/types";

export class PaymentService extends BaseService<IPaymentModel> {
  constructor() {
    super(Payment);
  }

  public getAdminBalance = async () => {
    try {
      const balance = await solConnection.getBalance(BANKROLL.publicKey);
      return balance / web3.LAMPORTS_PER_SOL;
    } catch (e) {
      console.log(e);
      return 0;
    }
  };

  public getTransactionDetails = (
    txDetailsString: string
  ): TransactionDetails | null => {
    try {
      const txDetailsArray = JSON.parse(txDetailsString);

      let sender = "";
      let receiver = "";
      let amount = "";

      txDetailsArray.forEach((tx: any) => {
        tx.events.forEach((event: any) => {
          if (event.type === "message") {
            event.attributes.forEach((attr: any) => {
              if (attr.key === "sender") {
                sender = attr.value;
              }
            });
          }

          if (event.type === "transfer") {
            event.attributes.forEach((attr: any) => {
              if (attr.key === "recipient") {
                receiver = attr.value;
              }

              if (attr.key === "amount") {
                const amountDenom = attr.value.match(/^(\d+)(.*)$/);

                if (amountDenom) {
                  amount = amountDenom[1];
                }
              }
            });
          }
        });
      });

      if (sender && receiver && amount) {
        return { sender, receiver, amount };
      } else {
        console.error("Failed to extract all transaction details.");
        return null;
      }
    } catch (error) {
      console.error("Error parsing transaction details:", error);
      return null;
    }
  };

  public checkDepositPayment = async (payload: TCheckDepositParam) => {
    try {
      const results = await Promise.all(
        payload.users.map(async (user) => {
          const kp = web3.Keypair.fromSecretKey(
            bs58.decode(user.wallet.privateKey)
          );
          const signatures = await solConnection.getSignaturesForAddress(
            new web3.PublicKey(kp.publicKey)
          );

          return Promise.all(
            signatures.map(async (s: any) => {
              const exist = await this.getItem({ txHash: s.signature });
              if (!exist) {
                const info = await getTransaction(s.signature);
                const tx = info as ITransaction;
                const passed = new Date().getTime() / 1000 - tx.blockTime;
                // if (passed > 5 * 60) return null; // Skip if transaction is older than 5 minutes

                const vaultId = tx.transaction.message.accountKeys.findIndex(
                  (pub) => pub.toString() === kp.publicKey.toString()
                );
                const payAmount =
                  tx.meta.postBalances[vaultId] - tx.meta.preBalances[vaultId];
                const addedAmounts = (payAmount / web3.LAMPORTS_PER_SOL) * 1000;

                if (addedAmounts > 0) {
                  return {
                    user,
                    amount: addedAmounts,
                    txHash: s.signature,
                    time: new Date(tx.blockTime * 1000),
                  };
                }
              }
              return null;
            })
          );
        })
      );
      return results.flat().filter((item) => item !== null);
    } catch (error) {
      logger.error(`Error in checkDepositPayment: ${error.message}`);
      throw new Error(`Failed to check deposit payments: ${error.message}`);
    }
  };

  public withDrawToUser = async (payload: TWithDrawProps) => {
    const receiver = new web3.PublicKey(payload.address);
    const hash = await autoTransfer(BANKROLL, receiver, payload.amount);

    return hash;
  };

  public balanceDeposit = async (
    wallet: string,
    amount: number,
    txHash: string,
    userId: string
  ) => {
    try {
      const sender = exportKeypair(wallet);

      await this.create({
        walletAddress: sender.publicKey.toBase58(),
        amount,
        txHash,
        type: "Deposit",
        userId,
      });

      // return newPayment;
      await autoTransfer(sender, BANKROLL.publicKey);
      return true;
    } catch (ex) {
      const errorMessage = `Error gathering all deposits: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return false;
    }
  };

  public balanceWithdraw = async (data, userId) => {
    try {
      const txHash = await this.withDrawToUser(data);
      if (!txHash) {
        return null;
      }
      const newPayment = await this.create({
        walletAddress: data.address,
        amount: data.amount,
        txHash: txHash,
        type: "Withdraw",
        userId,
      });
      return newPayment;
    } catch (ex) {
      const errorMessage = `Error finding all payments: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return null;
    }
  };
}
