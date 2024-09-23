import mongoose from "mongoose";

import { IS_PRODUCTION, MONGO_URL, SITE_USER_ID } from "@/config";
import User from "@/modules/user/user.model";

const optionConnect: object = {
  maxPoolSize: !IS_PRODUCTION ? 10 : 50,
};

mongoose.connect(MONGO_URL, optionConnect);

mongoose.Promise = global.Promise;

mongoose.connection.on("connected", async function () {
  console.info("🚀 MongoDB Database connection established successfully");
  const revenue = await User.findById(SITE_USER_ID);
  if (!revenue) {
    const newRevenue = new User({ _id: SITE_USER_ID });
    await newRevenue.save();
    console.log("MongoDB >> Revenue wallet created!");
  }
});

mongoose.connection.on("error", function (err) {
  console.error("connection to mongo failed " + err);
});

mongoose.connection.on("disconnected", function () {
  console.info("mongo db connection closed");
  mongoose.connect(MONGO_URL, optionConnect);
});

export { default as Auth } from "@/modules/auth/auth.model";
export { default as AutoCrashBet } from "@/modules/auto-crash-bet/auto-crash-bet.model";
export { default as ChatHistory } from "@/modules/chat-history/chat-history.model";
export { default as CrashGame } from "@/modules/crash-game/crash-game.model";
export { default as GameHistory } from "@/modules/crash-game/game-history.model";
export { default as Dashboard } from "@/modules/dashboard/dashboard.model";
export { default as Payment } from "@/modules/payment/payment.model";
export { default as SiteTransaction } from "@/modules/site-transaction/site-transaction.model";
export { default as User } from "@/modules/user/user.model";
export { default as UserBot } from "@/modules/user-bot/user-bot.model";
