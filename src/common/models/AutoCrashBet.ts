// Require Dependencies
import mongoose, { Document, Model, SchemaTypes } from 'mongoose';

import { UserDocumentType } from './User';

// Setup autobet CrashGame Schema
const AutoCrashBetSchema = new mongoose.Schema(
  {
    // Basic fields
    user: {
      type: SchemaTypes.ObjectId,
      ref: 'User',
    },

    // Game Betting Amount
    betAmount: {
      type: Number,
      default: 0,
    },

    // Game auto cashout point
    cashoutPoint: {
      type: Number,
      default: 0,
    },

    // Game auto Betting status false = not started, true = started
    status: {
      type: Boolean,
      default: false,
    },

    // When game was created
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    minimize: false,
  }
);

export interface AutoCrashBetDocument extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId | UserDocumentType;
  betAmount: number;
  cashoutPoint: number;
  status: boolean;
  createdAt: Date;
}

// Create and export the new model
const AutoCrashBet: Model<AutoCrashBetDocument> = mongoose.model<AutoCrashBetDocument>(
  'AutoCrashBet',
  AutoCrashBetSchema
);

export default AutoCrashBet;
