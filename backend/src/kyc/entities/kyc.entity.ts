import { IAvatar, User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type KYCDoc = 'passport' | 'id-card' | 'driver-license';

@Entity()
export class Kyc {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  documentType!: KYCDoc;

  @Column()
  country!: string;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  front?: IAvatar;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  back?: IAvatar;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING,
  })
  status!: KYCStatus;

  @Column({ nullable: true })
  rejectionReason?: string;

  @OneToOne(() => User, (user) => user.kyc)
  @JoinColumn()
  user!: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewedById' })
  reviewedBy?: User;

  @Column({ nullable: true })
  reviewedById?: string;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
