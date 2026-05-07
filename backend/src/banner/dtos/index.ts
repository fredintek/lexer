// banner/dtos/create-banner.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { BannerType } from '../entities/banner.entity';
import { PartialType } from '@nestjs/mapped-types';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsEnum(BannerType)
  type!: BannerType;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto){}