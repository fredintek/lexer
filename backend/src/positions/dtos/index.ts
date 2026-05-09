import {
  IsEnum,
  IsNumber,
  IsString,
  Min,
  Max,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @IsNotEmpty()
  symbol!: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  lots!: number;

  @IsEnum(['BUYING', 'SELLING'])
  @IsNotEmpty()
  type!: string;

  @IsOptional()
  @IsNumber()
  multiplier?: number;
}

export class SellPositionDto {
  @IsUUID()
  positionId!: string;

  @IsNumber()
  @Min(0.0001)
  lotsToSell!: number;
}

export class EditUserPositionDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  displayLot?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  displayCost?: number;
}
