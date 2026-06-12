import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ActiveUserInterface } from 'src/lib/types';
import { CreateDepositDto, WithdrawRequestDto } from '../dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DEPOSIT_FOLDER } from 'src/lib/constants';
import {
  Transactions,
  TransactionStatus,
  TransactionType,
} from 'src/transactions/entities/transactions.entity';
import { FileUploadProvider } from 'src/common/providers/FileUploader';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transactions)
    private readonly txRepo: Repository<Transactions>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
    private readonly fileUploader: FileUploadProvider,
  ) {}

  public async getHistory(
    currentUser: ActiveUserInterface,
    type?: TransactionType,
    status?: TransactionStatus,
  ) {
    const where: any = {
      user: { id: currentUser?.userId },
    };

    if (type) where.type = type;
    if (status) where.status = status;

    return this.txRepo.find({
      where,
      relations: ['position'],
      order: { createdAt: 'DESC' },
    });
  }

  public async txStats(type: TransactionType) {
    const stats = await this.txRepo
      .createQueryBuilder('transaction')
      .select('COUNT(transaction.id)', 'count')
      .addSelect('SUM(transaction.marginAmount)', 'totalAmount') // ← fixed
      .where('transaction.type = :type', { type })
      .andWhere('transaction.status = :status', {
        status: TransactionStatus.PENDING,
      })
      .getRawOne();

    return {
      pendingCount: parseInt(stats.count) || 0,
      totalValue: parseFloat(stats.totalAmount) || 0,
    };
  }

  public async getAllTx(query: {
    search?: string;
    status?: string;
    type?: TransactionType;
    userId?: string;
  }) {
    const qb = this.txRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.position', 'position'); // ← only valid relation

    if (query.type) {
      qb.andWhere('transaction.type = :type', { type: query.type });
    }
    if (query.userId) {
      qb.andWhere('user.id = :userId', { userId: query.userId });
    }
    if (query.status) {
      qb.andWhere('transaction.status = :status', { status: query.status });
    }
    if (query.search) {
      qb.andWhere('(user.fullname LIKE :search OR user.email LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    return qb.orderBy('transaction.createdAt', 'DESC').getMany();
  }

  public async getChartStats() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const rawData = await this.txRepo
      .createQueryBuilder('t')
      .select("DATE_FORMAT(t.createdAt, '%a')", 'day')
      .addSelect(
        `SUM(CASE WHEN t.type = '${TransactionType.DEPOSIT}' AND t.status = '${TransactionStatus.APPROVED}' THEN t.marginAmount ELSE 0 END)`,
        'deposit',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = '${TransactionType.WITHDRAWAL}' AND t.status = '${TransactionStatus.APPROVED}' THEN t.marginAmount ELSE 0 END)`,
        'withdrawal',
      )
      .where('t.createdAt >= :startDate', { startDate })
      .groupBy("DATE_FORMAT(t.createdAt, '%a')")
      .addGroupBy('DATE(t.createdAt)')
      .orderBy('DATE(t.createdAt)', 'ASC')
      .getRawMany();

    return rawData.map((item) => ({
      day: item.day,
      deposit: Number(item.deposit) || 0,
      withdrawal: Number(item.withdrawal) || 0,
    }));
  }

  public async createDepositTransaction(
    activeUser: ActiveUserInterface,
    createDepositDto: CreateDepositDto,
    file?: Express.Multer.File,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      let receiptUrl: string | null = null;
      let receiptPublicId: string | null = null;
      if (file) {
        const uploadResult = await this.fileUploader.uploadBuffer(
          file.buffer,
          'deposits',
          `deposits_${activeUser?.email}`,
          file.mimetype,
        );
        receiptUrl = uploadResult.url;
        receiptPublicId = uploadResult.publicId;
      }

      const user = await manager.findOne(User, {
        where: { id: activeUser.userId },
      });
      if (!user) throw new NotFoundException('User not found');

      const tx = manager.create(Transactions, {
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.PENDING,
        symbol: 'CASH',
        lots: 0,
        priceAtExecution: 0,
        marginAmount: Number(createDepositDto.amount),
        realizedPnL: 0,
        commission: 0,
        balanceBefore: Number(user.balance),
        balanceAfter: Number(user.balance),
        method: 'bank_transfer',
        reference: createDepositDto.bankAccountId,
        receipt:
          receiptPublicId && receiptUrl
            ? { publicId: receiptPublicId, url: receiptUrl }
            : null,
        notes: receiptUrl
          ? `Deposit of ₺${createDepositDto.amount}`
          : `Deposit of ₺${createDepositDto.amount}. Awaiting approval.`,
        user,
        position: undefined,
      });

      return await manager.save(Transactions, tx);
    });
  }

  public async requestWithdrawal(
    currentUser: ActiveUserInterface,
    withdrawRequestDto: WithdrawRequestDto,
  ) {
    return await this.dataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: currentUser.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new NotFoundException('User not found');
      if (Number(user.balance) < withdrawRequestDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      const balanceBefore = Number(user.balance);

      user.balance = balanceBefore - withdrawRequestDto.amount;
      user.frozenBalance =
        Number(user.frozenBalance || 0) + withdrawRequestDto.amount;
      await manager.save(User, user);

      const tx = manager.create(Transactions, {
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        symbol: 'CASH',
        lots: 0,
        priceAtExecution: 0,
        marginAmount: withdrawRequestDto.amount,
        realizedPnL: 0,
        commission: 0,
        balanceBefore,
        balanceAfter: Number(user.balance),
        method: withdrawRequestDto.paymentMethodId,
        notes: `Withdrawal of ₺${withdrawRequestDto.amount}. Funds frozen pending approval.`,
        user,
        position: undefined,
      });

      const savedTx = await manager.save(Transactions, tx);

      this.eventEmitter.emit('user.activity', {
        userId: user.id,
        type: 'TRANSACTION',
        description: 'Withdrawal requested',
      });

      return savedTx;
    });
  }

  public async approveTransaction(transactionId: string) {
    return await this.txRepo.manager.transaction(async (manager) => {
      const trx = await manager.findOne(Transactions, {
        where: { id: transactionId },
        relations: ['user'],
      });

      if (!trx || trx.status !== TransactionStatus.PENDING) {
        throw new BadRequestException(
          'Transaction is not pending or does not exist',
        );
      }

      const user = trx.user;
      const balanceBefore = Number(user.balance);

      if (trx.type === TransactionType.DEPOSIT) {
        await manager.increment(
          User,
          { id: user.id },
          'balance',
          trx.marginAmount,
        );
        trx.balanceAfter = balanceBefore + Number(trx.marginAmount);
      } else if (trx.type === TransactionType.WITHDRAWAL) {
        if (Number(user.frozenBalance) < trx.marginAmount) {
          throw new BadRequestException(
            'Insufficient frozen balance to complete withdrawal',
          );
        }
        await manager.decrement(
          User,
          { id: user.id },
          'frozenBalance',
          trx.marginAmount,
        );
        trx.balanceAfter = balanceBefore;
      }

      trx.status = TransactionStatus.APPROVED;
      trx.notes = `${trx.type} of ₺${trx.marginAmount} approved by admin.`;
      await manager.save(Transactions, trx);

      return { success: true, message: `${trx.type} approved successfully` };
    });
  }

  public async rejectTransaction(transactionId: string, adminNote?: string) {
    return await this.txRepo.manager.transaction(async (manager) => {
      const trx = await manager.findOne(Transactions, {
        where: { id: transactionId },
        relations: ['user'],
      });

      if (!trx || trx.status !== TransactionStatus.PENDING) {
        throw new BadRequestException(
          'Transaction is not pending or does not exist',
        );
      }

      const user = trx.user;

      if (trx.type === TransactionType.WITHDRAWAL) {
        if (Number(user.frozenBalance) < trx.marginAmount) {
          throw new BadRequestException(
            'Critical error: Insufficient frozen balance to return',
          );
        }
        await manager.decrement(
          User,
          { id: user.id },
          'frozenBalance',
          trx.marginAmount,
        );
        await manager.increment(
          User,
          { id: user.id },
          'balance',
          trx.marginAmount,
        );
        trx.balanceAfter = Number(user.balance) + Number(trx.marginAmount);
      }

      trx.status = TransactionStatus.REJECTED;
      trx.adminNote = adminNote || 'Transaction rejected by administrator';
      trx.notes = `${trx.type} of ₺${trx.marginAmount} rejected. ${trx.adminNote}`;
      await manager.save(Transactions, trx);

      return {
        success: true,
        message: `${trx.type} rejected. Funds returned if applicable.`,
      };
    });
  }
}
