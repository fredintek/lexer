import { IsNumber, IsPositive, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLotSettingsDto {
  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(0.0001)
  @Type(() => Number)
  minLot?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Max(1000000)
  @Type(() => Number)
  maxLot?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Min(0.0001)
  @Type(() => Number)
  lotStep?: number;
}
