import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActiveUserInterface } from 'src/lib/types';
import { CreatePositionDto, EditUserPositionDto } from '../dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DataSource, In, Repository } from 'typeorm';
import { YfinanceService } from 'src/yfinance/providers/yfinance.service';
import { Positions, PositionStatus } from '../entities/position.entity';
import {
  Transactions,
  TransactionType,
} from 'src/transactions/entities/transactions.entity';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Positions)
    private readonly positionRepository: Repository<Positions>,

    private readonly yfinance: YfinanceService,

    private dataSource: DataSource,
  ) {}

  public isMarketOpen(): boolean {
    // Get current day specifically in Turkey Time
    const turkeyTime = new Date().toLocaleString('en-US', {
      timeZone: 'Europe/Istanbul',
      weekday: 'short',
    });

    // turkeyTime will be "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", or "Sun"
    const isWeekend = turkeyTime === 'Sat' || turkeyTime === 'Sun';

    return !isWeekend;
  }

  public async createBuyOrder(
    currentUser: ActiveUserInterface,
    createPositionDto: CreatePositionDto,
  ) {
    const stockData = await this.yfinance.getStockDetails(
      createPositionDto.symbol,
    );
    const currentPrice = Number(stockData?.financialData?.currentPrice);

    if (!currentPrice) {
      throw new BadRequestException('Could not retrieve valid market price');
    }

    const requiredMargin = createPositionDto.lots * currentPrice;
    const isMarketOpen = this.isMarketOpen();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: currentUser.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new NotFoundException('User not found');
      if (Number(user.balance) < requiredMargin) {
        throw new BadRequestException('Insufficient balance');
      }

      // Identify if there is an existing position to merge into
      let targetPosition = await queryRunner.manager.findOne(Positions, {
        where: {
          user: { id: user.id },
          symbol: createPositionDto.symbol,
          status: PositionStatus.OPEN,
        },
      });

      let wasMerged = false;

      if (targetPosition && isMarketOpen) {
        wasMerged = true;
        // 1. MERGE LOGIC
        const oldLots = Number(targetPosition.lots);
        const newLots = Number(createPositionDto.lots);
        const totalLots = oldLots + newLots;

        const totalValue =
          oldLots * Number(targetPosition.averageEntryPrice) +
          newLots * currentPrice;
        const newAveragePrice = totalValue / totalLots;

        targetPosition.lots = totalLots;
        targetPosition.averageEntryPrice = newAveragePrice;
        targetPosition.marginUsed =
          Number(targetPosition.marginUsed) + requiredMargin;
        targetPosition.displayLot = totalLots;
        targetPosition.displayCost = newAveragePrice;
      } else {
        wasMerged = false;
        // 2. CREATE NEW LOGIC (Assign to targetPosition so we can save it later)
        targetPosition = queryRunner.manager.create(Positions, {
          user,
          symbol: createPositionDto.symbol,
          type: createPositionDto.type,
          lots: createPositionDto.lots,
          startingPrice: currentPrice,
          averageEntryPrice: currentPrice,
          multiplier: createPositionDto.multiplier || 1,
          marginUsed: requiredMargin,
          status: isMarketOpen ? PositionStatus.OPEN : PositionStatus.WAITING,
          website: stockData?.assetProfile?.website ?? '',
          displayLot: createPositionDto.lots,
          displayCost: currentPrice,
          openingDate: new Date(),
        });
      }

      // 3. Deduct Balance
      user.balance = Number(user.balance) - requiredMargin;

      // 4. Save both (the user and the position—whether it was new or existing)
      await queryRunner.manager.save(user);
      const savedResult = await queryRunner.manager.save(targetPosition);

      // TRANSACTIONS
      const balanceBefore = Number(user.balance) + requiredMargin;
      const tx = queryRunner.manager.create(Transactions, {
        type:
          targetPosition.status === PositionStatus.WAITING
            ? TransactionType.BUY_WAITING
            : wasMerged
              ? TransactionType.BUY_MERGE
              : TransactionType.BUY_OPEN,
        user,
        symbol: createPositionDto.symbol,
        position: savedResult,
        lots: createPositionDto.lots,
        priceAtExecution: currentPrice,
        marginAmount: requiredMargin,
        balanceBefore,
        balanceAfter: Number(user.balance),
        notes: wasMerged
          ? `Merged into existing position. New avg: ${targetPosition.averageEntryPrice}`
          : undefined,
      });

      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: isMarketOpen
          ? 'Position updated/opened'
          : 'Order placed in waiting',
        data: savedResult,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async getMyAssets(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // 1. Fetch all non-closed positions (Open + Waiting)
    const allActivePositions = await this.positionRepository.find({
      where: {
        user: { id: userId },
        status: In([PositionStatus.OPEN, PositionStatus.WAITING]),
      },
    });

    // 2. Fetch some recent closed positions for the history metric if needed
    const closedPositions = await this.positionRepository.find({
      where: { user: { id: userId }, status: PositionStatus.CLOSED },
      order: { closingDate: 'DESC' },
      take: 10,
    });

    const cancelledPositions = await this.positionRepository.find({
      where: { user: { id: userId }, status: PositionStatus.CANCELLED },
      order: { closingDate: 'DESC' },
    });

    let totalUnrealizedPnL = 0;
    let livePortfolioValue = 0; // Current value of OPEN stocks
    let waitingMarginValue = 0; // Cash locked in WAITING stocks

    // 3. Process Positions
    const openList: any[] = [];
    const waitingList: any[] = [];

    for (const pos of allActivePositions) {
      if (pos.status === PositionStatus.OPEN) {
        const stockData = await this.yfinance.getStockDetails(pos.symbol);
        const currentPrice = Number(
          stockData?.financialData?.currentPrice || pos.startingPrice,
        );

        const pnl =
          pos.type === 'BUYING'
            ? (currentPrice - Number(pos.startingPrice)) * Number(pos.lots)
            : (Number(pos.startingPrice) - currentPrice) * Number(pos.lots);

        const finalPosPnL =
          pnl * Number(pos.multiplier) - Number(pos.commission);

        totalUnrealizedPnL += finalPosPnL;
        livePortfolioValue += Number(pos.marginUsed) + finalPosPnL;

        openList.push({ ...pos, currentPrice, livePnL: finalPosPnL });
      } else if (pos.status === PositionStatus.WAITING) {
        // Waiting positions: No P&L yet, just reserved margin
        waitingMarginValue += Number(pos.marginUsed);
        waitingList.push(pos);
      }
    }

    // 4. Financial Metrics
    const idleCash = Number(user.balance);
    // Portfolio = Live Value of Open Stocks + Reserved Cash for Waiting Stocks
    const stockPortfolio = livePortfolioValue + waitingMarginValue;
    const totalAssets = idleCash + stockPortfolio;

    return {
      // Top Bar Metrics
      metrics: {
        totalAssets, // ₺ Sum of everything
        idleCash, // ₺ Available to spend
        stockPortfolio, // ₺ Total value tied up in market/orders
        instantaneousKZ: totalUnrealizedPnL, // Live P&L (Only from Open)
      },
      // Tables Data
      tables: {
        open: openList,
        waiting: waitingList,
        closed: closedPositions,
        cancelled: cancelledPositions,
      },
      counts: {
        open: openList.length,
        waiting: waitingList.length,
        closed: closedPositions.length,
        cancelled: cancelledPositions.length,
      },
    };
  }

  public async cancelWaitingOrder(
    currentUser: ActiveUserInterface,
    positionId: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Fetch the position and lock the user row
      const position = await queryRunner.manager.findOne(Positions, {
        where: { id: positionId, user: { id: currentUser.userId } },
        relations: ['user'],
      });

      // 2. Security Check: Only 'WAITING' orders can be cancelled/refunded
      if (!position) {
        throw new NotFoundException('Order not found');
      }

      if (position.status !== PositionStatus.WAITING) {
        throw new BadRequestException(
          'Only waiting orders can be cancelled. Use Close for open positions.',
        );
      }

      const user = position.user;
      const refundAmount = Number(position.marginUsed);
      const balanceBefore = Number(user.balance);

      // 3. Refund the user's balance
      user.balance = balanceBefore + refundAmount;
      await queryRunner.manager.save(user);

      position.status = PositionStatus.CANCELLED;
      position.closingDate = new Date();

      position.marginUsed = 0;
      await queryRunner.manager.save(position);

      // ✅ Record transaction atomically
      const tx = queryRunner.manager.create(Transactions, {
        type: TransactionType.CANCEL,
        symbol: position.symbol,
        lots: Number(position.lots),
        priceAtExecution: Number(position.startingPrice),
        marginAmount: refundAmount,
        realizedPnL: 0,
        commission: 0,
        balanceBefore,
        balanceAfter: Number(user.balance),
        notes: `Waiting order cancelled. ₺${refundAmount.toLocaleString('tr-TR')} refunded.`,
        user,
        position,
      });

      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();

      return {
        success: true,
        message: `Order cancelled. ₺${refundAmount.toLocaleString('tr-TR')} refunded to your balance.`,
        newBalance: user.balance,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async sellPosition(
    currentUser: ActiveUserInterface,
    positionId: string,
    lotsToSell: number,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const position = await queryRunner.manager.findOne(Positions, {
        where: { id: positionId, user: { id: currentUser.userId } },
        relations: ['user'],
      });

      if (!position || position.status !== PositionStatus.OPEN) {
        throw new BadRequestException('Only open positions can be sold');
      }

      // SECURITY: Ensure we are selling against the Source of Truth 'lots'
      if (lotsToSell > Number(position.lots)) {
        throw new BadRequestException(
          'Cannot sell more than the actual owned lots',
        );
      }

      const stockData = await this.yfinance.getStockDetails(position.symbol);
      const exitPrice = Number(stockData?.financialData?.currentPrice);

      // 1. Calculations based on Source of Truth
      const actualTotalLots = Number(position.lots);
      const actualMarginUsed = Number(position.marginUsed);
      const actualCommission = Number(position.commission || 0);

      const saleRatio = lotsToSell / actualTotalLots;

      // 2. Pro-rata Financials
      const marginToRelease = actualMarginUsed * saleRatio;
      const commissionToDeduct = actualCommission * saleRatio;

      // P&L uses 'startingPrice' (Actual) not 'displayCost' (Admin)
      const pnlPerLot =
        position.type === 'BUYING'
          ? exitPrice - Number(position.startingPrice)
          : Number(position.startingPrice) - exitPrice;

      const grossPnL = pnlPerLot * lotsToSell * Number(position.multiplier);
      const netRealizedPnL = grossPnL - commissionToDeduct;

      // 3. Update User Balance
      const user = position.user;
      const totalPayout = marginToRelease + netRealizedPnL;
      const balanceBefore = Number(user.balance);

      user.balance = balanceBefore + totalPayout;
      await queryRunner.manager.save(user);

      const isFullSell = lotsToSell === actualTotalLots;

      // 4. Update Position Record
      if (lotsToSell === actualTotalLots) {
        // FULL SELL
        position.status = PositionStatus.CLOSED;
        position.lots = 0;
        position.displayLot = 0; // Sync UI
        position.marginUsed = 0;
        position.realizedPnL = netRealizedPnL;
        position.exitPrice = exitPrice;
        position.closingDate = new Date();
      } else {
        // PARTIAL SELL
        position.lots = actualTotalLots - lotsToSell;
        position.marginUsed = actualMarginUsed - marginToRelease;
        position.commission = actualCommission - commissionToDeduct;

        // UPDATE DISPLAY: Sync the display lot to the new actual lot count
        position.displayLot = position.lots;

        // We keep displayCost as it was (Admin's preferred cost view)
        // unless you want it to revert to the actual starting price.

        position.cumulativeRealizedPnL =
          (Number(position.cumulativeRealizedPnL) || 0) + netRealizedPnL;
      }

      await queryRunner.manager.save(position);

      // ✅ Record transaction atomically
      const tx = queryRunner.manager.create(Transactions, {
        type: isFullSell
          ? TransactionType.SELL_FULL
          : TransactionType.SELL_PARTIAL,
        symbol: position.symbol,
        lots: lotsToSell,
        priceAtExecution: exitPrice,
        marginAmount: marginToRelease,
        realizedPnL: netRealizedPnL,
        commission: commissionToDeduct,
        balanceBefore,
        balanceAfter: Number(user.balance),
        notes: !isFullSell
          ? `Partial sell: ${lotsToSell} of ${actualTotalLots} lots`
          : undefined,
        user,
        position,
      });

      await queryRunner.manager.save(tx);

      await queryRunner.commitTransaction();

      return { success: true, payout: totalPayout };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async getAllPositions() {
    // Fetch everything with user relations to know who owns what
    const allPositions = await this.positionRepository.find({
      relations: ['user'],
      order: { openingDate: 'DESC' },
    });

    const categories = {
      open: allPositions.filter((p) => p.status === PositionStatus.OPEN),
      waiting: allPositions.filter((p) => p.status === PositionStatus.WAITING),
      closed: allPositions.filter((p) => p.status === PositionStatus.CLOSED),
      cancelled: allPositions.filter(
        (p) => p.status === PositionStatus.CANCELLED,
      ),
    };

    return {
      tables: categories,
      counts: {
        open: categories.open.length,
        waiting: categories.waiting.length,
        closed: categories.closed.length,
        cancelled: categories.cancelled.length,
        total: allPositions.length,
      },
    };
  }

  public async getUserPositions(userId: string) {
    const positions = await this.positionRepository.find({
      where: { user: { id: userId } },
      order: { openingDate: 'DESC' },
    });

    return {
      open: positions.filter((p) => p.status === PositionStatus.OPEN),
      waiting: positions.filter((p) => p.status === PositionStatus.WAITING),
      closed: positions.filter((p) => p.status === PositionStatus.CLOSED),
      cancelled: positions.filter((p) => p.status === PositionStatus.CANCELLED),
    };
  }

  public async editUserPosition(
    userId: string,
    positionId: string,
    editUserPositionDto: EditUserPositionDto,
  ) {
    const position = await this.positionRepository.findOne({
      where: { user: { id: userId }, id: positionId },
      relations: ['user'],
    });

    if (!position) throw new NotFoundException('Position not found');

    // Update provided fields
    if (editUserPositionDto.displayLot !== undefined)
      position.displayLot = editUserPositionDto.displayLot;
    if (editUserPositionDto.displayCost !== undefined)
      position.displayCost = editUserPositionDto.displayCost;

    return await this.positionRepository.save(position);
  }

  public async getTransactionHistory(userId: string) {
    const positions = await this.positionRepository.find({
      where: { user: { id: userId } },
      order: { openingDate: 'DESC' },
    });

    return positions.map((p) => ({
      id: p.id,
      website: p.website,
      symbol: p.symbol,
      quantity: Number(p.lots),
      unitPrice: Number(p.averageEntryPrice),
      executionPrice: Number(p.startingPrice) * Number(p.lots),
      side: p.type === 'BUYING' ? 'BUY' : 'SELL',
      status: p.status,
      date: p.openingDate,
    }));
  }
}
