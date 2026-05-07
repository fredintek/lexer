import { Transform } from 'class-transformer';
import {
    IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE } from 'src/lib/constants';
import { MFAEnum } from 'src/user/entities/user.entity';


@ValidatorConstraint({ name: 'CustomMatchPasswords', async: false })
export class CustomMatchPasswords implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    if (password !== (args.object as any)[args.constraints[0]]) return false;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Confirm password must equal password';
  }
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'fullname must be at least 3 characters long' })
  @MaxLength(30, { message: 'fullname must not be longer than 30 characters' })
  @Transform(({ value }) => value.trim().toLowerCase(), { toClassOnly: true })
  fullname!: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase(), { toClassOnly: true })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REGEX_MESSAGE })
  password!: string;

  @Validate(CustomMatchPasswords, ['password'])
  confirmPassword!: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase(), { toClassOnly: true })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_REGEX_MESSAGE })
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase(), { toClassOnly: true })
  email!: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase(), { toClassOnly: true })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim().toLowerCase(), { toClassOnly: true })
  token!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_REGEX_MESSAGE,
  })
  password!: string;

  @Validate(CustomMatchPasswords, ['password'])
  confirmPassword!: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  currentPassword!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(PASSWORD_REGEX, {
    message: PASSWORD_REGEX_MESSAGE,
  })
  newPassword!: string;

  @Validate(CustomMatchPasswords, ['newPassword'])
  confirmPassword!: string;
}

export class UpdateMfaDto {
  @IsEnum(MFAEnum, {
    message: 'Method must be one of: 0 (TOTP), 1 (EMAIL), or 2 (SMS)',
  })
  @IsOptional()
  method?: MFAEnum;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

export class VerifyLoginOtpDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsOptional()
  rememberMe?: string;

  @IsNotEmpty()
  @IsBoolean()
  createTokens!: boolean;
}
