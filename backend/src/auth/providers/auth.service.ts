import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  VerifyLoginOtpDto,
} from '../dtos';
import { DataSource, EntityManager, Not, Repository } from 'typeorm';
import { Request, Response } from 'express';
import { MFAEnum, User, UserStatus } from 'src/user/entities/user.entity';
import { HashingProvider } from './hashing.provider';
import { GenerateTokenProvider } from './generate-token.provider';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/providers/email.service';
import { Role } from 'src/role/entities/roles.entity';
import { REFRESH_TOKEN_ALIAS, SYSTEM_ROLES } from 'src/lib/constants';
import { UserService } from 'src/user/providers/user.service';
import { UAParser } from 'ua-parser-js';
import { LoginHistory } from 'src/user/entities/login-history.entity';
import { ActiveUserInterface } from 'src/lib/types';
import { RefreshToken } from 'src/user/entities/refresh-tokens.entity';
import {
  addMinuitesToCurrentTime,
  generateOTP,
  isDateExpired,
  localizeDate,
} from 'src/lib/helpers';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { authenticator } from 'otplib';

@Injectable()
export class AuthService {
  constructor(
    /**
     * Injecting Datasource
     */
    private readonly datasource: DataSource,

    /**
     * Injecting Hashing Provider
     */
    private readonly hashingProvider: HashingProvider,

    /**
     * Injecting Token Generation Provider
     */
    private readonly tokenGenerator: GenerateTokenProvider,

    /**
     * Injecting User Repository
     */
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    /**
     * Injecting Mail Service
     */
    private readonly emailService: EmailService,

    /**
     * Injecting User Service
     */
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    /**
     * Injecting LoginHistory Repository
     */
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,

    /**
     * Injecting User Repository
     */
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,

    /**
     * Injecting Configservice
     */
    private readonly configService: ConfigService,

    /**
     * Injecting Event Emitter
     */
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async generateUniqueTag(manager: EntityManager): Promise<string> {
    let isUnique = false;
    let tag = '';
    while (!isUnique) {
      tag = `@LX-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const exists = await manager.findOne(User, { where: { tag } });
      if (!exists) isUnique = true;
    }
    return tag;
  }

  public async hashPassowrd(pwd: string) {
    return await this.hashingProvider.hashPassword(pwd);
  }
  /**
   * SIGN UP
   * Authentication: false
   */
  public async register(registerDto: RegisterDto, req: Request, res: Response) {
    const queryRunner = this.datasource.createQueryRunner();
    try {
      // setup  a transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // check if user email exists in DB
      const isUserEmail = await queryRunner.manager.findOne(User, {
        where: {
          email: registerDto.email,
        },
      });

      if (isUserEmail) {
        throw new BadRequestException('User exists');
      }

      // 2. Fetch Default Role (Entity-based RBAC)
      const traderRole = await queryRunner.manager.findOne(Role, {
        where: { name: SYSTEM_ROLES.TRADER },
      });

      // 3. Generate Unique Tag (LEX-XXXX)
      const tag = await this.generateUniqueTag(queryRunner.manager);

      // hash password
      const hashedPassword = await this.hashingProvider.hashPassword(
        registerDto.password,
      );

      // create and save user to the DB
      const createdUser = queryRunner.manager.create(User, {
        fullname: registerDto.fullname,
        email: registerDto.email,
        password: hashedPassword,
        identificationNumber: registerDto?.identificationNumber,
        tag,
        role: traderRole as Role,
      });
      const savedUser = await queryRunner.manager.save(User, createdUser);

      // generate login history
      const history = await this.loginHistory(
        savedUser,
        req,
        true,
        queryRunner.manager,
      );

      if (!history) {
        throw new InternalServerErrorException(
          'Failed to initialize session audit.',
        );
      }

      // generate refresh and access tokens
      const accessToken = await this.tokenGenerator.generateAccessToken(
        savedUser,
        history?.id,
      );
      const refreshToken = await this.tokenGenerator.generateRefreshToken(
        savedUser,
        history.id,
        undefined,
        queryRunner.manager,
      );

      // set refresh token as an http only cookie
      this.tokenGenerator.setRefreshCookie(res, refreshToken);

      // commit transaction
      await queryRunner.commitTransaction();

      // send welcome email
      try {
        await this.emailService.sendUserWelcome(savedUser);
        await this.userRepository.update(savedUser.id, {
          isWelcomeEmailSent: true,
        });
        savedUser.isWelcomeEmailSent = true;
      } catch (emailError) {
        console.error('Failed to send welcome email', emailError);
      }

      // return data
      return {
        message: 'Registration successful',
        user: savedUser,
        accessToken,
      };
    } catch (error: any) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status || 500);
    } finally {
      try {
        // release connection
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException(
          'Could not release connection transaction',
          { description: String(error) },
        );
      }
    }
  }

  public async verifyLoginOtp(
    verifyLoginOtpDto: VerifyLoginOtpDto,
    req: Request,
    res: Response,
  ) {
    // create transaction
    const queryRunner = this.datasource.createQueryRunner();
    try {
      // connect and start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // find user
      const user = await queryRunner.manager.findOne(User, {
        where: {
          id: verifyLoginOtpDto.userId,
        },
      });

      if (!user) throw new NotFoundException('Invalid user');

      /**
       * compare provided verification code with DB verification code
       * Check if verification token is expired
       */
      const isExactVerificationCode =
        this.tokenGenerator.confirmTokenWithDBToken(
          verifyLoginOtpDto.code,
          user.mfaOtpCode!,
        );

      const isExactVerificationCodeExp = isDateExpired(user.mfaOtpExpires);

      if (!isExactVerificationCode || isExactVerificationCodeExp)
        throw new BadRequestException('verification code invalid or expired');

      // update flag in DB user
      user.mfaOtpCode = null;
      user.mfaOtpExpires = null;

      let accessToken: string | undefined = undefined;

      if (verifyLoginOtpDto.createTokens) {
        // generate login history
        const history = await this.loginHistory(user, req, true);

        if (!history) {
          throw new InternalServerErrorException(
            'Failed to initialize session audit.',
          );
        }
        // GENERATE TOKENS
        const tokens = await this.tokenGenerator.generateTokens(
          user,
          history?.id,
          verifyLoginOtpDto.rememberMe ? '7d' : undefined,
        );

        accessToken = tokens.accessToken;

        // SET REFRESH TOKEN IN COOKIES
        this.tokenGenerator.setRefreshCookie(
          res,
          tokens.refreshToken,
          verifyLoginOtpDto.rememberMe ? 7 : undefined,
        );
      }

      // Emit the event (This is non-blocking!)
      // this.eventEmitter.emit('user.activity', {
      //   userId: user.id,
      //   type: 'LOGIN',
      //   description: 'Login Successful',
      // });

      await queryRunner.manager.save(User, user);
      // commit transaction
      await queryRunner.commitTransaction();

      // RETURN USER & ACCESS TOKEN
      return {
        message: verifyLoginOtpDto.createTokens
          ? 'Login Successful'
          : 'Login OTP enabled successfully',
        user,
        ...(accessToken && { accessToken }),
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status ?? 500);
    } finally {
      try {
        // release connection
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException(
          'Could not release transaction connection',
          { description: String(error) },
        );
      }
    }
  }

  /**
   * SIGN IN
   * Authentication: false
   */
  public async login(loginDto: LoginDto, req: Request, res: Response) {
    // Find the user by email
    // We MUST use .addSelect('user.password') because it's excluded by default
    const user = await this.userService.findUserByEmail(loginDto.email);

    // Generic Error for security
    if (!user || !user.password || user.deletedAt) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // deactivated user
    if (user.status === UserStatus.DEACTIVATED) {
      throw new ForbiddenException('Your account has been deactivated');
    }

    // --- ADD THIS ADMIN CHECK ---
    // If the DTO includes isAdmin, or if you're using a specific Admin Login route
    if (loginDto.isAdmin && user.role?.name === 'trader') {
      throw new UnauthorizedException(
        'Access denied. Admin privileges required.',
      );
    }

    // 3. Verify password hash
    const isPasswordValid = await this.hashingProvider.comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    try {
      // --- MFA BRANCH ---
      if (user.isTwoFactorEnabled) {
        if (user.mfaMethod === MFAEnum.EMAIL) {
          const loginOtp = generateOTP();
          const hashedLoginOtp = crypto
            .createHash('sha256')
            .update(loginOtp)
            .digest('hex');
          const loginOtpTokenExp = new Date(addMinuitesToCurrentTime(10));

          // OPTIMIZATION 1: Don't await the Email! Fire and forget or use a Queue.
          // We update the DB, but we don't wait for the SMTP server to respond.
          await this.userRepository.update(user.id, {
            mfaOtpCode: hashedLoginOtp,
            mfaOtpExpires: loginOtpTokenExp,
          });

          // Fire and forget (No 'await')
          await this.emailService
            .sendLoginOtp(user, loginOtp, localizeDate(loginOtpTokenExp))
            .catch((err) => console.error('MFA Email Failed', err));

          return {
            message: 'Please verify the code sent to your email',
            status: 'EMAIL_OTP_REQUIRED',
            userId: user.id,
          };
        }

        if (user.mfaMethod === MFAEnum.TOTP) {
          return {
            message: 'Open your Auth App',
            status: 'APP_OTP_REQUIRED',
            userId: user.id,
          };
        }
      }

      // generate login history
      const history = await this.loginHistory(user, req, true);

      if (!history) {
        throw new InternalServerErrorException(
          'Failed to initialize session audit.',
        );
      }

      // 5. Generate refresh and access tokens
      const { accessToken, refreshToken } =
        await this.tokenGenerator.generateTokens(
          user,
          history.id,
          loginDto.rememberMe ? '7d' : undefined,
        );

      // 6. Set refresh token as an http-only cookie
      this.tokenGenerator.setRefreshCookie(
        res,
        refreshToken,
        undefined,
        loginDto.isAdmin,
      );

      // 8. Return data (Password is already excluded from savedUser/user via @Exclude)
      return {
        message: 'Login successful',
        user,
        accessToken,
      };
    } catch (error) {
      // Emit the event (This is non-blocking!)
      this.eventEmitter.emit('user.activity', {
        userId: user.id,
        type: 'LOGIN',
        description: 'Login Failed',
      });
      throw new InternalServerErrorException('An error occurred during login');
    }
  }

  /**
   * A private login history service helper
   */
  private async loginHistory(
    user: User,
    req: Request,
    wasSuccessful: boolean,
    manager?: EntityManager,
  ) {
    try {
      const parser = new UAParser(req.headers['user-agent']);
      const ua = parser.getResult();

      const ip =
        (req.headers['x-forwarded-for'] as string) ||
        req.ip ||
        req.socket.remoteAddress;

      const browserName = ua.browser.name
        ? `${ua.browser.name} ${ua.browser.version || ''}`
        : 'System/API Tool';
      const osName = ua.os.name
        ? `${ua.os.name} ${ua.os.version || ''}`
        : 'Unknown OS';
      const deviceName =
        ua.device.model || (ua.ua.includes('Postman') ? 'Postman' : 'Desktop');

      const repo = manager
        ? manager.getRepository(LoginHistory)
        : this.loginHistoryRepository;

      return await repo.save({
        user,
        ipAddress: String(ip),
        browser: browserName.trim(),
        os: osName.trim(),
        device: deviceName,
        wasSuccessful,
      });
    } catch (err) {
      console.error('Login history logging failed', err);
      return null;
    }
  }

  public async logout(req: Request, res: Response, isAdmin?: boolean) {
    // 1. Get the refresh token from the cookie
    const adminToken = req.cookies['adminRefreshToken'];
    const traderToken = req.cookies[REFRESH_TOKEN_ALIAS];
    const refreshToken = isAdmin ? adminToken : traderToken;

    if (!isAdmin && refreshToken) {
      try {
        // 2. Remove the token from the database so it can't be used to refresh
        await this.refreshTokenRepository.delete({ token: refreshToken });
      } catch (error) {
        // We log the error but move on; the goal is to clear the cookie anyway
        console.error('Failed to delete refresh token from DB', error);
      }
    }

    // 3. Clear the cookie on the client side
    this.tokenGenerator.setRefreshCookie(res, '', 0, isAdmin);

    return { message: 'Logged out successfully' };
  }

  /**
   * REFRESH ACCESS TOKEN
   */
  public async refreshAccessToken(
    req: Request,
    res: Response,
    isAdmin?: boolean,
  ) {
    // 1. Extract the refresh token from the HttpOnly cookie
    const adminToken = req.cookies['adminRefreshToken'];
    const traderToken = req.cookies[REFRESH_TOKEN_ALIAS];
    const refreshToken = isAdmin ? adminToken : traderToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Login session expired');
    }

    try {
      // 2. Verify the JWT (This checks expiration and signature)
      const payload =
        await this.tokenGenerator.verifyRefreshToken(refreshToken);

      // 3. Database Check: Is this session still valid (not revoked)?
      if (!isAdmin) {
        const savedToken = await this.refreshTokenRepository.findOne({
          where: { token: refreshToken },
          relations: ['user', 'history'],
        });

        if (!savedToken) {
          throw new UnauthorizedException(
            'Session has been revoked or expired',
          );
        }
        // 4. Generate New Tokens (Refresh Token Rotation)
        // We pass the existing historyId to keep the session linked to the same device
        const accessToken = await this.tokenGenerator.generateAccessToken(
          savedToken.user,
          payload?.loginHistoryId,
        );

        return {
          message: 'Refresh successful',
          accessToken,
          user: savedToken.user,
        };
      } else {
        // verify refresh token with jwt
        const payload =
          await this.tokenGenerator.verifyRefreshToken(refreshToken);

        // extract payload from verification and check if user is valid
        const user = await this.userService.findUserByEmail(payload.email);

        // generate new access token
        const accessToken = await this.tokenGenerator.generateAccessToken(user);

        // return user and access token
        return {
          message: 'Refresh successful',
          accessToken,
          user,
        };
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired login session');
    }
  }

  /**
   * FORGOT PASSWORD
   * Authentication: false
   */
  public async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // create a transaction
    const queryRunner = this.datasource.createQueryRunner();

    try {
      // connect and start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // check if email exits in DB
      const user = await queryRunner.manager.findOne(User, {
        where: {
          email: forgotPasswordDto.email,
        },
      });

      if (!user) throw new NotFoundException('Invalid email');

      /**
       * Create reset password token and hash it
       * Create reset password expiration
       * Store values in the DB for target user
       */

      const resetPasswordToken = generateOTP();
      const hashedResetPasswordToken = crypto
        .createHash('sha256')
        .update(resetPasswordToken)
        .digest('hex');

      // seting 30 minuites for reset password token expiration
      const resetPasswordTokenExp = new Date(addMinuitesToCurrentTime(30));
      const resetPasswordTokenExpFormatted = localizeDate(
        resetPasswordTokenExp,
      );

      user.passwordResetToken = hashedResetPasswordToken;
      user.passwordResetTokenExpiration = resetPasswordTokenExp;

      await queryRunner.manager.save(User, user);

      // commit transaction
      await queryRunner.commitTransaction();

      // send reset password email
      try {
        await this.emailService.sendResetPasswordEmail(
          user,
          resetPasswordToken,
          resetPasswordTokenExpFormatted,
        );
      } catch (emailError) {
        console.error('Failed to send welcome email', emailError);
      }

      return {
        message: 'Email sent with password reset instructions',
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status ?? 500);
    } finally {
      try {
        // release connection
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException(
          'Could not release transaction connection',
          { description: String(error) },
        );
      }
    }
  }

  /**
   * RESET PASSWORD
   * Authentication: false
   */
  public async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // create transaction
    const queryRunner = this.datasource.createQueryRunner();
    try {
      // connect and start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // find if user exists with the provided email
      const user = await queryRunner.manager.findOne(User, {
        where: { email: resetPasswordDto.email },
      });

      /**
       * Check if user exists
       * Check if user has password reset token available
       * Check if provide token is same as DB user token
       * Check if token is expired
       */
      if (
        !user ||
        !user.passwordResetToken ||
        !this.tokenGenerator.confirmTokenWithDBToken(
          resetPasswordDto.token,
          user.passwordResetToken,
        ) ||
        isDateExpired(user.passwordResetTokenExpiration)
      )
        throw new BadRequestException('Invalid user or token is expired');

      // update and save user new password
      user.password = await this.hashingProvider.hashPassword(
        resetPasswordDto.password,
      );
      user.passwordResetToken = null;
      user.passwordResetTokenExpiration = null;
      user.changedPasswordAt = new Date();

      await queryRunner.manager.save(User, user);

      // commit transaction
      await queryRunner.commitTransaction();
      // Emit the event (This is non-blocking!)
      this.eventEmitter.emit('user.activity', {
        userId: user.id,
        type: 'SECURITY',
        description: 'Password reset successfully',
      });
      return {
        message: 'Password reset successful',
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status ?? 500);
    } finally {
      try {
        // release connection
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException(
          'Could not release transaction connection',
          { description: String(error) },
        );
      }
    }
  }

  /**
   * UPDATE PASSWORD
   * Authentication: true
   */
  public async updatePassword(
    currentUser: ActiveUserInterface,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    // create transaction
    const queryRunner = this.datasource.createQueryRunner();
    try {
      // connect and start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // check if user exists in db
      const user = await queryRunner.manager.findOne(User, {
        where: {
          email: currentUser.email,
        },
      });

      if (!user) throw new NotFoundException('Invalid user');

      // compare current password with DB user password
      const isPasswordValid = await this.hashingProvider.comparePassword(
        updatePasswordDto.currentPassword,
        user.password as string,
      );

      if (!isPasswordValid) throw new BadRequestException('Invalid password');

      // hash new password and save to DB user
      const hashedPassword = await this.hashingProvider.hashPassword(
        updatePasswordDto.newPassword,
      );

      user.password = hashedPassword;
      user.changedPasswordAt = new Date();

      await queryRunner.manager.save(User, user);

      // commit transaction
      await queryRunner.commitTransaction();

      // Emit the event (This is non-blocking!)
      this.eventEmitter.emit('user.activity', {
        userId: user.id,
        type: 'SECURITY',
        description: 'Password updated Successfully',
      });
      return {
        message: 'Password updated successfully',
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status ?? 500);
    } finally {
      try {
        // release connection
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException(
          'Could not release transaction connection',
          { description: String(error) },
        );
      }
    }
  }

  /**
   * Generate two factor secret
   */
  public async setupTotp(currentUser: ActiveUserInterface) {
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(
      currentUser?.email,
      'esube-bullsyatirim',
      secret,
    );

    const qrCodeImageUrl = await QRCode.toDataURL(uri);

    return { secret, qrCodeImageUrl };
  }

  async activateTotp(
    currentUser: ActiveUserInterface,
    token: string,
    secret: string,
  ) {
    const result = authenticator.verify({ secret, token });

    if (!result) {
      throw new BadRequestException('Invalid 6-digit code');
    }

    await this.userRepository.update(currentUser.userId, {
      mfaSecret: secret,
      isTwoFactorEnabled: true,
      mfaMethod: MFAEnum.TOTP,
    });

    await this.userRepository.increment({ id: currentUser?.userId }, 'tier', 1);

    return { success: true };
  }

  public async verifyTOTP2FA(
    userId: string,
    req: Request,
    res: Response,
    code: string,
    createTokens?: boolean,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException('2FA not set up.');
    }

    const result = authenticator.verify({
      secret: user?.mfaSecret,
      token: code,
    });

    if (!result) {
      throw new BadRequestException('Invalid 2FA code.');
    }

    let accessToken: string | undefined = undefined;

    if (createTokens) {
      // generate login history
      const history = await this.loginHistory(user, req, true);

      if (!history) {
        throw new InternalServerErrorException(
          'Failed to initialize session audit.',
        );
      }
      // GENERATE TOKENS
      const tokens = await this.tokenGenerator.generateTokens(
        user,
        history?.id,
      );

      accessToken = tokens.accessToken;

      // SET REFRESH TOKEN IN COOKIES
      this.tokenGenerator.setRefreshCookie(res, tokens.refreshToken);
    }

    return {
      message: 'valid',
      data: true,
      user,
      ...(accessToken && { accessToken }),
    };
  }

  public async sendEmail2FA(currentUser: ActiveUserInterface) {
    // create transaction
    const queryRunner = this.datasource.createQueryRunner();
    try {
      // connect and start transaction
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // find user
      const user = await queryRunner.manager.findOne(User, {
        where: {
          email: currentUser.email,
        },
      });

      if (!user) throw new NotFoundException('Invalid user');

      // generate and send verification email
      const mfaOtpCode = generateOTP();
      const hashedMfaOtpCode = crypto
        .createHash('sha256')
        .update(mfaOtpCode)
        .digest('hex');

      // email verification token expiration
      const mfaOtpExpires = new Date(
        addMinuitesToCurrentTime(
          parseInt(this.configService.get<string>('mail.email_otp_exp')!),
        ),
      );

      // set new values to user and save user
      user.mfaOtpCode = hashedMfaOtpCode;
      user.mfaOtpExpires = mfaOtpExpires;

      await queryRunner.manager.save(User, user);

      // commit transaction
      await queryRunner.commitTransaction();

      // send verification email
      try {
        await this.emailService.verifyEmail(
          user,
          mfaOtpCode,
          localizeDate(mfaOtpExpires),
        );
      } catch (emailError) {
        console.error('Failed to send welcome email', emailError);
      }

      return {
        message: 'Please check your email inbox and verify your email',
      };
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, error.status ?? 500);
    } finally {
      try {
        // release connection
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException(
          'Could not release transaction connection',
          { description: String(error) },
        );
      }
    }
  }

  /**
   * Verify Email OTP
   * Used during setup/activation OR during a login challenge
   */
  public async verifyEmailOTP(userId: string, code: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaOtpCode', 'mfaOtpExpires', 'isEmailVerified'],
    });

    if (user?.isEmailVerified) {
      throw new BadRequestException('Email Verified');
    }

    if (!user || !user.mfaOtpCode) {
      throw new BadRequestException('No active verification request found.');
    }

    // 1. Hash the incoming plain code to compare with the stored hash
    const mfaOtpCode = this.tokenGenerator.confirmTokenWithDBToken(
      code,
      user.mfaOtpCode as string,
    );

    const mfaOtpCodeExp = isDateExpired(user.mfaOtpExpires);

    if (!mfaOtpCode || mfaOtpCodeExp)
      throw new BadRequestException('verification code invalid or expired');

    // 3. IMPORTANT: Clear the OTP fields immediately after successful verification
    // This ensures the code is "One-Time" only.
    await this.userRepository.update(user.id, {
      mfaOtpCode: null,
      mfaOtpExpires: null,
      isEmailVerified: true,
    });

    return { success: true, message: 'OTP verified successfully' };
  }

  public async toggleMFA(
    currentUser: ActiveUserInterface,
    method?: MFAEnum,
    status?: boolean,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: currentUser.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // CASE 1: User wants to turn 2FA OFF
    if (status === false) {
      await this.userRepository.update(user.id, {
        isTwoFactorEnabled: false,
        mfaMethod: null,
      });
      return { message: 'Two-factor authentication disabled' };
    }

    // 1. Validate prerequisites based on the requested method
    switch (method) {
      case MFAEnum.TOTP:
        // Check if they actually went through the QR scan/verification step
        if (!user.mfaSecret) {
          throw new BadRequestException(
            'TOTP has not been set up. Please verify a QR code first.',
          );
        }
        break;

      case MFAEnum.SMS:
        // Ensure the phone number is in DB and has been verified via OTP
        if (!user.phoneNumber || !user.isPhoneNumberVerified) {
          throw new BadRequestException(
            'Phone number must be verified before enabling SMS 2FA.',
          );
        }
        break;

      case MFAEnum.EMAIL:
        // No extra check needed as email is verified/provided at registration
        if (!user.isEmailVerified) {
          throw new BadRequestException(
            'TOTP has not been set up. Please verify your email',
          );
        }
        break;

      default:
        throw new BadRequestException('Invalid MFA method');
    }

    // 2. Perform the switch
    // We use .update() to be efficient
    await this.userRepository.update(user.id, {
      mfaMethod: method,
      isTwoFactorEnabled: true,
    });

    // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
      userId: user.id,
      type: 'SECURITY',
      description: '2FA Updated',
    });

    return {
      message: `MFA successfully activated using ${MFAEnum[method]}`,
      mfaMethod: method,
      isTwoFactorEnabled: true,
    };
  }

  public async findLoginHistory(currentUser: ActiveUserInterface) {
    const histories = await this.loginHistoryRepository
      .createQueryBuilder('history')
      .innerJoin(
        'refresh_tokens',
        'token',
        'token.login_history_id = history.id',
      )
      .where('history.user_id = :userId', { userId: currentUser.userId })
      .orderBy('history.loginAt', 'DESC')
      .getMany();

    // Map through to identify the current one for the UI
    return histories.map((history) => ({
      ...history,
      isCurrent: history.id === currentUser.loginHistoryId,
    }));
  }

  /**
   * Revoke all sessions except the current one
   */
  public async revokeOtherSessions(
    currentUser: ActiveUserInterface,
    req: Request,
  ) {
    const currentRefreshToken = req.cookies[REFRESH_TOKEN_ALIAS];

    // 1. First, find all tokens that are NOT the current one to get their history IDs
    const otherTokens = await this.refreshTokenRepository.find({
      where: {
        user: { id: currentUser.userId },
        token: Not(currentRefreshToken),
      },
      relations: ['history'],
    });

    const historyIdsToDelete = otherTokens.map((t) => t.history.id);

    // 2. Delete the Refresh Tokens
    const result = await this.refreshTokenRepository.delete({
      user: { id: currentUser.userId },
      token: Not(currentRefreshToken),
    });

    if (historyIdsToDelete.length > 0) {
      await this.loginHistoryRepository.delete(historyIdsToDelete);
    }

    // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
      userId: currentUser.userId,
      type: 'SECURITY',
      description: 'Other sessions revoked',
    });

    return {
      message: `Revoked ${result.affected} sessions.`,
    };
  }
}
