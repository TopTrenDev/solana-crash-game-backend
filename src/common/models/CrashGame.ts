// Require Dependencies
import mongoose, { Document, Model } from 'mongoose';

// Setup CrashGame Schema
const CrashGameSchema = new mongoose.Schema(
  {
    // Basic fields
    crashPoint: Number,
    players: Object,
    refundedPlayers: Array,

    // Provably Fair fields
    privateSeed: String,
    privateHash: String,
    publicSeed: {
      type: String,
      default: null,
    },

    // Game status
    status: {
      type: Number,
      default: 1,
      /**
       * Status list:
       *
       * 1 = Not Started
       * 2 = Starting
       * 3 = In Progress
       * 4 = Over
       * 5 = Blocking
       * 6 = Refunded
       */
    },

    // When game was created
    created: {
      type: Date,
      default: Date.now,
    },

    // When game was started
    startedAt: {
      type: Date,
    },
  },
  {
    minimize: false,
  }
);

export interface CrashGameDocument extends Document {
  crashPoint?: number; // Optional as per schema
  players: Record<string, any>; // Required as per schema
  refundedPlayers?: any[]; // Optional as per schema
  privateSeed?: string; // Optional as per schema
  privateHash?: string; // Optional as per schema
  publicSeed?: string; // Optional as per schema, with default null
  status: number; // Required as per schema
  created?: Date; // Optional as per schema, with default Date.now
  startedAt?: Date; // Optional as per schema
}

// Create and export the new model
const CrashGame: Model<CrashGameDocument> = mongoose.model<CrashGameDocument>('CrashGame', CrashGameSchema);

export default CrashGame;
