import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TradeService } from './providers/trade.service';
import { CreateTradeDto } from './dtos';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';
import { UserStatus } from 'src/auth/decorators/auth.decorator';

@Controller('trade')
export class TradeController {
  constructor(private tradeService: TradeService) {}

  @Post('execute')
  async executeTrade(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() createTradeDto: CreateTradeDto,
  ) {
    return this.tradeService.executeTrade(currentUser?.userId, createTradeDto);
  }

  @Get('positions')
  async getUserPositions(@ActiveUser() currentUser: ActiveUserInterface) {
    return this.tradeService.getUserPositions(currentUser?.userId);
  }

  @Get('history')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getTradeHistory(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Query('status') status?: string,
  ) {
    return this.tradeService.getTradeHistory(currentUser?.userId, status);
  }
}
