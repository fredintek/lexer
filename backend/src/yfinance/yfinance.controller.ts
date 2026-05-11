import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { YfinanceService } from './providers/yfinance.service';
import { UpdateLotSettingsDto } from './dtos';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { UserStatus } from 'src/auth/decorators/auth.decorator';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';

@Controller('yfinance')
export class YfinanceController {
  constructor(private readonly yfinanceService: YfinanceService) {}

  @Get('turkish')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getAllTurkishStocks() {
    return await this.yfinanceService.getAllTurkishStocks();
  }

  @Get('static/stocks')
  async getAllStocks() {
    return this.yfinanceService.getStaticStocks();
  }

  @Get('static/stock/:symbol')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getStaticStock(@Param('symbol') symbol: string) {
    return this.yfinanceService.getStaticStock(symbol);
  }

  @Get('quote/:symbol')
  async getQuote(@Param('symbol') symbol: string) {
    return await this.yfinanceService.getStockQuote(symbol);
  }

  @Get('details/:symbol')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getDetails(@Param('symbol') symbol: string) {
    return await this.yfinanceService.getStockDetails(symbol);
  }

  @Get('history/:symbol')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getHistory(
    @Param('symbol') symbol: string,
    @Query('from') from: string,
    @Query('interval') interval: string,
  ) {
    return await this.yfinanceService.getStockHistory(symbol, from, interval);
  }

  @Get(':symbol/news')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getStockNews(@Param('symbol') symbol: string) {
    return await this.yfinanceService.getStockNews(symbol);
  }

  @Get('live-markets')
  async getLiveMarkets() {
    return await this.yfinanceService.getLiveMarkets();
  }

  @Patch(':symbol/lot-settings')
  async updateLotSettings(
    @Param('symbol') symbol: string,
    @Body() updateLotSettingsDto: UpdateLotSettingsDto,
  ) {
    return this.yfinanceService.updateLotSettings(symbol, updateLotSettingsDto);
  }

  @Patch(':symbol/adjustments')
  async updateAdjustments(
    @Param('symbol') symbol: string,
    @Body() body: { buyAdj: number; sellAdj: number },
  ) {
    return this.yfinanceService.updateStockAdjustments(symbol, body);
  }

  @Post('favorite/:symbol')
  toggleFavorite(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Param('symbol') symbol: string,
  ) {
    return this.yfinanceService.toggleFavorite(currentUser?.userId, symbol);
  }

  @Get('favorites')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  getFavorites(@ActiveUser() currentUser: ActiveUserInterface) {
    return this.yfinanceService.getUserFavorites(currentUser?.userId);
  }
}
