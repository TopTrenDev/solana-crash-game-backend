// Import Dependencies
import mongoose, { Document, ObjectId, SchemaTypes, Types } from 'mongoose';

// Destructure Schema Types
const { Schema } = mongoose;

export enum GameType {
  CRASH = 'crash',
  JACKPOT = 'jackpot',
  COINFLIP = 'coinflip',
  LOOTIES = 'looties',
}

// Setup Race Schema
const GameHistorySchema = new Schema({
  // Player
  player: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  },
  // Game ID
  gameId: {
    type: SchemaTypes.ObjectId,
    ref: 'CrashGame',
  },
  // Game Type
  gameType: {
    type: String,
    enum: Object.values(GameType), // Define the enum values as an array of strings
    default: GameType.CRASH,
  },
  // Game Point like crash number, coinflip number and ...
  gamePoint: {
    type: Number,
    required: true,
  },
  // Player bet amount
  playerBet: {
    type: Number,
    required: true,
  },
  // Player point like cashout in crash, side in coinflip
  playerPoint: {
    type: Number,
    required: false,
  },
  // Player profit
  profit: {
    type: Number,
    required: true,
  },
  // Player cummulative profit
  netProfit: {
    type: Number,
    required: true,
  },
  // When user played
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

export interface GameHistoryDocument extends Document {
  _id: Types.ObjectId;
  player: Types.ObjectId;
  gameId: Types.ObjectId;
  gameType: GameType;
  gamePoint: number;
  playerBet: number;
  playerPoint: number;
  profit: number;
  netProfit: number;
  playedAt: Date;
}

// Create and export the new model
const GameHistory = mongoose.model<GameHistoryDocument>('GameHistory', GameHistorySchema);

export default GameHistory;
