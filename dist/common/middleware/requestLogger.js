"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/common/middleware/requestLogger.ts
var requestLogger_exports = {};
__export(requestLogger_exports, {
  default: () => requestLogger_default
});
module.exports = __toCommonJS(requestLogger_exports);
var import_crypto = require("crypto");
var import_http_status_codes = require("http-status-codes");
var import_pino_http = require("pino-http");

// src/common/utils/envConfig.ts
var import_dotenv = __toESM(require("dotenv"));
var import_envalid = require("envalid");
import_dotenv.default.config();
var env = (0, import_envalid.cleanEnv)(process.env, {
  NODE_ENV: (0, import_envalid.str)({ devDefault: (0, import_envalid.testOnly)("test"), choices: ["development", "production", "test"] }),
  HOST: (0, import_envalid.host)({ devDefault: (0, import_envalid.testOnly)("localhost") }),
  PORT: (0, import_envalid.port)({ devDefault: (0, import_envalid.testOnly)(3e3) }),
  CORS_ORIGIN: (0, import_envalid.str)({ devDefault: (0, import_envalid.testOnly)("http://localhost:3000") }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: (0, import_envalid.num)({ devDefault: (0, import_envalid.testOnly)(1e3) }),
  COMMON_RATE_LIMIT_WINDOW_MS: (0, import_envalid.num)({ devDefault: (0, import_envalid.testOnly)(1e3) })
});

// src/common/middleware/requestLogger.ts
var requestLogger = (options) => {
  const pinoOptions = {
    enabled: env.isProduction,
    customProps,
    redact: [],
    genReqId,
    customLogLevel,
    customSuccessMessage,
    customReceivedMessage: (req) => `request received: ${req.method}`,
    customErrorMessage: (_req, res) => `request errored with status code: ${res.statusCode}`,
    customAttributeKeys,
    ...options
  };
  return [responseBodyMiddleware, (0, import_pino_http.pinoHttp)(pinoOptions)];
};
var customAttributeKeys = {
  req: "request",
  res: "response",
  err: "error",
  responseTime: "timeTaken"
};
var customProps = (req, res) => ({
  request: req,
  response: res,
  error: res.locals.err,
  responseBody: res.locals.responseBody
});
var responseBodyMiddleware = (_req, res, next) => {
  const isNotProduction = !env.isProduction;
  if (isNotProduction) {
    const originalSend = res.send;
    res.send = function(content) {
      res.locals.responseBody = content;
      res.send = originalSend;
      return originalSend.call(res, content);
    };
  }
  next();
};
var customLogLevel = (_req, res, err) => {
  if (err || res.statusCode >= import_http_status_codes.StatusCodes.INTERNAL_SERVER_ERROR)
    return "error" /* Error */;
  if (res.statusCode >= import_http_status_codes.StatusCodes.BAD_REQUEST)
    return "warn" /* Warn */;
  if (res.statusCode >= import_http_status_codes.StatusCodes.MULTIPLE_CHOICES)
    return "silent" /* Silent */;
  return "info" /* Info */;
};
var customSuccessMessage = (req, res) => {
  if (res.statusCode === import_http_status_codes.StatusCodes.NOT_FOUND)
    return (0, import_http_status_codes.getReasonPhrase)(import_http_status_codes.StatusCodes.NOT_FOUND);
  return `${req.method} completed`;
};
var genReqId = (req, res) => {
  const existingID = req.id ?? req.headers["x-request-id"];
  if (existingID)
    return existingID;
  const id = (0, import_crypto.randomUUID)();
  res.setHeader("X-Request-Id", id);
  return id;
};
var requestLogger_default = requestLogger();
//# sourceMappingURL=requestLogger.js.map