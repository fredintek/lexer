import { Controller, Get } from '@nestjs/common';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { TransactionsService } from './providers/transactions.service';
import { Permissions } from 'src/auth/decorators/auth.decorator';
import { PERMISSIONS } from 'src/lib/permissions';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('my-history')
  async getMyTransactions(@ActiveUser() currentUser: ActiveUserInterface) {
    return await this.transactionsService.getUserTransactions(
      currentUser.userId,
    );
  }

  @Get('all')
  @Permissions(PERMISSIONS.CAN_MANAGE_TRANSACTION)
  async getAllTransactions() {
    return await this.transactionsService.getAllTransactions();
  }
}
