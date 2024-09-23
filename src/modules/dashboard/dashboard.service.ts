// need add model to mongo index file
import BaseService from "@/utils/base/service";
import { Dashboard } from "@/utils/db";

import { EFilterDate, ERevenueType } from "./dashboard.constant";
// need add types
import { IDashboardModel } from "./dashboard.interface";

export class DashboardService extends BaseService<IDashboardModel> {
  constructor() {
    super(Dashboard);
  }

  public async getDashboardChart(
    dateType: EFilterDate,
    desiredRevenueType: ERevenueType
  ): Promise<{
    logs: IDashboardModel[];
  }> {
    let date = 5;
    let limit = 12;

    switch (dateType) {
      case EFilterDate.hour:
        date = 5;
        limit = 12;
        break;
      case EFilterDate.day:
        date = 60;
        limit = 24;
        break;
      case EFilterDate.week:
        date = 60 * 24;
        limit = 7;
        break;
      case EFilterDate.month:
        date = 60 * 24;
        limit = 30;
        break;
      default:
        date = 60 * 24 * 30;
        limit = 12;
    }

    const revenueLogs = await this.aggregateByPipeline([
      {
        $addFields: {
          insertMod: {
            $mod: [
              {
                $toLong: "$insertDate",
              },
              1000 * 60 * date,
            ],
          },
        },
      },
      {
        $match: {
          insertMod: 0,
          revenueType: Number(desiredRevenueType),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: limit * 2,
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ]);

    if (revenueLogs.length === 0) {
      const lastkartRevenueLog = await this.getLastRevenueLog();
      return {
        logs: lastkartRevenueLog,
      };
    }

    return {
      logs: revenueLogs,
    };
  }

  private async getLastRevenueLog(): Promise<IDashboardModel[]> {
    return await this.aggregateByPipeline([
      {
        $sort: {
          insertDate: -1,
        },
      },
      { $limit: 1 },
    ]);
  }
}
