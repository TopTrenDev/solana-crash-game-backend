import jwt from 'jsonwebtoken';

import { IGenerateParams } from '@/api/auth/authType';
import { authentication } from '@/config';

type TokenResult = {
  token: string;
  expiresIn?: number | string;
};

const { jwtSecret, jwtExpirationTime } = authentication;

export default (
  info: IGenerateParams,
  secret = jwtSecret ?? 'token_secret',
  expiresIn = jwtExpirationTime
): TokenResult => {
  const result: Partial<TokenResult> = {};

  const option = expiresIn ? { expiresIn } : {};

  if (expiresIn) {
    result.expiresIn = expiresIn;
  }

  result.token = jwt.sign(info, secret, option);

  return result as TokenResult;
};
