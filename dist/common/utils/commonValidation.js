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

// src/common/utils/commonValidation.ts
var commonValidation_exports = {};
__export(commonValidation_exports, {
  commonValidations: () => commonValidations
});
module.exports = __toCommonJS(commonValidation_exports);
var import_zod = require("zod");
var commonValidations = {
  id: import_zod.z.string().refine((data) => !isNaN(Number(data)), "ID must be a numeric value").transform(Number).refine((num) => num > 0, "ID must be a positive number")
  // ... other common validations
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  commonValidations
});
//# sourceMappingURL=commonValidation.js.map