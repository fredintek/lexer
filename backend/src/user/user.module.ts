import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './providers/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../role/entities/roles.entity';
import { User } from './entities/user.entity';
import { SeedService } from './providers/seed.service';
import { LoginHistory } from './entities/login-history.entity';
import { RefreshToken } from './entities/refresh-tokens.entity';
import { PaymentMethod } from 'src/payment/entities/payment.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Kyc } from 'src/kyc/entities/kyc.entity';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { BcryptProvider } from 'src/auth/providers/bcrypt.provider';
import { UserGateWay } from './gateway/user.gateway';
import { Positions } from 'src/positions/entities/position.entity';
import { Transactions } from 'src/transactions/entities/transactions.entity';
import { FileUploadProvider } from 'src/common/providers/FileUploader';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    SeedService,
    FileUploadProvider,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    UserGateWay,
  ],
  imports: [
    TypeOrmModule.forFeature([
      Role,
      User,
      LoginHistory,
      RefreshToken,
      PaymentMethod,
      Transactions,
      Notification,
      Kyc,
      Positions,
    ]),
    forwardRef(() => AuthModule),
    EmailModule,
  ],
  exports: [UserService],
})
export class UserModule {}
