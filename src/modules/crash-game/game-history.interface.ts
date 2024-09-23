import { Types } from "mongoose";

export interface IGameHistoryModal extends Document {
  playerId: Types.ObjectId;
  gameId: Types.ObjectId;
  gamePoint: number;
  playerBet: number;
  playerPoint: number;
  profit: number;
  netProfit: number;
  playedAt: Date;
}
