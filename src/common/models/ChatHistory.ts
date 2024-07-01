// Import Dependencies
import mongoose, { Document, ObjectId, SchemaTypes, Types } from 'mongoose';

// Destructure Schema Types
const { Schema } = mongoose;

// Setup Race Schema
const ChatHistorySchema = new Schema({
  // Basic fields
  message: String,

  // Sender
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
  },

  // When this chat history was created
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

export interface ChatHistoryDocument extends Document {
  _id: Types.ObjectId;
  message: string;
  user: ObjectId;
  sentAt: Date;
}

// Create and export the new model
const ChatHistory = mongoose.model<ChatHistoryDocument>('ChatHistory', ChatHistorySchema);

export default ChatHistory;
