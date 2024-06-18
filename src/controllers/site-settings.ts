// Import Dependencies
import { site } from '@/config/index.js';

// Store site toggle switch states here
// and initialize them to config values
let MAINTENANCE_ENABLED = site.enableMaintenanceOnStart;
let LOGIN_ENABLED = site.enableLoginOnStart;
let DEPOSITS_ENABLED = true;
let WITHDRAWS_ENABLED = true;
let COINFLIP_ENABLED = true;
let CRASH_ENABLED = true;

// Create getters
const getMaintenanceState = () => MAINTENANCE_ENABLED;
const getLoginState = () => LOGIN_ENABLED;
const getDepositState = () => DEPOSITS_ENABLED;
const getWithdrawState = () => WITHDRAWS_ENABLED;
const getCoinflipState = () => COINFLIP_ENABLED;
const getCrashState = () => CRASH_ENABLED;

// Create reducers
const toggleMaintenance = () => {
  MAINTENANCE_ENABLED = !MAINTENANCE_ENABLED;
  return true;
};
const toggleLogin = () => {
  LOGIN_ENABLED = !LOGIN_ENABLED;
  return true;
};
const toggleDeposits = () => {
  DEPOSITS_ENABLED = !DEPOSITS_ENABLED;
  return true;
};
const toggleWithdraws = () => {
  WITHDRAWS_ENABLED = !WITHDRAWS_ENABLED;
  return true;
};
const toggleCoinflip = () => {
  COINFLIP_ENABLED = !COINFLIP_ENABLED;
  return true;
};
const toggleCrash = () => {
  CRASH_ENABLED = !CRASH_ENABLED;
  return true;
};

// Combine transaction getters and reducers
const transactionState = {
  getDepositState,
  toggleDeposits,
  getWithdrawState,
  toggleWithdraws,
};

// Combine game getters and reducers
const gameState = {
  getCoinflipState,
  toggleCoinflip,
  getCrashState,
  toggleCrash,
};

// Export functions
export {
  getMaintenanceState,
  toggleMaintenance,
  getLoginState,
  toggleLogin,
  getDepositState,
  toggleDeposits,
  getWithdrawState,
  toggleWithdraws,
  getCoinflipState,
  toggleCoinflip,
  getCrashState,
  toggleCrash,
};
