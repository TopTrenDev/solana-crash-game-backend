import { Document, ObjectId } from "mongoose";

import { PLATFORM } from "./auth.constant";

export interface IAuthInfo {
  deviceId?: string;
  platform?: PLATFORM;
  role: string;
  userId: ObjectId;
}

export interface IUpdateOrCreate {
  userId: ObjectId;
}

export interface IGenerateParams {
  deviceId?: string;
  platform?: PLATFORM;
  role: string;
  userId: ObjectId;
}

export interface IAuthModel extends Document {
  userId: ObjectId;
  deviceId?: string;
  platform?: PLATFORM;
  refreshToken?: string;
  ipAddress?: string;
}

export type TSignInPayload = {
  username: string;
  password: string;
};
