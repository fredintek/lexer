import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  USER_STATUS_KEY,
  REQUEST_USER_KEY,
  AUTH_TYPE_KEY,
  AuthType,
} from 'src/lib/constants';
import { UserStatus } from 'src/user/entities/user.entity';

@Injectable()
export class UserStatusGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes =
      this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (authTypes.includes(AuthType.None)) {
      return true;
    }

    // 1. Get required user status from metadata
    const requiredStatus = this.reflector.getAllAndOverride<string[]>(
      USER_STATUS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 3. Get user from request (populated by AccessTokenGuard)
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];

    if (!user) {
      throw new ForbiddenException('User not found in request context');
    }

    // 4. Logic for Superadmin Wildcard
    if (user.role.permissions?.includes('*')) {
      return true;
    }

    if (user.status === UserStatus.DEACTIVATED) {
      throw new ForbiddenException('Account deactivated');
    }

    if (!requiredStatus) {
      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException(
          `Access denied. Your current status is ${user.status}, but this action requires an ACTIVE account.`,
        );
      }
      return true;
    }

    // 4. Logic for Active Users
    const hasPermission = requiredStatus.includes(user.status);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied your status does not support this action`,
      );
    }

    return true;
  }
}
