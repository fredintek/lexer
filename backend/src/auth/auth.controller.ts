import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './providers/auth.service';
import { Auth, UserStatus } from './decorators/auth.decorator';
import { AuthType } from 'src/lib/constants';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdateMfaDto,
  UpdatePasswordDto,
  VerifyLoginOtpDto,
} from './dtos';
import { ActiveUser } from './decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { MFAEnum } from 'src/user/entities/user.entity';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    /**
     * Injecting Auth Service
     */
    private readonly authService: AuthService,
  ) {}
  // ================== BASIC AUTHENTICATION ========================
  /**
   * SIGN UP
   * Authentication: false
   */
  @Post('register')
  @Auth(AuthType.None)
  public register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(registerDto, req, res);
  }

  /**
   * LOGIN
   * Authentication: false
   */
  @Post('login')
  @Auth(AuthType.None)
  public login(
    @Body() LoginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(LoginDto, req, res);
  }

  /**
   * LOGOUT
   * Authentication: false
   */
  @Post('logout')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  @HttpCode(HttpStatus.OK)
  public logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() logoutDto?: { isAdmin?: boolean },
  ) {
    return this.authService.logout(req, res, logoutDto?.isAdmin);
  }

  /**
   * REFRESH ACCESS TOKEN
   * Authentication: false
   */
  @Post('refresh-access-token')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public refreshAccessToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() refreshAccessTokenDto?: { isAdmin?: boolean },
  ) {
    return this.authService.refreshAccessToken(
      req,
      res,
      refreshAccessTokenDto?.isAdmin,
    );
  }

  /**
   * FORGOT PASSWORD
   * Authentication: false
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.None)
  public forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  /**
   * RESET PASSWORD
   * Authentication: false
   */
  @Patch('reset-password')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  public resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  /**
   * UPDATE PASSWORD
   * Authentication: true
   */
  @Patch('update-password')
  public updatePassword(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(currentUser, updatePasswordDto);
  }

  /**
   * Get history
   * Authenticate: true
   */
  @Get('login-history')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  public getLoginHistory(@ActiveUser() currencyUser: ActiveUserInterface) {
    return this.authService.findLoginHistory(currencyUser);
  }

  // ================== SESSION CONTROL ========================
  /**
   * Revoke Other Sessions
   * Authentication: true
   */
  @Post('revoke-others')
  public async revokeOthers(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Req() req: Request,
  ) {
    return await this.authService.revokeOtherSessions(currentUser, req);
  }

  // ================== 2FA (TOTP) ========================
  @Post('totp-setup')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  @HttpCode(HttpStatus.OK)
  async totpSetup(@ActiveUser() currentUser: ActiveUserInterface) {
    // Generate the QR code and secret
    return await this.authService.setupTotp(currentUser);
  }

  @Post('activate-totp')
  @HttpCode(HttpStatus.OK)
  async activate(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() body: { code: string; secret: string },
  ) {
    return await this.authService.activateTotp(
      currentUser,
      body.code,
      body.secret,
    );
  }

  @Post('verify-totp')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  public async verifyLogin2FA(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { code: string; createTokens?: boolean; userId: string },
  ) {
    return this.authService.verifyTOTP2FA(
      body.userId,
      req,
      res,
      body.code,
      body.createTokens,
    );
  }

  @Patch('toggle-mfa')
  @HttpCode(HttpStatus.OK)
  public async toggleMfa(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() updateMfaDto: UpdateMfaDto,
  ) {
    return await this.authService.toggleMFA(
      currentUser,
      updateMfaDto.method,
      updateMfaDto.status,
    );
  }

  // ================== 2FA (EMAIL / SMS) ========================
  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() body: { method: MFAEnum.EMAIL | MFAEnum.SMS },
  ) {
    if (body.method === MFAEnum.EMAIL) {
      return await this.authService.sendEmail2FA(currentUser);
    }
  }

  @Patch('verify-email-otp')
  @HttpCode(HttpStatus.OK)
  public async verifyEmailOtp(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() body: { code: string },
  ) {
    return this.authService.verifyEmailOTP(currentUser.userId, body.code);
  }

  @Patch('verify-login-otp')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  public async verifyLoginOtp(
    @Body() verifyLoginOtpDto: VerifyLoginOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyLoginOtp(verifyLoginOtpDto, req, res);
  }
}
