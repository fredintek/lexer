import { Module } from '@nestjs/common';
import { EmailService } from './providers/email.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './../user/entities/user.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { cwd } from 'process';
import { PugAdapter } from '@nestjs-modules/mailer/adapters/pug.adapter';
import { EmailController } from './email.controller';
import { MailtrapTransport } from 'mailtrap';

@Module({
  providers: [EmailService],
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('app.env');
        return {
          transport:
            // MailtrapTransport({
            //   token: configService.get<string>(
            //     'mail.mailtrap_api_token',
            //   ) as string,
            // }),
            {
              host: configService.get<string>('mail.host'),
              port: Number(configService.get<string>('mail.port')),
              secure: env === 'production',
              auth: {
                user: configService.get<string>('mail.user'),
                pass: configService.get<string>('mail.pass'),
              },
            },
          defaults: {
            from: `Bulls Yatirim <${configService.get<string>('mail.no_reply')}>`,
          },
          template: {
            // dir: join(cwd(), 'dist', 'email', 'templates'),
            dir: join(cwd(), 'src', 'email', 'templates'),
            adapter: new PugAdapter({ inlineCssEnabled: false }),
          },
        };
      },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
