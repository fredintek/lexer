import { IsEnum, IsArray, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export enum RecipientMode {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
  ALL = 'all',
}

export class SendBroadcastDto {
  @IsEnum(RecipientMode)
  mode!: RecipientMode;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  userIds?: string[];

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}