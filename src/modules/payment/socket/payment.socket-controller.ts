import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Event as SocketEvent, Namespace, Socket } from "socket.io";

import { ADMIN_WALLET_ADDRESS, TOKEN_SECRET } from "@/config";
import { IUserModel } from "@/modules/user/user.interface";
import UserService from "@/modules/user/user.service";
import AESWrapper from "@/utils/encryption/aes-wrapper";
import { fromBase64 } from "@/utils/helpers/string-helper";
import logger from "@/utils/logger";

import {
  CDAILY_PAYMENT_LIMIT,
  CONETIME_PAYMENT_LIMIT,
  CSITE_PAYMENT_LIMIT,
  EPAYMENT_STATUS,
  EPaymentEvents,
} from "../payment.constant";
import { PaymentController } from "../payment.controller";
import { TSocketTipParam, TSocketWithDrawParam } from "../payment.types";

class PaymentSocketHandler {
  private socket: Socket;
  private socketNameSpace: Namespace;
  private loggedIn = false;
  private user: IUserModel | null = null;
  private logoPrefix: string = "[Payment Socket Handler]::: ";
  private paymentController: PaymentController;
  private aesKey: Buffer;

  private userService: UserService;
  private tipsFee = 1;

  constructor(socketNameSpace: Namespace, socket: Socket) {
    this.userService = new UserService();
    this.paymentController = new PaymentController();

    this.socket = socket;
    this.socketNameSpace = socketNameSpace;
  }

  public authHandler = async (token: string) => {
    if (!token) {
      this.loggedIn = false;
      this.user = null;
      return this.socket.emit(
        "error",
        "No authentication token provided, authorization declined"
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, TOKEN_SECRET) as JwtPayload;
      this.user = await this.userService.getItemById(decoded.userId);

      if (this.user) {
        if (parseInt(this.user.banExpires) > new Date().getTime()) {
          this.loggedIn = false;
          this.user = null;
          return this.socket.emit("user banned");
        } else {
          this.loggedIn = true;
          this.socket.join(String(this.user._id));
          this.aesKey = AESWrapper.generateKey();

          logger.info(this.logoPrefix + "User connected: " + this.user._id);
          this.socketNameSpace
            .to(String(this.user._id))
            .emit("notify-success", "Authentication success");

          this.socketNameSpace
            .to(String(this.user._id))
            .emit(EPaymentEvents.loginResponse, {
              aesKey: this.aesKey.toString("base64"),
              balance: this.user.credit,
            });
        }
      }
    } catch (error) {
      this.loggedIn = false;
      logger.error(this.logoPrefix + "Auth error occurred" + error);
      this.user = null;
      return this.socket.emit(
        "notify-error",
        "Authentication token is not valid"
      );
    }
  };

  public withdrawHandler = async (withdrawParamString: string) => {
    console.log("withdraw is called");
    try {
      const withdrawParam: TSocketWithDrawParam = JSON.parse(
        AESWrapper.decrypt(this.aesKey, withdrawParamString)
      );

      if (!this.loggedIn || !this.user?._id) {
        return this.socket.emit("notify-error", `You are not logged in!`);
      }

      const isMatch = await bcrypt.compare(
        withdrawParam.password,
        this.user.password
      );
      if (!isMatch) {
        // Add a blank line before this statement
        return this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.paymentFailed, `Incorrect password`);
      }

      const adminBalanceAvailable =
        await this.paymentController.getAdminBalanceWithdrawable();

      if (!adminBalanceAvailable) {
        return this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.paymentFailed, `Contact to admin`);
      }

