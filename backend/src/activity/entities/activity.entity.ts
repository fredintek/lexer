import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export type ActivityType = 'LOGIN' | 'WITHDRAWAL' | 'SECURITY' | 'TRADE' | "PROFILE" | "TRANSACTION"

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  type!: ActivityType;

  @Column()
  description!: string;

  @Column({ nullable: true })
  metadata!: string;

  @CreateDateColumn()
  createdAt!: Date;
}