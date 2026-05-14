// withdraw-request.dto.ts
import {
  IsNumber,
  IsUUID,
  IsPositive,
  Min,
  IsEnum,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';
import { TransactionStatus } from 'src/transactions/entities/transactions.entity';

export class WithdrawRequestDto {
  @IsNumber()
  @IsPositive()
  @Min(10, { message: 'Minimum withdrawal amount is 10 USDT' })
  amount!: number;

  @IsUUID('4', { message: 'Invalid payment method ID' })
  paymentMethodId!: string;
}

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  status!: TransactionStatus;

  @IsString()
  @IsOptional()
  adminNote?: string;
}

export class CreateDepositDto {
  @IsNotEmpty()
  @IsNumberString()
  amount!: string;

  @IsNotEmpty()
  @IsUUID()
  bankAccountId!: string;
}
