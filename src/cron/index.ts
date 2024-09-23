import { CustomerUpdate, PendingWithdraw } from "./crons";
import { DashboardUpdate } from "./crons/dashboard-update";
import { DetectDeposit } from "./crons/detect-deposit";

// Cron Jobs
/**
 * Cron expression:
 * 1. Minute (0 - 59)
 * 2. Hour (0 - 23)
 * 3. Day of the month (1 - 31)
 * 4. Month (1 - 12)
 * 5. Day of the week (0 - 6) (Sunday to Saturday, or use names)
 * 6. Year (optional)
 */

// User Subscription Daily Cron Job
// Executes every day at 00:01 AM
const customerUpdateCron = new CustomerUpdate("1 0 * * *", {
  scheduled: true,
});

const dashboardUpdate = new DashboardUpdate("*/5 * * * *", {
  scheduled: true,
});

// Update pendingWithdraw every 1hr
const pendingWithdrawCron = new PendingWithdraw("0 * * * *", {
  scheduled: true,
});

// Detect user deposit
const detectDepositCron = new DetectDeposit("* * * * *", {
  // every minute
  scheduled: true,
});

export const CronJobs = {
  customerUpdateCron,
  dashboardUpdate,
  pendingWithdrawCron,
  detectDepositCron,
};
