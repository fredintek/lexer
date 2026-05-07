import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../entities/transaction.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ActiveUserInterface } from 'src/lib/types';
import {
  CreateDepositDto,
  UpdateTransactionStatusDto,
  WithdrawRequestDto,
} from '../dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CloudinaryService } from 'src/cloudinary/providers/cloudinary.service';
import { DEPOSIT_FOLDER } from 'src/lib/constants';
import { addBusinessDays } from 'src/lib/helpers';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  public async getHistory(
    currentUser: ActiveUserInterface,
    type?: TransactionType,
    status?: TransactionStatus,
  ) {
    const where: any = {
      user: { id: currentUser?.userId },
    };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    return this.txRepo.find({
      where,
      relations: ['paymentMethod', 'bankAccount'],
      order: { createdAt: 'DESC' },
    });
  }

  public async createDepositTransaction(
    activeUser: ActiveUserInterface,
    createDepositDto: CreateDepositDto,
    file?: Express.Multer.File,
  ) {
    let receipt: any;
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        DEPOSIT_FOLDER,
      );

      receipt = {
        publicId: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    const transaction = this.txRepo.create({
      amount: Number(createDepositDto.amount),
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      user: { id: activeUser?.userId },
      bankAccount: { id: createDepositDto.bankAccountId },
      receipt,
    });

    return await this.txRepo.save(transaction);
  }

  public async requestWithdrawal(
    currentUser: ActiveUserInterface,
    withdrawRequestDto: WithdrawRequestDto,
  ) {
    return await this.userRepo.manager.transaction(async (manager) => {
      // 1. Find user with a 'pessimistic_write' lock to prevent double-spending
      const user = await manager.findOne(User, {
        where: { id: currentUser.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) throw new NotFoundException('User not found');

      // 2. Validate balance
      if (Number(user.balance) < withdrawRequestDto?.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // 3. Create the pending transaction record
      const transaction = manager.create(Transaction, {
        amount: withdrawRequestDto?.amount,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        user: { id: currentUser.userId },
        paymentMethod: { id: withdrawRequestDto?.paymentMethodId },
        expectedSettlementDate: addBusinessDays(new Date(), 2),
      });

      // 4. Move funds from balance to frozenBalance
      // We use math directly on the decimal to avoid JS floating point errors
      user.balance = Number(user.balance) - withdrawRequestDto?.amount;
      user.frozenBalance =
        Number(user.frozenBalance || 0) + withdrawRequestDto?.amount;

      await manager.save(User, user);

      // Emit the event (This is non-blocking!)
      this.eventEmitter.emit('user.activity', {
        userId: user.id,
        type: 'TRANSACTION',
        description: 'Withdrawal requested',
      });
      return await manager.save(Transaction, transaction);
    });
  }

  public async txStats(type: TransactionType) {
    const stats = await this.txRepo
      .createQueryBuilder('transaction')
      .select('COUNT(transaction.id)', 'count')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
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
      .leftJoinAndSelect('transaction.paymentMethod', 'paymentMethod')
      .leftJoinAndSelect('transaction.bankAccount', 'bankAccount');

    // 1. Handle Type filtering (made optional if you want to see all TX for a user)
    if (query.type) {
      qb.andWhere('transaction.type = :type', { type: query.type });
    }

    // 2. Filter by userId specifically
    if (query.userId) {
      qb.andWhere('user.id = :userId', { userId: query.userId });
    }

    // 3. Handle Status filtering
    if (query.status) {
      qb.andWhere('transaction.status = :status', { status: query.status });
    }

    // 4. Handle Search (Global search across name/email)
    if (query.search) {
      qb.andWhere('(user.fullname LIKE :search OR user.email LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    return qb.orderBy('transaction.createdAt', 'DESC').getMany();
  }

  public async updateStatus(id: string, dto: UpdateTransactionStatusDto) {
    return await this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(Transaction, {
        where: { id },
        relations: ['user'],
      });

      if (!tx) throw new NotFoundException('Transaction not found');
      if (tx.status !== TransactionStatus.PENDING)
        throw new BadRequestException('Transaction already processed');

      tx.status = dto.status;
      tx.adminNote = dto.adminNote as string;

      const user = tx.user;
      if (dto.status === TransactionStatus.APPROVED) {
        // Deduction from frozen balance
        user.frozenBalance -= tx.amount;
      } else if (dto.status === TransactionStatus.REJECTED) {
        // Return to active balance
        user.frozenBalance -= tx.amount;
        user.balance += tx.amount;
      }

      await manager.save(user);
      return await manager.save(tx);
    });
  }

  public async getChartStats() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const rawData = await this.txRepo
      .createQueryBuilder('t')
      .select("DATE_FORMAT(t.createdAt, '%a')", 'day')
      .addSelect(
        `SUM(CASE WHEN t.type = '${TransactionType.DEPOSIT}' AND t.status = '${TransactionStatus.APPROVED}' THEN t.amount ELSE 0 END)`,
        'deposit',
      )
      .addSelect(
        `SUM(CASE WHEN t.type = '${TransactionType.WITHDRAWAL}' AND t.status = '${TransactionStatus.APPROVED}' THEN t.amount ELSE 0 END)`,
        'withdrawal',
      )
      .where('t.createdAt >= :startDate', { startDate })
      // Group by the formatted day name
      .groupBy("DATE_FORMAT(t.createdAt, '%a')")
      // Also group and order by the actual Date to keep the 7-day sequence correct
      .addGroupBy('DATE(t.createdAt)')
      .orderBy('DATE(t.createdAt)', 'ASC')
      .getRawMany();

    return rawData.map((item) => ({
      day: item.day,
      deposit: Number(item.deposit) || 0,
      withdrawal: Number(item.withdrawal) || 0,
    }));
  }

  public async approveTransaction(transactionId: string) {
    return await this.txRepo.manager.transaction(async (manager) => {
      // 1. Fetch transaction with user details
      const trx = await manager.findOne(Transaction, {
        where: { id: transactionId },
        relations: ['user'],
      });

      if (!trx || trx.status !== TransactionStatus.PENDING) {
        throw new BadRequestException(
          'Transaction is not pending or does not exist',
        );
      }

      const user = trx.user;

      if (trx.type === TransactionType.DEPOSIT) {
        /**
         * DEPOSIT LOGIC
         * Simply add the amount to the user's main balance.
         */
        await manager.increment(User, { id: user.id }, 'balance', trx.amount);
      } else if (trx.type === TransactionType.WITHDRAWAL) {
        /**
         * WITHDRAWAL APPROVAL LOGIC
         * The funds should already be in 'frozenBalance' from when the user
         * requested the withdrawal. Now we permanently remove them.
         */
        if (user.frozenBalance < trx.amount) {
          throw new BadRequestException(
            'Insufficient frozen balance to complete withdrawal',
          );
        }

        await manager.decrement(
          User,
          { id: user.id },
          'frozenBalance',
          trx.amount,
        );
      }

      // 2. Finalize Transaction Status
      trx.status = TransactionStatus.APPROVED;
      await manager.save(trx);

      return {
        success: true,
        message: `${trx.type} approved successfully`,
      };
    });
  }

  public async rejectTransaction(transactionId: string, adminNote?: string) {
    return await this.txRepo.manager.transaction(async (manager) => {
      // 1. Fetch transaction with user details
      const trx = await manager.findOne(Transaction, {
        where: { id: transactionId },
        relations: ['user'],
      });

      if (!trx || trx.status !== TransactionStatus.PENDING) {
        throw new BadRequestException(
          'Transaction is not pending or does not exist',
        );
      }

      const user = trx.user;

      /**
       * WITHDRAWAL REJECTION LOGIC
       * If it's a withdrawal, the money is currently "frozen".
       * We must move it back to the main balance so the user can use it again.
       */
      if (trx.type === TransactionType.WITHDRAWAL) {
        if (user.frozenBalance < trx.amount) {
          // This should technically never happen if your createWithdrawal logic is solid
          throw new BadRequestException(
            'Critical error: Insufficient frozen balance to return',
          );
        }

        // Move funds: Frozen -> Balance
        await manager.decrement(
          User,
          { id: user.id },
          'frozenBalance',
          trx.amount,
        );
        await manager.increment(User, { id: user.id }, 'balance', trx.amount);
      }

      /**
       * DEPOSIT REJECTION LOGIC
       * Deposits don't touch the balance while PENDING.
       * So we just update the status to REJECTED.
       */

      // 2. Finalize Transaction Status with Admin Note
      trx.status = TransactionStatus.REJECTED;
      trx.adminNote = adminNote || 'Transaction rejected by administrator';

      await manager.save(trx);

      return {
        success: true,
        message: `${trx.type} rejected successfully. Funds returned if applicable.`,
      };
    });
  }
}
