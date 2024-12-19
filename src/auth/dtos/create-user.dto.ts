import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid email address.' })
    email: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @Matches(/[A-Z]/, { message: 'Password must include at least one uppercase letter.' })
    @Matches(/[a-z]/, { message: 'Password must include at least one lowercase letter.' })
    @Matches(/\d/, { message: 'Password must include at least one number.' })
    password: string;

    @IsString()
    username: string;
}
