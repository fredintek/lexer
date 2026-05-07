import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './providers/wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  controllers: [WalletController],
  providers: [WalletService],
  imports: [CloudinaryModule, TypeOrmModule.forFeature([Transaction, User])],
})
export class WalletModule {}
