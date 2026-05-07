import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { AUTH_TYPE_KEY, AuthType } from 'src/lib/constants';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Bearer;

  private readonly authTypeGuardMap:
    | Record<AuthType, CanActivate | CanActivate[]>
    | {} = {};

  constructor(
    /**
     * Injecting Nest Js Reflector
     */
    private reflector: Reflector,

    /**
     * Injecting AccessToken Guard
     */
    private accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.None]: { canActivate: () => true },
      [AuthType.Bearer]: this.accessTokenGuard,
    };
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get auth from metadata using the reflector
    const authTypes = this.reflector.getAllAndOverride(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [AuthenticationGuard.defaultAuthType];

    // If AuthType.None is present, allow access without authentication or role checks
    if (authTypes.includes(AuthType.None)) {
      return true;
    }

    for (const authType of authTypes) {
      const guard = this.authTypeGuardMap[authType];

      if (!guard) continue; // If an invalid auth type is encountered, skip

      try {
        if (await guard.canActivate(context)) {
          return true;
        }
      } catch (error) {
        throw error;
      }
    }
    throw new UnauthorizedException();
  }
}
