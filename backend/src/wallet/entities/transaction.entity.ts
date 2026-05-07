import { BankAccount } from 'src/bank-accounts/entities/bank-accounts.entity';
import { PaymentMethod } from 'src/payment/entities/payment.entity';
import { IAvatar, User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount!: number;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @ManyToOne(() => PaymentMethod, { nullable: true, onDelete: 'SET NULL' })
  paymentMethod!: PaymentMethod;

  @ManyToOne(() => BankAccount, { nullable: true, onDelete: 'SET NULL' })
  bankAccount!: BankAccount;

  @ManyToOne(() => User, (user) => user.transactions)
  user!: User;

  @Column({ nullable: true })
  adminNote!: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  receipt?: IAvatar | null;

  @Column({ type: 'timestamp', nullable: true })
  expectedSettlementDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  processedBy?: User;

  @CreateDateColumn()
  createdAt!: Date;
}
