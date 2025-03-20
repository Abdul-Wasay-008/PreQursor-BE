import { IsEmail, IsEnum, IsString, Matches, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid email address.' })
    @IsNotEmpty({ message: 'Email is required.' }) // ✅ Ensure email is not empty
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Password is required.' }) // ✅ Ensure password is not empty
    @MinLength(8, { message: 'Password must be at least 8 characters long.' })
    @Matches(/[A-Z]/, { message: 'Password must include at least one uppercase letter.' })
    @Matches(/[a-z]/, { message: 'Password must include at least one lowercase letter.' })
    @Matches(/\d/, { message: 'Password must include at least one number.' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Username is required.' }) // ✅ Ensure username is not empty
    username: string;

    @IsString()
    @IsNotEmpty({ message: 'Phone number is required.' }) // ✅ Ensure phone is not empty
    @Matches(/^\d{4}-\d{7}$/, { message: 'Please enter a valid phone number (e.g., 03XX-XXXXXXX).' })
    phoneNumber: string;

    @IsEnum(['Easypaisa', 'JazzCash'], { message: 'Wallet type must be Easypaisa or JazzCash.' }) 
    @IsNotEmpty({ message: 'Wallet type is required.' }) // ✅ Ensure wallet type is not empty
    walletType: 'Easypaisa' | 'JazzCash';
}
