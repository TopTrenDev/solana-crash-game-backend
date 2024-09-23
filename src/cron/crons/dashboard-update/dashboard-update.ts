import Cron, { ScheduleOptions } from "node-cron";

import { ALLOW_GAME_LIST } from "@/config";
import { CGAME_LIST } from "@/constant/game";
import { BaseCron } from "@/cron/crons/base.cron";
import {
  DashboardService,
  ERevenueType,
  IDashboardModel,
} from "@/modules/dashboard";
import UserService from "@/modules/user/user.service";

export class DashboardUpdate extends BaseCron {
  private dashboardService = new DashboardService();
  private userService = new UserService();

  constructor(cronExpression: string, option = <ScheduleOptions>{}) {
    super(cronExpression, option);
    this.start();
  }

  public start = () => {
    this.initCron();
  };

  private initCron = () => {
    this.task = Cron.schedule(
      this.cronExpression,
      async () => {
        await this.catchWrapper(
          this.updateDashboardStatus,
          "updateDashboardStatus"
        );
      },
      this.option
    );
  };

  private updateDashboardStatus = async () => {
    try {
      console.log("Start updateDashboardStatus");
      await this.fetchAndSaveRevenulogData();
    } catch (error) {
      console.error("Error in updateDashboardStatus:", error);
    }
  };

  private fetchAndSaveRevenulogData = async () => {
    try {
      const insertDate = new Date();
      insertDate.setSeconds(0);
      insertDate.setMilliseconds(0);
      const siteUserData = await this.userService.getSiteUserData();
      const dashboardPayloads: IDashboardModel[] = [];

      const createPayload = (revenueType: ERevenueType, lastBalance: number) =>
        ({
          revenueType,
          lastBalance,
          insertDate,
        }) as IDashboardModel;

      for (const allowGame of ALLOW_GAME_LIST) {
        let gameDashboardBalance = 0;
        let gameType: ERevenueType = ERevenueType.COINFLIP;

        if (allowGame === CGAME_LIST.crash) {
          gameType = ERevenueType.CRASH;
          gameDashboardBalance =
            siteUserData.leaderboard?.["crash"]?.winAmount || 0;
        }

        dashboardPayloads.push(createPayload(gameType, gameDashboardBalance));
      }

      dashboardPayloads.push(
        createPayload(ERevenueType.TOTAL, siteUserData.credit || 0)
      );

      for (const payload of dashboardPayloads) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        await this.dashboardService.create(payload);
      }
    } catch (error) {
      console.error("Error fetching or saving revenue data:", error);
    }
  };
}
