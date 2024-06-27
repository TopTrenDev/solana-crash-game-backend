"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/controllers/site-settings.ts
var site_settings_exports = {};
__export(site_settings_exports, {
  getCoinflipState: () => getCoinflipState,
  getCrashState: () => getCrashState,
  getDepositState: () => getDepositState,
  getLoginState: () => getLoginState,
  getMaintenanceState: () => getMaintenanceState,
  getWithdrawState: () => getWithdrawState,
  toggleCoinflip: () => toggleCoinflip,
  toggleCrash: () => toggleCrash,
  toggleDeposits: () => toggleDeposits,
  toggleLogin: () => toggleLogin,
  toggleMaintenance: () => toggleMaintenance,
  toggleWithdraws: () => toggleWithdraws
});
module.exports = __toCommonJS(site_settings_exports);

// src/config/index.ts
var site = {
  // Site configurations on server startup
  enableMaintenanceOnStart: false,
  manualWithdrawsEnabled: true,
  enableLoginOnStart: true,
  // Site endpoints
  backend: {
    productionUrl: "",
    //kujiracasino.com is virtual domain
    developmentUrl: "http://localhost:8080"
  },
  frontend: {
    productionUrl: "",
    //localhost do http://localhost:3000 // else if you deploy it put "https://kujiracasino.com"
    developmentUrl: "http://localhost:3000"
  },
  adminFrontend: {
    productionUrl: "",
    developmentUrl: ""
  }
};

// src/controllers/site-settings.ts
var MAINTENANCE_ENABLED = site.enableMaintenanceOnStart;
var LOGIN_ENABLED = site.enableLoginOnStart;
var DEPOSITS_ENABLED = true;
var WITHDRAWS_ENABLED = true;
var COINFLIP_ENABLED = true;
var CRASH_ENABLED = true;
var getMaintenanceState = () => MAINTENANCE_ENABLED;
var getLoginState = () => LOGIN_ENABLED;
var getDepositState = () => DEPOSITS_ENABLED;
var getWithdrawState = () => WITHDRAWS_ENABLED;
var getCoinflipState = () => COINFLIP_ENABLED;
var getCrashState = () => CRASH_ENABLED;
var toggleMaintenance = () => {
  MAINTENANCE_ENABLED = !MAINTENANCE_ENABLED;
  return true;
};
var toggleLogin = () => {
  LOGIN_ENABLED = !LOGIN_ENABLED;
  return true;
};
var toggleDeposits = () => {
  DEPOSITS_ENABLED = !DEPOSITS_ENABLED;
  return true;
};
var toggleWithdraws = () => {
  WITHDRAWS_ENABLED = !WITHDRAWS_ENABLED;
  return true;
};
var toggleCoinflip = () => {
  COINFLIP_ENABLED = !COINFLIP_ENABLED;
  return true;
};
var toggleCrash = () => {
  CRASH_ENABLED = !CRASH_ENABLED;
  return true;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCoinflipState,
  getCrashState,
  getDepositState,
  getLoginState,
  getMaintenanceState,
  getWithdrawState,
  toggleCoinflip,
  toggleCrash,
  toggleDeposits,
  toggleLogin,
  toggleMaintenance,
  toggleWithdraws
});
//# sourceMappingURL=site-settings.js.map