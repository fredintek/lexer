import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { UserService } from 'src/user/providers/user.service';
import { instanceToPlain } from 'class-transformer';
import { REQUEST_USER_KEY } from 'src/lib/constants';
import { UserStatus } from 'src/user/entities/user.entity';
import { GenerateTokenProvider } from '../providers/generate-token.provider';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    /**
     * Injecting JWT Service
     */
    private readonly jwtService: JwtService,

    /**
     * Injecting Config Service
     */
    private readonly configService: ConfigService,

    /**
     * Injecting User Service
     */
    private readonly userService: UserService,

    private readonly tokenGenerator: GenerateTokenProvider,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    // extract request
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    // extract access token from the request
    const accessToken = this.extractTokenFromRequestHeader(request);

    // Check if the access token exists
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    try {
      // verify access token
      const payload = await this.jwtService.verifyAsync(accessToken, {
        audience: this.configService.get('auth.jwt_audience'),
        issuer: this.configService.get('auth.jwt_issuer'),
        secret: this.configService.get('auth.jwt_secret'),
        maxAge: this.configService.get('auth.jwt_expiresIn'),
      });

      const user = await this.userService.findUserByEmail(payload.email);

      if (!user) throw new UnauthorizedException('Invalid user');

      if (user.status === UserStatus.DEACTIVATED) {
        this.tokenGenerator.setRefreshCookie(response, '', 0);
        throw new UnauthorizedException('Your account has been deactivated');
      }

      // Add the user id to the request context
      request[REQUEST_USER_KEY] = {
        ...instanceToPlain(user),
        loginHistoryId: payload.loginHistoryId,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private extractTokenFromRequestHeader(request: Request): string | null {
    // get authorization header
    const authHeader = request.headers.authorization;

    if (!authHeader) return null;

    // extract token from authorization header
    return authHeader?.trim().split(' ')[1];
  }
}
