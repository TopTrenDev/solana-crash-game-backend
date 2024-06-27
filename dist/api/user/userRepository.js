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

// src/api/user/userRepository.ts
var userRepository_exports = {};
__export(userRepository_exports, {
  userRepository: () => userRepository,
  users: () => users
});
module.exports = __toCommonJS(userRepository_exports);
var users = [
  { id: 1, name: "Alice", email: "alice@example.com", age: 42, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() },
  { id: 2, name: "Bob", email: "bob@example.com", age: 21, createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }
];
var userRepository = {
  findAllAsync: async () => {
    return users;
  },
  findByIdAsync: async (id) => {
    return users.find((user) => user.id === id) || null;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  userRepository,
  users
});
//# sourceMappingURL=userRepository.js.map