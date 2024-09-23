// Require Dependencies
import mongoose, { model, SchemaTypes, Types } from "mongoose";

import { IGameHistoryModal } from "./game-history.interface";

// Setup GameHistory Schema
const GameHistorySchema = new mongoose.Schema<IGameHistoryModal>(
  {
    playerId: { type: SchemaTypes.ObjectId, ref: "User" },
    gameId: { type: SchemaTypes.ObjectId, ref: "CrashGame" },
    gamePoint: {
      type: Number,
      required: true,
    },
    playerBet: {
      type: Number,
      required: true,
    },
    playerPoint: {
      type: Number,
      required: true,
    },
    profit: {
      type: Number,
      required: true,
    },
    netProfit: {
      type: Number,
      required: true,
    },
    playedAt: Date,
  },
  {
    minimize: true,
  }
);

export default model<IGameHistoryModal>("GameHistory", GameHistorySchema);
