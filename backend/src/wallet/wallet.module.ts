import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './providers/wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { Transactions } from 'src/transactions/entities/transactions.entity';

@Module({
  controllers: [WalletController],
  providers: [WalletService],
  imports: [CloudinaryModule, TypeOrmModule.forFeature([Transactions, User])],
})
export class WalletModule {}
