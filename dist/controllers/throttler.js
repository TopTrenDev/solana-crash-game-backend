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

// src/controllers/throttler.ts
var throttler_exports = {};
__export(throttler_exports, {
  default: () => throttler_default
});
module.exports = __toCommonJS(throttler_exports);
var import_safe = __toESM(require("colors/safe.js"));
var TIME_LIMIT = 250;
var throttleConnections = (socket) => (packet, next) => {
  if (canBeServed(socket, packet))
    return next();
  else
    return socket.emit("notify-error", "Slow down! You must wait a while before doing that again.");
};
var canBeServed = (socket, packet) => {
  if (socket.data.markedForDisconnect)
    return false;
  const previous = socket.data.lastAccess;
  const now = Date.now();
  if (previous) {
    const diff = now - previous;
    if (packet[0] === "auth") {
      socket.data.lastAccess = now;
      return true;
    }
    if (diff < TIME_LIMIT) {
      socket.data.markedForDisconnect = true;
      const clientIp = socket.handshake.headers["x-real-ip"];
      setTimeout(() => {
        console.log(
          import_safe.default.gray("Socket >> IP:"),
          import_safe.default.white(String(clientIp)),
          import_safe.default.gray(`Packet: [${packet.toString()}] NSP: ${socket.nsp.name} Disconnected, reason:`),
          import_safe.default.red("TOO_MANY_EMITS")
        );
        socket.emit("connection_kicked");
        socket.disconnect(true);
      }, 1e3);
      return false;
    }
  }
  socket.data.lastAccess = now;
  return true;
};
var throttler_default = throttleConnections;
//# sourceMappingURL=throttler.js.map