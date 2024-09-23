import { FilterQuery } from "mongoose";

import { ADMIN_WALLET_ADDRESS } from "@/config";
import AESWrapper from "@/utils/encryption/aes-wrapper";
import { CustomError } from "@/utils/helpers";
import * as localizations from "@/utils/localizations";
import ILocalization from "@/utils/localizations/localizations.interface";
import logger from "@/utils/logger";

import { IAuthInfo } from "../auth/auth.types";
import UserService from "../user/user.service";
import { CSITE_PAYMENT_LIMIT, EPAYMENT_STATUS, IPaymentModel } from ".";
import { PaymentService } from "./payment.service";
import { IUserModel } from "../user/user.interface";
import { createWallet } from "@/utils/crypto/solana";

export class PaymentController {
  // Services
  private paymentService: PaymentService;
  private userService: UserService;

  // Diff services
  private localizations: ILocalization;

  constructor() {
    this.paymentService = new PaymentService();
    this.userService = new UserService();

    this.localizations = localizations["en"];
  }

  public getAll = async () => {
    const paymentFilter = <FilterQuery<IPaymentModel>>{};
    const [item, count] = await Promise.all([
      this.paymentService.get(paymentFilter),
      this.paymentService.getCount(paymentFilter),
    ]);

    return {
      item,
      count,
    };
  };

  public getByName = async (name) => {
    const payment = await this.paymentService.getItem({ name });

    // need add to localizations
    if (!payment) {
      throw new CustomError(404, "Payment not found");
    }

    return payment;
  };

  public getById = async (paymentId) => {
    const payment = await this.paymentService.getItemById(paymentId);

    // need add to localizations
    if (!payment) {
      throw new CustomError(404, "Payment not found");
    }

    return payment;
  };

