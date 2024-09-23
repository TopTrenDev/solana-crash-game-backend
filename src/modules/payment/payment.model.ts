// Import Dependencies
import mongoose, { model } from "mongoose";

import { EPAYMENT_STATUS } from "./payment.constant";
import { IPaymentModel } from "./payment.interface";

// Destructure Schema Types
const { Schema } = mongoose;

// Setup Payment Schema
const PaymentSchema = new Schema<IPaymentModel>(
  {
    // Authentication related fields
    userId: { type: String },
    walletAddress: { type: String },
    type: { type: String },
    amount: { type: Number },
    txHash: { type: String },
    status: { type: String, enum: Object.keys(EPAYMENT_STATUS) },
  },
  {
    timestamps: true,
  }
);

export default model<IPaymentModel>("Payment", PaymentSchema);
