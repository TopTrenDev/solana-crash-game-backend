import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import bcrypt from "bcryptjs";
import jwt, { UserJwtPayload } from "jsonwebtoken";

import { REFRESH_TOKEN_SECRET } from "@/config";
import { IUserModel, LeaderboardEntry } from "@/modules/user/user.interface";
import UserService from "@/modules/user/user.service";
import { CustomError } from "@/utils/helpers";
import { fromBase64 } from "@/utils/helpers/string-helper";
import * as localizations from "@/utils/localizations";
import ILocalization from "@/utils/localizations/localizations.interface";

import { PaymentService } from "../payment";
import { ROLE } from "../user/user.constant";
import AuthService from "./auth.service";
import { IAuthModel, TSignInPayload } from "./auth.types";
import { createWallet } from "@/utils/crypto/solana";
import logger from "@/utils/logger";

export default class AuthController {
  private service: AuthService;
  private userService: UserService;
  private localizations: ILocalization;

  private passwordRegExp = new RegExp(
    /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{6,}/g
  );

  constructor() {
    this.service = new AuthService();
    this.userService = new UserService();

    this.localizations = localizations["en"];
  }

  // username signUp
  signUp = async (data: Partial<IUserModel> & { username: string }) => {
    try {
      const regex = new RegExp(`^${data.username}$`, "i");
      const users = await this.userService.aggregateByPipeline([
        {
          $match: {
            $or: [{ username: regex }, { email: data.email }],
          },
        },
      ]);

      const user = users.length > 0 ? users[0] : null;

      if (user) {
        throw new CustomError(
          11000,
          this.localizations.ERRORS.USER.USER_ALREADY_EXIST
        );
      }

      let newUser: Partial<IUserModel>;

      try {
        if (data.password) {
          data.password = await bcrypt.hash(data.password, 10);
        }

        const newWallet = createWallet();

        data.role = ROLE.MEMBER;
        data.wallet = newWallet;
        data.leaderboard = new Map<string, LeaderboardEntry>([
          ["crash", { betAmount: 0, winAmount: 0 }],
        ]);
        newUser = await this.userService.updateOrInsert(
          { username: data.username },
          data
        );
      } catch (error) {
        if (error.code == 11000) {
          throw new CustomError(
            409,
            this.localizations.ERRORS.USER.USER_ALREADY_EXIST
          );
        }

        throw new Error(this.localizations.ERRORS.USER.USER_NOT_CREATED);
      }

      const authParams = this.service.generate({
        userId: newUser._id,
        role: newUser.role,
      });

      await this.service.updateOrInsert({ userId: newUser._id }, {
        userId: newUser._id,
        refreshToken: authParams.refreshToken,
      } as IAuthModel);

      // @ts-ignore
      delete newUser.password;
      delete newUser.wallet.privateKey;

      return {
        status: 201,
        payload: {
          auth: authParams,
          user: newUser,
        },
      };
    } catch (error) {
      logger.error(error);
      if (error.status === 11000) {
        throw new CustomError(
          409,
          this.localizations.ERRORS.USER.USER_ALREADY_EXIST
        );
      }

      throw new Error(this.localizations.ERRORS.OTHER.SOMETHING_WENT_WRONG);
    }
  };

  // username signIn
  signIn = async (
    { username, password }: TSignInPayload,
    ipAddress: string
  ) => {
    const regex = new RegExp(`^${username}$`, "i");
    let foundUser = await this.userService.getItem({
      username: regex,
    });

    if (!foundUser) {
      throw new Error(
        this.localizations.ERRORS.USER.USERNAME_OR_PASSWORD_INVALID
      );
    }

    const { password: userPassword, _id: userId } = foundUser;

    const passwordInvalid: boolean = await bcrypt.compare(
      password,
      userPassword
    );

    if (!passwordInvalid) {
      throw new Error(
        this.localizations.ERRORS.USER.USERNAME_OR_PASSWORD_INVALID
      );
    }

    const auth = await this.setAuth(foundUser, ipAddress);
    let paymentInformation;

    delete foundUser.password;
    delete foundUser.wallet.privateKey;

    return {
      status: 200,
      payload: {
        auth,
        user: foundUser,
        paymentInformation,
      },
    };
  };

  // update token
  updateToken = async (
    { deviceId, platform },
    refreshToken: { refreshToken: string }
  ) => {
    const authParams = await this.service.getItem(refreshToken, {
      _id: 0,
      userId: 1,
      deviceId: 1,
      platform: 1,
    });

    if (!authParams) {
      throw new CustomError(
        404,
        this.localizations.ERRORS.OTHER.REFRESH_TOKEN_INVALID
      );
    }

    const decodeToken = <UserJwtPayload>(
      jwt.verify(refreshToken.refreshToken, REFRESH_TOKEN_SECRET)
    );

    if (deviceId !== decodeToken?.deviceId) {
      throw new CustomError(403, this.localizations.ERRORS.OTHER.FORBIDDEN);
    }

    const user = await this.userService.getItemById(authParams.userId, {
      password: 0,
    });

    const newAuthParams = this.service.generate({
      userId: user._id,
      role: user.role,
      deviceId: deviceId,
      platform: platform,
    });

    await this.service.create({
      deviceId: deviceId,
      platform: platform,
      userId: user._id,
      refreshToken: authParams.refreshToken,
    } as IAuthModel);

    return {
      status: 201,
      payload: {
        auth: newAuthParams,
        user,
      },
    };
  };

  logout = async ({ deviceId }, info) => {
    if (deviceId !== info.deviceId) {
      throw new CustomError(401, this.localizations.ERRORS.OTHER.UNAUTHORIZED);
    }

    await this.service.delete({
      deviceId,
      userId: info.userId,
      platform: info.platform,
    });

    return { message: "Success" };
  };

  setAuth = async (user: IUserModel, ipAddress?: string) => {
    const auth = this.service.generate({
      userId: user._id,
      role: user.role,
    });
    await this.service.updateOrCreate(
      {
        userId: user._id,
      },
      auth.refreshToken,
      ipAddress
    );

    return auth;
  };

  resetPassword = async (data) => {
    const user = await this.userService.getItemById(data.userId);

    if (!user) {
      throw new CustomError(404, this.localizations.ERRORS.USER.NOT_EXIST);
    }

    const { oldPassword, newPassword } = data;
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new CustomError(
        401,
        this.localizations.ERRORS.USER.OLD_PASSWORD_INVALID
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user._id, { password: hashedPassword });

    return {
      status: 200,
      message: "Password updated successfully",
    };
  };
}
