import { SetMetadata } from '@nestjs/common';
import { AUTH_TYPE_KEY, AuthType, PERMISSIONS_KEY } from 'src/lib/constants';

export const Auth = (...args: AuthType[]) => SetMetadata(AUTH_TYPE_KEY, args);
export const Permissions = (...permissions: string[]) => 
  SetMetadata(PERMISSIONS_KEY, permissions);
