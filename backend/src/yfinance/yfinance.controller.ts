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

@Controller('yfinance')
export class YfinanceController {
  constructor(private readonly yfinanceService: YfinanceService) {}

  @Get('turkish')
  async getAllTurkishStocks() {
    return await this.yfinanceService.getAllTurkishStocks();
  }

  @Get('static/stocks')
  async getAllStocks() {
    return this.yfinanceService.getStaticStocks();
  }

  @Get('static/stock/:symbol')
  async getStaticStock(@Param('symbol') symbol: string) {
    return this.yfinanceService.getStaticStock(symbol);
  }

  @Get('quote/:symbol')
  async getQuote(@Param('symbol') symbol: string) {
    return await this.yfinanceService.getStockQuote(symbol);
  }

  @Get('details/:symbol')
  async getDetails(@Param('symbol') symbol: string) {
    return await this.yfinanceService.getStockDetails(symbol);
  }

  @Get('history/:symbol')
  async getHistory(
    @Param('symbol') symbol: string,
    @Query('from') from: string,
    @Query('interval') interval: string,
  ) {
    return await this.yfinanceService.getStockHistory(symbol, from, interval);
  }

  @Get(':symbol/news')
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
  getFavorites(@ActiveUser() currentUser: ActiveUserInterface) {
    return this.yfinanceService.getUserFavorites(currentUser?.userId);
  }
}
