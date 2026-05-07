import { Module } from '@nestjs/common';
import { YfinanceController } from './yfinance.controller';
import { YfinanceService } from './providers/yfinance.service';
import { TradeGateway } from './gateways/trade.gateway';
import { SeedService } from './providers/seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stocks } from './entities/stocks.entity';
import { Favorite } from './entities/favoriteStock.entity';

@Module({
  controllers: [YfinanceController],
  providers: [YfinanceService, TradeGateway, SeedService],
  exports: [YfinanceService],
  imports: [TypeOrmModule.forFeature([Stocks, Favorite])],
})
export class YfinanceModule {}
