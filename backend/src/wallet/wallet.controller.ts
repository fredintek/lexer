import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { WalletService } from './providers/wallet.service';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { CreateDepositDto, WithdrawRequestDto } from './dtos';
import { Permissions, UserStatus } from 'src/auth/decorators/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  TransactionStatus,
  TransactionType,
} from './entities/transaction.entity';
import { PERMISSIONS } from 'src/lib/permissions';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('history')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getHistory(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
  ) {
    return this.walletService.getHistory(currentUser, type, status);
  }

  @Post('withdraw')
  async withdraw(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() withdrawRequestDto: WithdrawRequestDto,
  ) {
    return this.walletService.requestWithdrawal(
      currentUser,
      withdrawRequestDto,
    );
  }

  @Post('deposit')
  @UseInterceptors(FileInterceptor('receipt'))
  public createDeposit(
    @ActiveUser() activeUser: ActiveUserInterface,
    @Body() createDepositDto: CreateDepositDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.walletService.createDepositTransaction(
      activeUser,
      createDepositDto,
      file,
    );
  }

  @Get('tx/stats/pending')
  @Permissions(PERMISSIONS.CAN_MANAGE_TRANSACTION)
  async getTxStats(@Query('type') type: TransactionType) {
    return this.walletService.txStats(type);
  }

  @Get('withdrawal/stats/flow')
  @Permissions(PERMISSIONS.CAN_MANAGE_TRANSACTION)
  async getChartStats() {
    return this.walletService.getChartStats();
  }

  @Get('tx')
  @Permissions(PERMISSIONS.CAN_MANAGE_TRANSACTION)
  getAllTx(
    @Query('search') search: string,
    @Query('status') status: string,
    @Query('type') type: TransactionType,
  ) {
    return this.walletService.getAllTx({ search, status, type });
  }

  @Patch('tx/:id/approve')
  @Permissions(PERMISSIONS.CAN_MANAGE_TRANSACTION)
  approveTransaction(@Param('id') id: string) {
    return this.walletService.approveTransaction(id);
  }

  @Patch('tx/:id/reject')
  @Permissions(PERMISSIONS.CAN_MANAGE_TRANSACTION)
  rejectTransaction(
    @Param('id') id: string,
    @Body() body?: { adminNote?: string },
  ) {
    return this.walletService.rejectTransaction(id, body?.adminNote);
  }
}
