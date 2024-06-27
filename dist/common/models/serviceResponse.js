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

// src/common/models/serviceResponse.ts
var serviceResponse_exports = {};
__export(serviceResponse_exports, {
  ResponseStatus: () => ResponseStatus,
  ServiceResponse: () => ServiceResponse,
  ServiceResponseSchema: () => ServiceResponseSchema
});
module.exports = __toCommonJS(serviceResponse_exports);
var import_zod = require("zod");
var ResponseStatus = /* @__PURE__ */ ((ResponseStatus2) => {
  ResponseStatus2[ResponseStatus2["Success"] = 0] = "Success";
  ResponseStatus2[ResponseStatus2["Failed"] = 1] = "Failed";
  return ResponseStatus2;
})(ResponseStatus || {});
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResponseStatus,
  ServiceResponse,
  ServiceResponseSchema
});
//# sourceMappingURL=serviceResponse.js.map