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

// src/common/middleware/errorHandler.ts
var errorHandler_exports = {};
__export(errorHandler_exports, {
  default: () => errorHandler_default
});
module.exports = __toCommonJS(errorHandler_exports);
var import_http_status_codes = require("http-status-codes");
var unexpectedRequest = (_req, res) => {
  res.sendStatus(import_http_status_codes.StatusCodes.NOT_FOUND);
};
var addErrorToRequestLog = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};
var errorHandler_default = () => [unexpectedRequest, addErrorToRequestLog];
//# sourceMappingURL=errorHandler.js.map