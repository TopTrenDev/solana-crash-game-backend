import Cron, { ScheduleOptions } from "node-cron";

import { BaseCron } from "@/cron/crons/base.cron";
import {
  EPAYMENT_STATUS,
  PaymentController,
  PaymentService,
} from "@/modules/payment";
import logger from "@/utils/logger";

export class PendingWithdraw extends BaseCron {
  private paymentController: PaymentController;
  private paymentService: PaymentService;

  constructor(cronExpression: string, option = <ScheduleOptions>{}) {
    super(cronExpression, option);

    this.paymentController = new PaymentController();
    this.paymentService = new PaymentService();
  }

  public start = () => {
    this.initCron();
  };

  private initCron = () => {
    this.task = Cron.schedule(
      this.cronExpression,
      async () => {
        await this.catchWrapper(
          this.pendingWithdrawHandle,
          "pendingWithdrawHandle"
        );
      },
      this.option
    );
  };

  private pendingWithdrawHandle = async () => {
    const pendingWithdrawTxs =
      await this.paymentController.getActivePendingWithdrawList();

    if (!(pendingWithdrawTxs.length > 0)) {
      return;
    }

    const adminAvaliable =
      await this.paymentController.getAdminBalanceWithdrwable();

    if (!adminAvaliable) {
      logger.error(
        "[PendingWithdraw]: Failed Admin balance is not enough to withdraw"
      );
      return;
    }

    for (const pendingWithdrawTx of pendingWithdrawTxs) {
      const withdrawParam = {
        amount: pendingWithdrawTx.amount,
        address: pendingWithdrawTx.walletAddress,
      };

      const txHash = await this.paymentService.withDrawToUser(withdrawParam);

      await this.paymentService.update(
        {
          _id: pendingWithdrawTx._id,
        },
        {
          txHash,
          status: EPAYMENT_STATUS.PENDING_SUCCESS,
        }
      );
    }
  };
}
