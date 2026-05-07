// bank-account.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccountType {
  BANK = 'BANK',
  CRYPTO = 'CRYPTO',
}

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.BANK })
  type!: AccountType;

  @Column({ nullable: true })
  bankName!: string;

  @Column({ nullable: true })
  accountHolder!: string;

  @Column({ nullable: true })
  accountNumber!: string;

  @Column({ nullable: true })
  routingSwift!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: 'bg-brand' })
  color!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
