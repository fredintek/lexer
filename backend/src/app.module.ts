import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import dbConfig from './config/db.config';
import mailConfig from './config/mail.config';
import authConfig from './config/auth.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './auth/guards/authentication.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ActivityModule } from './activity/activity.module';
import { PaymentModule } from './payment/payment.module';
import { WalletModule } from './wallet/wallet.module';
import { NotificationModule } from './notification/notification.module';
import { FirebaseModule } from './firebase/firebase.module';
import { RoleModule } from './role/role.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { BannerModule } from './banner/banner.module';
import { ChatModule } from './chat/chat.module';
import { KycModule } from './kyc/kyc.module';
import { YfinanceModule } from './yfinance/yfinance.module';
import { SettingsModule } from './settings/settings.module';
import { PositionsModule } from './positions/positions.module';
import * as path from 'path';
import { UserStatusGuard } from './auth/guards/user-status.guard';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
      load: [appConfig, dbConfig, mailConfig, authConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';
        return {
          type: 'mysql',
          host: config.get<string>('db.host'),
          port: Number(config.get<number>('db.port')),
          username: config.get<string>('db.username'),
          password: config.get<string>('db.password'),
          database: config.get<string>('db.name'),
          autoLoadEntities: true,
          synchronize: false,
          migrationsRun: false,
          migrations: isProduction
            ? ['dist/database/migrations/*.js']
            : [path.join(__dirname, '../database/migrations/*.ts')],
        };
      },
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('auth.jwt_secret'),
        signOptions: {
          audience: configService.get('auth.jwt_audience'),
          issuer: configService.get('auth.jwt_issuer'),
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UserModule,
    EmailModule,
    CloudinaryModule,
    ActivityModule,
    PaymentModule,
    WalletModule,
    NotificationModule,
    FirebaseModule,
    RoleModule,
    BankAccountsModule,
    BannerModule,
    ChatModule,
    KycModule,
    YfinanceModule,
    SettingsModule,
    PositionsModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AccessTokenGuard,
    { provide: APP_GUARD, useClass: AuthenticationGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
    { provide: APP_GUARD, useClass: UserStatusGuard },
  ],
})
export class AppModule {}
