import { Module } from '@nestjs/common';
import { TradeController } from './trade.controller';
import { TradeService } from './providers/trade.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Position } from './entities/position.entity';
import { Trade } from './entities/trade.entity';
import { UserModule } from 'src/user/user.module';
import { YfinanceModule } from 'src/yfinance/yfinance.module';

@Module({
  controllers: [TradeController],
  providers: [TradeService],
  imports: [
    TypeOrmModule.forFeature([User, Position, Trade]),
    UserModule,
    YfinanceModule,
  ],
})
export class TradeModule {}
