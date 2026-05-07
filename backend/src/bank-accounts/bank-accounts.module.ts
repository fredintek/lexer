import { Module } from '@nestjs/common';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './providers/bank-accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankAccount } from './entities/bank-accounts.entity';

@Module({
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
  imports: [TypeOrmModule.forFeature([BankAccount])]
})
export class BankAccountsModule {}
