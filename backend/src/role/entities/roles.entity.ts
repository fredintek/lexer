import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string; // e.g., 'SUPERADMIN', 'TRADER', 'COMPLIANCE'

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Column({ default: 'bg-brand' })
  color!: string;

  // Granular permissions stored as an array of strings
  // e.g., ['read:trades', 'write:withdrawals', 'manage:users']
  @Column('simple-array', { nullable: true })
  permissions!: string[];

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}