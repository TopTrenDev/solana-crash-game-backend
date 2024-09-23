import { Document } from "mongoose";

import { EPAYMENT_STATUS } from "./payment.constant";

export interface IPaymentModel extends Document {
  userId?: string;
  walletAddress?: string;
  type?: string;
  amount: number;
  txHash?: string;
  status?: EPAYMENT_STATUS;
}
