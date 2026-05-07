import { IsEnum, IsLowercase, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { KYCDoc } from "../entities/kyc.entity";

// kyc-status-update.dto.ts
export enum KYCStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class UpdateKYCStatusDto {
  @IsEnum(KYCStatus)
  status!: KYCStatus;

  @IsString()
  @IsOptional()
  rejectionReason?: string;
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
}