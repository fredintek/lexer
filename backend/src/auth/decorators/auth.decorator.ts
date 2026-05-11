import { SetMetadata } from '@nestjs/common';
import {
  AUTH_TYPE_KEY,
  AuthType,
  PERMISSIONS_KEY,
  USER_STATUS_KEY,
} from 'src/lib/constants';

export const Auth = (...args: AuthType[]) => SetMetadata(AUTH_TYPE_KEY, args);
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
export const UserStatus = (...userStatus: string[]) =>
  SetMetadata(USER_STATUS_KEY, userStatus);
