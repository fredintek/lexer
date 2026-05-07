import {
  IsEnum,
  IsNumber,
  IsString,
  IsPositive,
  Min,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export enum TradeSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class CreateTradeDto {
  @IsString()
  @IsNotEmpty()
  symbol!: string;

  @IsEnum(TradeSide)
  @IsNotEmpty()
  side!: TradeSide;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  priceAtExecution!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  commission!: number;
}
