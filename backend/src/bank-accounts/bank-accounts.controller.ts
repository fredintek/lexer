import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BankAccountsService } from './providers/bank-accounts.service';
import { Permissions, UserStatus } from 'src/auth/decorators/auth.decorator';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dtos';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { PERMISSIONS } from 'src/lib/permissions';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';

@Controller('admin/bank-accounts')
export class BankAccountsController {
  constructor(private readonly service: BankAccountsService) {}

  @Post()
  @Permissions(PERMISSIONS.CAN_MANAGE_BANK_ACCOUNTS)
  create(
    @Body() createBankAccountDto: CreateBankAccountDto,
    @ActiveUser() currentUser: ActiveUserInterface,
  ) {
    return this.service.create(createBankAccountDto, currentUser);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CAN_MANAGE_BANK_ACCOUNTS)
  update(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
    @ActiveUser() currentUser: ActiveUserInterface,
  ) {
    return this.service.update(id, updateBankAccountDto, currentUser);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.CAN_MANAGE_BANK_ACCOUNTS)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/set-active')
  @Permissions(PERMISSIONS.CAN_MANAGE_BANK_ACCOUNTS)
  setActiveAccount(@Param('id') id: string) {
    return this.service.setActiveAccount(id);
  }

  @Get('active')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getActive() {
    return this.service.getActiveAccount();
  }
}
