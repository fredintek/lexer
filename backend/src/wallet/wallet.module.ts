import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './providers/wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Transactions } from 'src/transactions/entities/transactions.entity';
import { FileUploadProvider } from 'src/common/providers/FileUploader';

@Module({
  controllers: [WalletController],
  providers: [WalletService, FileUploadProvider],
  imports: [TypeOrmModule.forFeature([Transactions, User])],
})
export class WalletModule {}
