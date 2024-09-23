import Cron, { ScheduleOptions } from "node-cron";

import { BaseCron } from "@/cron/crons/base.cron";
import {
  EPAYMENT_STATUS,
  PaymentController,
  PaymentService,
} from "@/modules/payment";
import logger from "@/utils/logger";

export class DetectDeposit extends BaseCron {
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
          this.detectDepositHandle,
          "detectDepositHandle"
        );
      },
      this.option
    );
  };

  private detectDepositHandle = async () => {
    await this.paymentController.userBalanceDeposit();
  };
}
