import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as crypto from 'crypto';
import { User } from './../../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ActiveUserInterface } from 'src/lib/types';
import { converDayToMilliseconds } from 'src/lib/helpers';
import { REFRESH_TOKEN_ALIAS } from 'src/lib/constants';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RefreshToken } from 'src/user/entities/refresh-tokens.entity';

@Injectable()
export class GenerateTokenProvider {
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
     * Injecting User Repository
     */
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  // Sign Token
  private async signToken<T extends object>(expiresIn: any, payload: T) {
    return await this.jwtService.signAsync<T>(payload, {
      expiresIn,
      secret: this.configService.get('auth.jwt_secret'),
      issuer: this.configService.get('auth.jwt_issuer'),
      audience: this.configService.get('auth.jwt_audience'),
    });
  }

  // Generate Access Token
  public async generateAccessToken(
    user: User,
    historyId?: string,
  ): Promise<string> {
    try {
      const expiresIn = this.configService.get('auth.jwt_expiresIn');
      const accessToken = await this.signToken<ActiveUserInterface>(expiresIn, {
        userId: user.id,
        email: user.email,
        avatar: user.avatar,
        loginHistoryId: historyId,
      });
      return accessToken;
    } catch (error: any) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // Generate Refresh Token
  public async generateRefreshToken(
    user: User,
    historyId: string,
    customRefreshExp?: any,
    manager?: EntityManager,
  ): Promise<string> {
    try {
      const expiresIn =
        customRefreshExp ??
        this.configService.get('auth.jwt_refresh_expiresIn');

      // 1. Generate the JWT string
      const refreshToken = await this.signToken<ActiveUserInterface>(
        expiresIn,
        {
          userId: user.id,
          email: user.email,
          avatar: user.avatar,
          loginHistoryId: historyId,
        },
      );

      // 2. Calculate expiry for the DB record (matching JWT time)
      // Convert '7d' or seconds to a Date object
      const days = parseInt(expiresIn);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + days);

      // 3. PERSIST the token to the DB
      // This allows us to "Not(currentToken)" later to revoke others
      const repo = manager
        ? manager.getRepository(RefreshToken)
        : this.refreshTokenRepository;
      await repo.save({
        token: refreshToken,
        user: { id: user.id },
        expiresAt: expiresAt,
        history: { id: historyId },
      });

      return refreshToken;
    } catch (error: any) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // Generate Combine Refresh And Access Token
  public async generateTokens(
    user: User,
    historyId: string,
    customRefreshExp?: any,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const accessToken = await this.generateAccessToken(user, historyId);
      const refreshToken = await this.generateRefreshToken(
        user,
        historyId,
        customRefreshExp,
      );

      return { accessToken, refreshToken };
    } catch (error: any) {
      throw new HttpException(error.message, error.status || 500);
    }
  }

  // set refresh token cookies
  public setRefreshCookie(
    res: Response,
    refreshToken: string,
    customRefreshExp?: number,
    isAdmin?: boolean,
  ) {
    const env = this.configService.get('app.env');

    const domain = this.configService.get('app.cookie_domain');

    const maxAge =
      customRefreshExp === 0
        ? 0
        : converDayToMilliseconds(
            customRefreshExp ??
              Number(this.configService.get('auth.refresh_token_max_age')),
          );

    res.cookie(
      isAdmin ? 'adminRefreshToken' : REFRESH_TOKEN_ALIAS,
      refreshToken,
      {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge,
        domain,
      },
    );
  }

  // verify refresh token with jwt
  public async verifyRefreshToken(token: string) {
    const payload = await this.jwtService.verifyAsync(token, {
      audience: this.configService.get('auth.jwt_audience'),
      issuer: this.configService.get('auth.jwt_issuer'),
      secret: this.configService.get('auth.jwt_secret'),
    });

    if (!payload.email)
      throw new UnauthorizedException('Login session expired');

    return payload;
  }

  // confirm password reset tokens
  public confirmTokenWithDBToken(data: string, encrypted: string): boolean {
    const newHash = crypto.createHash('sha256').update(data).digest('hex');
    return newHash === encrypted;
  }
}
