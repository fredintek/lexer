import { Module } from '@nestjs/common';
import { PositionsController } from './positions.controller';
import { PositionsService } from './providers/positions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { YfinanceModule } from 'src/yfinance/yfinance.module';
import { Positions } from './entities/position.entity';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService],
  imports: [TypeOrmModule.forFeature([User, Positions]), YfinanceModule],
})
export class PositionsModule {}
