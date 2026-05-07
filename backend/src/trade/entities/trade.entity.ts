import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum TradeStatusEnum {
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
}

@Entity()
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  symbol!: string;

  @Column({ type: 'enum', enum: ['BUY', 'SELL'] })
  side!: 'BUY' | 'SELL';

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  priceAtExecution!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  pnl!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  commission!: number;

  @ManyToOne(() => User, (user) => user.trades)
  user!: User;

  @Column({
    type: 'enum',
    enum: TradeStatusEnum,
    default: TradeStatusEnum.PENDING,
  })
  status!: TradeStatusEnum;

  @CreateDateColumn()
  createdAt!: Date;
}
