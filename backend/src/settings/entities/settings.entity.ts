import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryColumn()
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @Column({ default: 'general' })
  group!: string;

  @Column({ nullable: true })
  description!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
