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

// src/api/user/userModel.ts
var userModel_exports = {};
__export(userModel_exports, {
  GetUserSchema: () => GetUserSchema,
  UserSchema: () => UserSchema
});
module.exports = __toCommonJS(userModel_exports);
var import_zod_to_openapi = require("@asteasolutions/zod-to-openapi");
var import_zod2 = require("zod");

// src/common/utils/commonValidation.ts
var import_zod = require("zod");
var commonValidations = {
  id: import_zod.z.string().refine((data) => !isNaN(Number(data)), "ID must be a numeric value").transform(Number).refine((num) => num > 0, "ID must be a positive number")
  // ... other common validations
};

// src/api/user/userModel.ts
(0, import_zod_to_openapi.extendZodWithOpenApi)(import_zod2.z);
var UserSchema = import_zod2.z.object({
  id: import_zod2.z.number(),
  name: import_zod2.z.string(),
  email: import_zod2.z.string().email(),
  age: import_zod2.z.number(),
  createdAt: import_zod2.z.date(),
  updatedAt: import_zod2.z.date()
});
var GetUserSchema = import_zod2.z.object({
  params: import_zod2.z.object({ id: commonValidations.id })
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetUserSchema,
  UserSchema
});
//# sourceMappingURL=userModel.js.map