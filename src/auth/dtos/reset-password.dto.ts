import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(/[A-Z]/, { message: 'Password must include at least one uppercase letter.' })
  @Matches(/[a-z]/, { message: 'Password must include at least one lowercase letter.' })
  @Matches(/\d/, { message: 'Password must include at least one number.' })
  newPassword: string;
}
