import { Injectable } from '@nestjs/common';
import { Transactions, TransactionType } from '../entities/transactions.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Positions } from 'src/positions/entities/position.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transactions)
    private readonly transactionRepository: Repository<Transactions>,
  ) {}

  public async record(params: {
    type: TransactionType;
    user: User;
    position: Positions;
    lots: number;
    priceAtExecution: number;
    marginAmount: number;
    realizedPnL?: number;
    commission?: number;
    balanceBefore: number;
    balanceAfter: number;
    notes?: string;
  }): Promise<Transactions> {
    const tx = this.transactionRepository.create({
      type: params.type,
      symbol: params.position.symbol,
      lots: params.lots,
      priceAtExecution: params.priceAtExecution,
      marginAmount: params.marginAmount,
      realizedPnL: params.realizedPnL ?? 0,
      commission: params.commission ?? 0,
      balanceBefore: params.balanceBefore,
      balanceAfter: params.balanceAfter,
      notes: params.notes,
      user: params.user,
      position: params.position,
    });

    return this.transactionRepository.save(tx);
  }

  public async getUserTransactions(userId: string) {
    return this.transactionRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['position'],
    });
  }

  public async getAllTransactions() {
    return this.transactionRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['user', 'position'],
    });
  }
}
