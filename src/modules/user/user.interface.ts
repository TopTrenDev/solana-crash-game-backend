import mongoose, { Document } from "mongoose";

export interface LeaderboardEntry {
  betAmount: number;
  winAmount: number;
}

export interface IUserModel extends Document {
  username: string;
  email: string;
  password: string;
  avatar: string;
  rank: number;
  credit: number;
  wallet: { publicKey: string; privateKey: string };
  wager: number;
  played: number;
  profit: {
    total: number;
    high: number;
    low: number;
  };
  role: string;
  leaderboard: Map<string, LeaderboardEntry>;
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
  affiliateMoney: Map<string, number>;
  affiliateMoneyCollected: Map<string, number>;
  forgotToken: string | null;
  forgotExpires: number;
  rakebackBalance: Map<string, number>;
  wagerNeededForWithdraw: number;
  totalDeposited: Map<string, number>;
  totalWithdrawn: Map<string, number>;
  customWagerLimit: Map<string, number>;
  avatarLastUpdate: number;
  createdAt: Date;
  updatedAt: Date;
}

export const getId = (req) => {
  if (req.params.id === "me") {
    return req?.user?.userId || "000000000000000000000000";
  }

  return req.params.id;
};
