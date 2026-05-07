import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Role } from '../../role/entities/roles.entity';
import { Exclude } from 'class-transformer';
import { LoginHistory } from './login-history.entity';
import { RefreshToken } from './refresh-tokens.entity';
import { PaymentMethod } from 'src/payment/entities/payment.entity';
import { Transaction } from 'src/wallet/entities/transaction.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { Kyc } from 'src/kyc/entities/kyc.entity';
import { Trade } from 'src/trade/entities/trade.entity';
import { Favorite } from 'src/yfinance/entities/favoriteStock.entity';

export interface IAvatar {
  publicId: string;
  url: string;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  DEACTIVATED = 'DEACTIVATED',
}

export enum MFAEnum {
  TOTP = 'TOTP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 30,
  })
  fullname!: string;

  @Column({
    type: 'varchar',
    unique: true,
  })
  tag!: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  balance!: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 8,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  frozenBalance!: number;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 225,
    unique: true,
  })
  email!: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 225,
    nullable: true,
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status!: UserStatus;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 225,
    nullable: true,
  })
  passwordResetToken?: string | null;

  @Exclude()
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  passwordResetTokenExpiration?: Date | null;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isWelcomeEmailSent!: boolean;

  @Column({
    type: 'simple-json',
    nullable: true,
  })
  avatar?: IAvatar | null;

  @Column({ default: 1 })
  tier!: number;

  // user.entity.ts
  @OneToOne(() => Kyc, (kyc) => kyc.user, { eager: true })
  kyc?: Kyc;

  // Optional: If you want to see which KYCs an admin has reviewed
  @OneToMany(() => Kyc, (kyc) => kyc.reviewedBy)
  reviewedKycs?: Kyc[];

  @OneToMany(() => Trade, (trade) => trade.user)
  trades?: Trade[];

  @Column({ nullable: true, type: 'text' })
  fcmToken?: string | null;

  @Column({ default: true })
  pushEnabled!: boolean;

  @Column({ default: true })
  emailEnabled!: boolean;

  // Relationship to the Role Entity
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Exclude()
  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  changedPasswordAt?: Date | null;

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];

  @OneToMany(() => LoginHistory, (loginHistory) => loginHistory.user)
  loginHistories!: LoginHistory[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => PaymentMethod, (paymentMethods) => paymentMethods.user)
  paymentMethods!: PaymentMethod[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];

  @Column({ default: false })
  isTwoFactorEnabled!: boolean;

  @Column({ type: 'enum', enum: MFAEnum, nullable: true })
  mfaMethod!: MFAEnum | null;

  @Column({ nullable: true })
  mfaSecret!: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  mfaOtpCode?: string | null; // Stores the 6-digit code for Email/SMS

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  mfaOtpExpires?: Date | null; // Expiration time (usually 5-10 mins)

  @Column({ default: false })
  isPhoneNumberVerified!: boolean; // Critical for SMS 2FA security

  @CreateDateColumn()
  createdAt!: Date;

  @Exclude()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Exclude()
  @DeleteDateColumn()
  deletedAt!: Date;
}
