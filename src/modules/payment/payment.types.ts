import { IUserModel } from "../user/user.interface";

export type TransactionDetails = {
  sender: string;
  receiver: string;
  amount: string;
};

export type TWithDrawProps = {
  amount: number;
  address: string;
};

export type TCheckDepositParam = {
  users: IUserModel[];
};

export type TUpdateBalance = {
  amount: number;
  txHash?: string;
  address: string;
};

export type TSocketWithDrawParam = {
  address: string;
  amount: number;
  password: string;
};

export type TSocketTipParam = {
  username: string;
  amount: number;
  password: string;
};
