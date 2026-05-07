import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, REQUEST_USER_KEY } from 'src/lib/constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get required permissions from metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 2. If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 3. Get user from request (populated by AccessTokenGuard)
    const request = context.switchToHttp().getRequest();
    const user = request[REQUEST_USER_KEY];

    if (!user || !user.role) {
      throw new ForbiddenException('User or Role not found in request context');
    }

    // 4. Logic for Superadmin Wildcard
    if (user.role.permissions?.includes('*')) {
      return true;
    }

    // 5. Check if user has all required permissions
    const hasPermission = requiredPermissions.every((permission) =>
      user.role.permissions?.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}