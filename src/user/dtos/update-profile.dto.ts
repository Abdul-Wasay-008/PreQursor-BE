import { IsEnum, IsString, Matches, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty({ message: 'Username cannot be empty.' }) // ✅ Consistent with CreateUserDto
    username?: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty({ message: 'Phone number cannot be empty.' }) // ✅ Consistent with CreateUserDto
    @Matches(/^\d{4}-\d{7}$/, { message: 'Please enter a valid phone number (e.g., 03XX-XXXXXXX).' })
    phoneNumber?: string;

    @IsEnum(['Easypaisa', 'JazzCash'], { message: 'Wallet type must be Easypaisa or JazzCash.' })
    @IsOptional()
    walletType?: 'Easypaisa' | 'JazzCash';
}
