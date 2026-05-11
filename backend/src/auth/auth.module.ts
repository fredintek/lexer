import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './providers/auth.service';
import { HashingProvider } from './providers/hashing.provider';
import { BcryptProvider } from './providers/bcrypt.provider';
import { GenerateTokenProvider } from './providers/generate-token.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { EmailModule } from 'src/email/email.module';
import { UserModule } from 'src/user/user.module';
import { LoginHistory } from 'src/user/entities/login-history.entity';
import { RefreshToken } from 'src/user/entities/refresh-tokens.entity';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
    GenerateTokenProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([User, LoginHistory, RefreshToken]),
    EmailModule,
    forwardRef(() => UserModule),
  ],
  exports: [AuthService, GenerateTokenProvider],
})
export class AuthModule {}
