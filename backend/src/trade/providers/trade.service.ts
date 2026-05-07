import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trade, TradeStatusEnum } from '../entities/trade.entity';
import { Position } from '../entities/position.entity';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { UserService } from 'src/user/providers/user.service';
import { CreateTradeDto } from '../dtos';
import { YfinanceService } from 'src/yfinance/providers/yfinance.service';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade) private tradeRepo: Repository<Trade>,
    @InjectRepository(Position) private posRepo: Repository<Position>,
    private userService: UserService,
    private dataSource: DataSource,
    private yfinanceService: YfinanceService,
  ) {}

  public async executeTrade(userId: string, createTradeDto: CreateTradeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { symbol, quantity, side, priceAtExecution, commission } =
        createTradeDto;

      // 1. Calculate Transaction Fee (1%)
      const grossAmount = quantity * priceAtExecution;

      const user = await this.userService.findById(userId);

      let tradePnl = 0;
      if (side === 'BUY') {
        // BUY Logic: Deduct total cost (Price + Fee)
        const totalCost = grossAmount + commission;
        if (user.balance < totalCost)
          throw new BadRequestException('Insufficient funds');

        user.balance = Number(user.balance) - totalCost;
        await queryRunner.manager.save(user);

        // Update Position for BUY
        let position = await queryRunner.manager.findOne(Position, {
          where: { user: { id: userId }, symbol },
        });

        if (!position) {
          position = queryRunner.manager.create(Position, {
            symbol,
            quantity,
            averageEntryPrice: priceAtExecution,
            user,
          });
        } else {
          const totalQty = position.quantity + quantity;
          position.averageEntryPrice =
            (position.quantity * position.averageEntryPrice +
              quantity * priceAtExecution) /
            totalQty;
          position.quantity = totalQty;
        }
        await queryRunner.manager.save(position);
      } else {
        // SELL Logic: Instant Execution
        const position = await queryRunner.manager.findOne(Position, {
          where: { user: { id: userId }, symbol },
        });

        if (!position || position.quantity < quantity) {
          throw new BadRequestException('Insufficient shares to sell');
        }

        // PnL = (Sell Price - Buy Price) * Quantity
        tradePnl = (priceAtExecution - position.averageEntryPrice) * quantity;

        // A. Deduct shares immediately
        position.quantity -= quantity;
        if (position.quantity === 0) {
          await queryRunner.manager.remove(position);
        } else {
          await queryRunner.manager.save(position);
        }

        // B. Update User Balance Immediately (Price - Commission)
        const netProceeds = grossAmount - commission;
        user.balance = Number(user.balance) + netProceeds;
        await queryRunner.manager.save(user);
      }

      // 2. Record the Trade as COMPLETED for both BUY and SELL
      const trade = queryRunner.manager.create(Trade, {
        ...createTradeDto,
        user,
        commission,
        pnl: tradePnl,
        status: TradeStatusEnum.COMPLETED,
      });

      await queryRunner.manager.save(trade);
      await queryRunner.commitTransaction();
      return trade;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async getUserPositions(userId: string) {
    // 1. Get all positions from DB
    const positions = await this.posRepo.find({
      where: { user: { id: userId } },
    });

    // 2. Get live prices for these symbols from your YFinance service
    const symbols = positions.map((p) => `${p.symbol}.IS`);
    const liveData = await this.yfinanceService.getLiveMarkets(symbols);

    // 3. Merge and Calculate
    const results = await Promise.all(
      positions.map(async (pos) => {
        const live: any = liveData.find((l) => l.symbol === `${pos.symbol}.IS`);

        // Fetch full details to get the website
        const details = await this.yfinanceService.getStockDetails(pos.symbol);
        const website = details?.assetProfile?.website || null;

        const currentPrice = live?.regularMarketPrice || pos.averageEntryPrice;
        const marketValue = pos.quantity * currentPrice;
        const totalCost = pos.quantity * pos.averageEntryPrice;
        const pnl = marketValue - totalCost;
        const pnlPercentage = (pnl / totalCost) * 100;

        return {
          ...pos,
          website,
          currentPrice,
          marketValue,
          pnl,
          pnlPercentage,
          dayChange: live?.regularMarketChangePercent || 0,
        };
      }),
    );

    return results;
  }

  async getTradeHistory(userId: string, status?: string) {
    // 1. Build the dynamic filter
    const where: FindOptionsWhere<Trade> = {
      user: { id: userId },
    };

    // 2. Apply status filter if it exists and matches our enum
    if (status) {
      // Cast to any to handle the enum comparison safely
      where.status = status as any;
    }

    // 3. Execute query with relations and sorting
    return await this.tradeRepo.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
