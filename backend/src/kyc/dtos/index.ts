import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsLowercase,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { KYCDoc } from '../entities/kyc.entity';

export enum KYCStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateKYCStatusDto {
  @IsEnum(KYCStatus)
  status!: KYCStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsString()
  @IsNotEmpty()
  adminId?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsBoolean()
  @IsOptional()
  adminPass?: boolean;
}

export class CreateKycDto {
  @IsNotEmpty()
  @IsString()
  @IsLowercase()
  @IsEnum(['passport', 'id-card', 'driver-license'], {
    message: 'documentType must be passport, id-card, or driver-license',
  })
  documentType!: KYCDoc;

  @IsNotEmpty()
  @IsString()
  country!: string;
}

export class GetKycQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(KYCStatus)
  status?: KYCStatus;

  // @IsOptional()
  // @IsEnum(['id-card', 'passport', 'driver-license'])
  // documentType?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
