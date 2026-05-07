// dto/create-bank-account.dto.ts
import { IsEnum, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { AccountType } from '../entities/bank-accounts.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBankAccountDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(AccountType)
  @IsNotEmpty()
  type!: AccountType;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accountHolder?: string;

  @IsString()
  @IsNotEmpty()
  accountNumber!: string; // Used for IBAN or Wallet Address

  @IsString()
  @IsOptional()
  routingSwift?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  color?: string;
}

export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {}