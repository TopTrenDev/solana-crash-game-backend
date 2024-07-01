import { UserDocumentType } from '@/common/models/User';

export type IChatUser = Pick<UserDocumentType, '_id' | 'username' | 'avatar' | 'hasVerifiedAccount' | 'createdAt'>;
