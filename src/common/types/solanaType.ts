import { PublicKey } from '@solana/web3.js';

export interface IInstruction {
  accounts: number[];
  data: string;
  programIdIndex: number;
}

export interface IInnerInstruction {
  index: number;
  instructions: IInstruction[];
}

export interface IPostTokenBalance {
  mint: string;
  owner: string;
}

export interface ITransaction {
  blockTime: number;
  meta: {
    err: string | null;
    innerInstructions: IInnerInstruction[];
    postTokenBalances: IPostTokenBalance[];
    postBalances: number[];
    preBalances: number[];
  };
  transaction: {
    message: {
      accountKeys: PublicKey[];
      instructions: IInstruction[];
    };
    signatures: string[];
  };
}
