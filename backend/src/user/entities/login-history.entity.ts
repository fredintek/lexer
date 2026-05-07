import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  ipAddress!: string;

  @Column({ nullable: true })
  browser!: string; // e.g., Chrome, Firefox

  @Column({ nullable: true })
  os!: string; // e.g., macOS, Windows, Android

  @Column({ nullable: true })
  device!: string; // e.g., iPhone 15, Desktop

  @Column({ default: true })
  wasSuccessful!: boolean;

  @CreateDateColumn()
  loginAt!: Date;

  @ManyToOne(() => User, (user) => user.loginHistories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}