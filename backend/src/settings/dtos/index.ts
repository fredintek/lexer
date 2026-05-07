import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';

export class SettingItemDto {
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsOptional()
  group?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSettingsBulkDto {
  @IsNotEmpty()
  settings!: Record<string, SettingItemDto>;
}
