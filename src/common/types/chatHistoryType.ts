import { Types } from 'mongoose';

import { IChatUser } from './userType';

export type IchatEmitHistory = {
  _id: Types.ObjectId;
  message: string;
  sentAt: Date;
  user?: IChatUser;
  histories?: any;
};
