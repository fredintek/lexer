import { PaymentMethod } from 'src/payment/entities/payment.entity';
import { Positions } from 'src/positions/entities/position.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TransactionType {
  BUY_OPEN = 'BUY_OPEN', // Bought during market hours
  BUY_WAITING = 'BUY_WAITING', // Bought during off-hours
  BUY_MERGE = 'BUY_MERGE', // Added lots to existing position
  SELL_FULL = 'SELL_FULL', // Sold entire position
  SELL_PARTIAL = 'SELL_PARTIAL', // Sold some lots
  CANCEL = 'CANCEL', // Cancelled a waiting order

  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum TransactionStatus {
  PENDING = 'PENDING', // Deposit/withdrawal awaiting admin approval
  APPROVED = 'APPROVED', // Admin approved
  REJECTED = 'REJECTED', // Admin rejected
  COMPLETED = 'COMPLETED', // Trading transactions — auto completed
  CANCELLED = 'CANCELLED', // Cancelled by user
}

@Entity()
export class Transactions {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column()
  symbol!: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  lots!: number; // How many lots were involved in THIS transaction

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  priceAtExecution!: number; // The actual market price at the time

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  marginAmount!: number; // Cash locked or released

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  realizedPnL!: number; // Only for SELL_* and CANCEL

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  commission!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  balanceBefore!: number; // Snapshot of balance before this tx

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  balanceAfter!: number; // Snapshot of balance after this tx

  @Column({ nullable: true })
  notes!: string; // e.g. "Partial sell: 5 of 20 lots"

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.transactions)
  user!: User;

  @ManyToOne(() => Positions, { nullable: true, onDelete: 'SET NULL' })
  position!: Positions;

  @Column({ nullable: true })
  method!: string;

  @Column({ nullable: true })
  reference!: string; // e.g. bank reference number, payment ID

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED, // Trading txs are instant
  })
  status!: TransactionStatus;

  @Column({ nullable: true })
  adminNote!: string;
}
