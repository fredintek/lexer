import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { RecipientMode, SendBroadcastDto } from '../dtos';
import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActiveUserInterface } from 'src/lib/types';

@Injectable()
export class EmailService {
  constructor(
    /**
     * Injecting MailerService
     */
    private mailerService: MailerService,

    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  /**
   * send welcome email for newly registered users
   */
  public async sendUserWelcome(user: User) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Lexus Trader',
        template: 'welcome',
        context: { user, ur: 'http://localhost:3001' },
      });
    } catch (error) {
      console.log('welcome email error -->', error);
    }
  }

  /**
   * send reset password
   */
  public async sendResetPasswordEmail(
    user: User,
    token: string,
    expirationTime: string,
  ) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset your password',
      template: 'reset-password',
      context: { user, token, expirationTime },
    });
  }

  /**
   * Verify Email
   */
  public async verifyEmail(user: User, token: string, expiration: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Verify your email',
      template: 'verify-email',
      context: { user, token, expiration },
    });
  }

  /**
   * Send Login OTP
   */
  public async sendLoginOtp(user: User, token: string, expiration: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Login OTP',
      template: 'login-otp',
      context: { user, token, expiration },
    });
  }

  /**
   * Send generic email
   */
  public async sendEmail(user: User, title: string, desc: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Lexus Trader',
        template: 'generic',
        context: { user, title, desc },
      });
    } catch (error) {
      console.log('welcome email error -->', error);
    }
  }

  public async broadcastEmail(
    dto: SendBroadcastDto,
    currentUser: ActiveUserInterface,
  ) {
    const { mode, userIds, subject, message } = dto;

    if (mode === RecipientMode.ALL) {
      // Processing in chunks of 500 to prevent memory overflow
      const chunkSize = 500;
      let skip = 0;

      while (true) {
        const users = await this.userRepo
          .createQueryBuilder('user')
          .leftJoin('user.role', 'role')
          .select(['user.id', 'user.email', 'user.fullname'])
          .where('user.id != :senderId', { senderId: currentUser?.userId })
          .andWhere('role.name != :adminRole', { adminRole: 'superadmin' })
          .take(chunkSize)
          .skip(skip)
          .getMany();

        if (users.length === 0) break;

        await Promise.all(
          users.map((user) => this.sendEmail(user, subject, message)),
        );
        skip += chunkSize;
      }
    } else {
      const targetIds =
        userIds?.filter((id) => id !== currentUser?.userId) || [];
      if (targetIds.length === 0) return { success: true, count: 0 };
      const users = await this.userRepo.find({
        where: { id: In(targetIds as readonly string[]) },
        select: ['email', 'fullname'],
      });

      await Promise.all(
        users.map((user) => this.sendEmail(user, subject, message)),
      );
    }

    return { success: true, count: userIds?.length || 'All' };
  }

  public async sendAdminInvitation(
    email: string,
    body: { fullname: string; tempPassword: string; loginUrl: string },
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'New Lexer User',
        template: 'admin-invitation',
        context: {
          email,
          fullname: body.fullname,
          loginUrl: body.loginUrl,
          tempPassword: body.tempPassword,
        },
      });
    } catch (error) {
      console.log('welcome email error -->', error);
    }
  }
}