      if (withdrawParam.amount > CONETIME_PAYMENT_LIMIT) {
        return this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.paymentFailed, `Exceed withdraw limit`);
      }

      const isExistPendingWithdraw =
        await this.paymentController.getUserHavePendingWithdraw(this.user._id);

      if (isExistPendingWithdraw) {
        return this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.paymentFailed, `Exceed daily limit`);
      }

      if (this.user.credit < withdrawParam.amount * 1100) {
        return this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.paymentFailed, `Insufficient balance`);
      }

      const userTodayWithdrawAmount =
        await this.paymentController.getUserTodayWithdraw(this.user._id);

      // Make pending tx
      if (
        withdrawParam.amount >
        CDAILY_PAYMENT_LIMIT - userTodayWithdrawAmount
      ) {
        const user = await this.userService.getItemById(this.user._id);
        const updateParams = `credit`;
        const updateValue = user.credit - withdrawParam.amount * 1100;

        await this.userService.updateUserBalance(
          this.user._id,
          updateParams,
          updateValue
        );

        await this.paymentController.create({
          userId: this.user._id,
          walletAddress: withdrawParam.address,
          type: "Withdraw",
          amount: withdrawParam.amount,
          status: EPAYMENT_STATUS.PENDING,
        });

        this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.updateBalance, updateValue);
        return this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.paymentFailed, `Withdrawal after 2 days`);
      }

      const resWithdraw = await this.paymentController.userBalanceWithdraw(
        withdrawParam,
        {
          userId: this.user._id,
          role: this.user.role,
        }
      );

      if (
        typeof resWithdraw === "object" &&
        "status" in resWithdraw &&
        resWithdraw.status !== "success"
      ) {
        return this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.paymentFailed, `Withdraw Failed`);
      }

      if (typeof resWithdraw !== "object") {
        return this.socketNameSpace
          .to(String(this.user._id))
          .emit(EPaymentEvents.paymentFailed, `Withdraw Failed`);
      }

      this.socketNameSpace
        .to(String(this.user._id))
        .emit(EPaymentEvents.paymentFailed, `Withdraw Success`);
      return this.socketNameSpace
        .to(String(this.user._id))
        .emit(EPaymentEvents.updateBalance, resWithdraw.data);
    } catch (error) {
      logger.error(this.logoPrefix + "Withdraw failed" + error);
      return this.socket.emit(EPaymentEvents.paymentFailed, `Withdraw Failed`);
    }
  };

  public tipHandler = async (tipParamString: string) => {
    try {
      const tipParam: TSocketTipParam = JSON.parse(
        AESWrapper.decrypt(this.aesKey, tipParamString)
      );

      if (!this.loggedIn || !this.user?._id) {
        throw new Error("You are not logged in!");
      }

      logger.info(
        this.logoPrefix +
          `{${this.user.username}} is trying to tip ${tipParam.amount} to {${tipParam.username}}`
      );

      const isMatch = await bcrypt.compare(
        tipParam.password,
        this.user.password
      );
      if (!isMatch) {
        throw new Error("Incorrect password");
      }

      const receiver = await this.userService.getItem({
        username: tipParam.username,
      });
      if (!receiver) {
        throw new Error("Username not found");
      }

      const tipsAmount = tipParam.amount + this.tipsFee;
      if (this.user.credit < tipsAmount) {
        throw new Error("Insufficient balance");
      }

      // Update sender's balance
      await this.userService.updateUserBalance(
        this.user._id,
        "credit",
        this.user.credit - tipsAmount
      );

      // Update receiver's balance
      await this.userService.updateUserBalance(
        receiver._id,
        "credit",
        receiver.credit + tipParam.amount
      );

      // // Emit updated balances
      // this.socketNameSpace
      //   .to(String(this.user._id))
      //   .emit(EPaymentEvents.updateBalance, this.user.credit - tipsAmount);
      // this.socketNameSpace
      //   .to(String(receiver._id))
      //   .emit(EPaymentEvents.updateBalance, receiver.credit + tipParam.amount);

      // Confirm tip success
      return this.socketNameSpace
        .to(String(this.user._id))
        .emit(EPaymentEvents.paymentFailed, "Tipping Success");
    } catch (error) {
      logger.error(this.logoPrefix + "Tips failed" + error);
      return this.socket.emit(EPaymentEvents.paymentFailed, error.message);
    }
  };

  public getUserWalletInfo = async () => {
    try {
      if (!this.loggedIn || !this.user?._id) {
        return this.socket.emit("notify-error", `You are not logged in!`);
      }

      return this.socketNameSpace
        .to(String(this.user._id))
        .emit(EPaymentEvents.updateBalance, this.user.credit);
    } catch (error) {
      logger.error(this.logoPrefix + "Send message error occured" + error);
      return this.socket.emit(
        "notify-error",
        `An error is occurred on updating balance!`
      );
    }
  };

  public banStatusCheckMiddleware = async (
    packet: SocketEvent,
    next: (err?: any) => void
  ) => {
    if (packet[0] === EPaymentEvents.login) {
      return next();
    }

    if (this.loggedIn && this.user) {
      try {
        // Check if user is banned
        if (
          this.user &&
          parseInt(this.user.banExpires) > new Date().getTime()
        ) {
          return this.socket.emit("user banned");
        } else {
          return next();
        }
      } catch (error) {
        return this.socket.emit("user banned");
      }
    } else {
      return this.socket.emit("user banned");
    }
  };

  public disconnectHandler = async () => {
    this.user = null;
  };
}

export default PaymentSocketHandler;
