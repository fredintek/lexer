import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  symbol!: string;

  @Column({ type: 'int', default: 0 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  averageEntryPrice!: number;

  @ManyToOne(() => User)
  user!: User;

  @UpdateDateColumn()
  updatedAt!: Date;
}
