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

// src/api/healthCheck/healthCheckRouter.ts
var healthCheckRouter_exports = {};
__export(healthCheckRouter_exports, {
  healthCheckRegistry: () => healthCheckRegistry,
  healthCheckRouter: () => healthCheckRouter
});
module.exports = __toCommonJS(healthCheckRouter_exports);
var import_zod_to_openapi = require("@asteasolutions/zod-to-openapi");
var import_express = __toESM(require("express"));
var import_http_status_codes3 = require("http-status-codes");
var import_zod2 = require("zod");

// src/api-docs/openAPIResponseBuilders.ts
var import_http_status_codes = require("http-status-codes");

// src/common/models/serviceResponse.ts
var import_zod = require("zod");
var ServiceResponse = class {
  success;
  message;
  responseObject;
  statusCode;
  constructor(status, message, responseObject, statusCode) {
    this.success = status === 0 /* Success */;
    this.message = message;
    this.responseObject = responseObject;
    this.statusCode = statusCode;
  }
};
var ServiceResponseSchema = (dataSchema) => import_zod.z.object({
  success: import_zod.z.boolean(),
  message: import_zod.z.string(),
  responseObject: dataSchema.optional(),
  statusCode: import_zod.z.number()
});

// src/api-docs/openAPIResponseBuilders.ts
function createApiResponse(schema, description, statusCode = import_http_status_codes.StatusCodes.OK) {
  return {
    [statusCode]: {
      description,
      content: {
        "application/json": {
          schema: ServiceResponseSchema(schema)
        }
      }
    }
  };
}

// src/common/utils/httpHandlers.ts
var import_http_status_codes2 = require("http-status-codes");
var handleServiceResponse = (serviceResponse, response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

// src/api/healthCheck/healthCheckRouter.ts
var healthCheckRegistry = new import_zod_to_openapi.OpenAPIRegistry();
var healthCheckRouter = (() => {
  const router = import_express.default.Router();
  healthCheckRegistry.registerPath({
    method: "get",
    path: "/health-check",
    tags: ["Health Check"],
    responses: createApiResponse(import_zod2.z.null(), "Success")
  });
  router.get("/", (_req, res) => {
    const serviceResponse = new ServiceResponse(0 /* Success */, "Service is healthy", null, import_http_status_codes3.StatusCodes.OK);
    handleServiceResponse(serviceResponse, res);
  });
  return router;
})();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  healthCheckRegistry,
  healthCheckRouter
});
//# sourceMappingURL=healthCheckRouter.js.map