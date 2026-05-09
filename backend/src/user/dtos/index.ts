import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @Length(3, 30)
  fullname?: string;

  @IsOptional()
  @IsString()
  // Basic regex for international phone formats
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phoneNumber?: string;
}

export class GetUsersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  kycStatus?: string;

  @IsOptional()
  @IsString()
  accountStatus?: string;
}

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  balance?: string;

  @IsOptional()
  @IsNumber()
  tier?: number;

  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsEnum(['ACTIVE', 'SUSPENDED', 'PENDING', 'DEACTIVATED'])
  status?: string;

  @IsString()
  @IsOptional()
  @Length(11, 11, {
    message: 'Identification number must be exactly 11 digits',
  })
  @Matches(/^[0-9]+$/, {
    message: 'Identification number must contain only digits',
  })
  identificationNumber!: string;

  @IsOptional()
  @IsNumber()
  frozenBalance?: number;

  @IsOptional()
  @IsBoolean()
  isTwoFactorEnabled?: boolean;
}

export class CreateUserAdminDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  fullname!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsUUID()
  @IsNotEmpty()
  roleId!: string;
}
