import mongoose, { Document } from "mongoose";

export interface IUserBotModel extends Document {
  username: string;
  password: string;
  avatar: string;
  rank: number;
  credit: number;
  wager: number;
  played: number;
  profit: {
    total: number;
    high: number;
    low: number;
  };
  hasVerifiedAccount: boolean;
  verifiedPhoneNumber: string | null;
  accountVerified: Date | null;
  banExpires: string;
  selfExcludes: {
    crash: number;
  };
  muteExpires: string;
  transactionsLocked: boolean;
  betsLocked: boolean;
  _affiliatedBy: mongoose.Schema.Types.ObjectId | null;
  affiliateClaimed: Date | null;
  affiliateCode: string | null;
  affiliateMoney: number;
  affiliateMoneyCollected: number;
  forgotToken: string | null;
  forgotExpires: number;
  rakebackBalance: number;
  wagerNeededForWithdraw: number;
  totalDeposited: number;
  totalWithdrawn: number;
  customWagerLimit: number;
  avatarLastUpdate: number;
}
