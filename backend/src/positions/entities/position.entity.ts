import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PositionStatus {
  WAITING = 'waiting', // Order placed during off-days
  OPEN = 'open', // Active trade
  CLOSED = 'closed', // Trade finalized
  CANCELLED = 'cancellCANCELLED', // Cancel waiting positions
}

@Entity()
export class Positions {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  symbol!: string;

  @Column({ type: 'enum', enum: ['BUYING', 'SELLING'] })
  type!: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  lots!: number; // The actual quantity

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  startingPrice!: number; // The entry price

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  averageEntryPrice!: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 225,
  })
  website!: string;

  @Column({ type: 'decimal', default: 1 })
  multiplier!: number; // K/Z Multiplier

  @Column({ type: 'decimal', default: 0 })
  commission!: number; // One-time fee

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  cumulativeRealizedPnL!: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true })
  exitPrice!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  realizedPnL!: number;

  @Column({ type: 'decimal', default: 0 })
  marginUsed!: number; // Cash locked for this trade

  @Column({
    type: 'enum',
    enum: PositionStatus,
    default: PositionStatus.WAITING,
  })
  status!: PositionStatus;

  // Admin Overrides (Seen in the Edit Modal)
  @Column({ type: 'decimal', nullable: true })
  displayLot!: number;

  @Column({ type: 'decimal', nullable: true })
  displayCost!: number;

  @CreateDateColumn()
  openingDate!: Date;

  @Column({ nullable: true })
  closingDate!: Date;

  @ManyToOne(() => User, (user) => user.positions)
  user!: User;
}
