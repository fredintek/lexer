import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

// notification.entity.ts
export enum NotificationType {
  TRADE = 'trade',
  WALLET = 'wallet',
  SECURITY = 'security',
  SYSTEM = 'system',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ default: false })
  urgent!: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata: any;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}