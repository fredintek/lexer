import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Stocks {
  @PrimaryColumn()
  symbol!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  sector!: string;

  @Column({ nullable: true })
  industry!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 1.0 })
  minLot!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  maxLot!: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  lotStep!: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  sellAdjustment!: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  buyAdjustment!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
