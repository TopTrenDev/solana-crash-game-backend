import { Document } from "mongoose";

export declare interface IDashboardModel extends Document {
  revenueType: number;
  lastBalance: number;
  insertDate?: Date;
}
