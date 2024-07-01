import { ObjectId } from 'mongoose';

export type TSignUp = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type TSignIn = Omit<TSignUp, 'username' | 'confirmPassword'>;

export interface IAuthInfo {
  userName?: string;
  wallet?: string;
  userId: string;
}

export interface IGenerateParams {
  userId: ObjectId;
  userName?: string;
  wallet?: string;
}