  public create = async (payment: Partial<IPaymentModel>) => {
    try {
      return await this.paymentService.create(payment);
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError(409, this.localizations.ERRORS.OTHER.CONFLICT);
      }

      throw new Error(this.localizations.ERRORS.OTHER.SOMETHING_WENT_WRONG);
    }
  };

  public update = async ({ id }, paymentData) => {
    try {
      const payment = await this.paymentService.updateById(id, paymentData);

      // need add to localizations
      if (!payment) {
        throw new CustomError(404, "Payment not found");
      }

      return payment;
    } catch (error) {
      if (error.code === 11000) {
        throw new CustomError(409, this.localizations.ERRORS.OTHER.CONFLICT);
      } else if (error.status) {
        throw new CustomError(error.status, error.message);
      } else {
        throw new Error(this.localizations.ERRORS.OTHER.SOMETHING_WENT_WRONG);
      }
    }
  };

  public delete = async ({ id }) => {
    const payment = await this.paymentService.deleteById(id);

    // need add to localizations
    if (!payment) {
      throw new CustomError(404, "Payment not found");
    }

    return payment;
  };

  public userBalanceWithdraw = async (
    { amount, address },
    { userId }: IAuthInfo
  ) => {
    const withdrawParam = {
      address: address,
      amount: amount,
    };

    try {
      const user = await this.userService.getItemById(userId);
      const updateParams = `credit`;
      const walletValue = user?.credit ?? 0;
      let updateValue = 0;

      if (walletValue < amount * 1100) {
        throw new CustomError(409, "Insufficient balance");
      } else {
        updateValue = walletValue - amount * 1100;
        let updatedUser = await this.userService.updateUserBalance(
          userId,
          updateParams,
          updateValue
        );

        // user withdraw crypto to admin wallet
        try {
          const resPayment = await this.paymentService.balanceWithdraw(
            withdrawParam,
            userId
          );

          if (!resPayment) {
            throw new CustomError(409, "unable withdraw");
          }
        } catch {
          updatedUser = await this.userService.updateUserBalance(
            userId,
            updateParams,
            walletValue
          );
          logger.error(
            `[Payment failed] user: ${userId} paymentInfo: ${JSON.stringify(withdrawParam)}`
          );
        }

        logger.info(
          `[Payment success] user: ${userId} paymentInfo: ${JSON.stringify(withdrawParam)}`
        );
        return updatedUser;
      }
    } catch (error) {
      logger.error(
        `[Payment failed] user: ${userId} paymentInfo: ${JSON.stringify(withdrawParam)}`
      );
      throw new CustomError(409, "updating balance error");
    }
  };

  public getAdminBalanceWithdrawable = async () => {
    const adminBalance = await this.paymentService.getAdminBalance();
    if (adminBalance <= CSITE_PAYMENT_LIMIT) {
      return false;
    }

    return true;
  };

  public getAddress = async () => {
    try {
      const address = ADMIN_WALLET_ADDRESS ?? "";
      const aesKey = AESWrapper.generateKey();
      const encryptedAddress = AESWrapper.createAesMessage(aesKey, address);
      return {
        encryptedAddress,
        aesKey: aesKey.toString("base64"),
      };
    } catch (ex) {
      const errorMessage = `Error encrypting address: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return {
        error: errorMessage,
      };
    }
  };

  public getUserTodayWithdraw = async (userId): Promise<number> => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const todayAmounts = await this.paymentService.aggregateByPipeline([
      {
        $match:
          /**
           * query: The query in MQL.
           */
          {
            userId: String(userId),
            type: "Withdraw",
            status: {
              $ne: {
                $or: ["PENDING", "PENDING_SUCCESS"],
              },
            },
            createdAt: {
              $gte: startOfDay,
            },
          },
      },
      {
        $group:
          /**
           * _id: The id of the group.
           * fieldN: The first field name.
           */
          {
            _id: "$denom",
            totalAmount: {
              $sum: "$amount",
            },
          },
      },
      {
        $group:
          /**
           * _id: The id of the group.
           * fieldN: The first field name.
           */
          {
            _id: null,
            result: {
              $push: {
                k: "$_id",
                v: "$totalAmount",
              },
            },
          },
      },
      {
        $replaceRoot:
          /**
           * replacementDocument: A document or string.
           */
          {
            newRoot: {
              $arrayToObject: "$result",
            },
          },
      },
    ]);

    if (todayAmounts.length > 0) {
      return todayAmounts[0];
    } else {
      return 0;
    }
  };

  public getUserHavePendingWithdraw = async (userId): Promise<boolean> => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const tomorrowDay = new Date(today);
      tomorrowDay.setDate(today.getDate() + 1);
      tomorrowDay.setHours(0, 0, 0, 0);

      const todayPending = await this.paymentService.aggregateByPipeline([
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              userId: String(userId),
              type: "Withdraw",
              status: EPAYMENT_STATUS.PENDING,
              createdAt: {
                $gte: startOfDay,
                $lte: tomorrowDay,
              },
            },
        },
      ]);

      if (todayPending.length > 0) {
        return true;
      }

      return false;
    } catch {
      return true;
    }
  };

  public userBalanceDeposit = async () => {
    try {
      const filter: FilterQuery<IUserModel> = {
        "wallet.publicKey": {
          $ne: null,
        },
      };

      const users = await this.userService.get(filter, { _id: 1, wallet: 1 });
      const newPayments = await this.paymentService.checkDepositPayment({
        users,
      });
      newPayments.map(async (payment) => {
        await this.userService.updateUserBalance(
          payment.user._id,
          "credit",
          payment.user.credit + payment.amount
        );
        await this.paymentService.balanceDeposit(
          payment.user.wallet.privateKey,
          payment.amount,
          payment.txHash,
          payment.user._id
        );
        const wallet = createWallet();
        await this.userService.updateById(payment.user._id, { wallet });
      });
    } catch (e) {}
  };

  public getActivePendingWithdrawList = async (): Promise<
    Array<Partial<IPaymentModel>>
  > => {
    try {
      const now = new Date();
      const endOfDuration = new Date(now);
      endOfDuration.setDate(now.getDate() - 2);
      endOfDuration.setHours(now.getHours() + 1, 0, 0, 0);
      const startOfDuration = new Date(endOfDuration);
      startOfDuration.setHours(now.getHours(), 0, 0, 0);

      const targetPending = await this.paymentService.aggregateByPipeline([
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              type: "Withdraw",
              status: EPAYMENT_STATUS.PENDING,
              createdAt: {
                $gte: startOfDuration,
                $lte: endOfDuration,
              },
            },
        },
      ]);
      return targetPending;
    } catch {
      return [];
    }
  };
}
