import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsArray,
  MinLength, 
  MaxLength 
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'Role name is required' })
  @MinLength(3, { message: 'Role name is too short' })
  @MaxLength(20, { message: 'Role name is too long' })
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions!: string[];

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  color?: string;
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}