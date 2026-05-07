import { IsEnum, IsString, MinLength } from "class-validator";

// create-payment-method.dto.ts
export class CreatePaymentMethodDto {
  @IsEnum(['Bank Account', 'Crypto Wallet'])
  type!: string;

  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  detail!: string;
}