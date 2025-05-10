import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    // Method to get user profile
    async getProfile(userId: string): Promise<User> {
        const user = await this.userModel
            .findById(userId)
            .select('username email phoneNumber walletType');

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    // Method to update user profile
    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
        // Check if username is already taken by another user
        if (updateProfileDto.username) {
            const existingUser = await this.userModel.findOne({
                username: updateProfileDto.username,
                _id: { $ne: userId } // Exclude current user
            });

            if (existingUser) {
                throw new BadRequestException('Username is already taken.');
            }
        }

        // Check if phone number is already taken by another user
        if (updateProfileDto.phoneNumber) {
            const existingUser = await this.userModel.findOne({
                phoneNumber: updateProfileDto.phoneNumber,
                _id: { $ne: userId } // Exclude current user
            });

            if (existingUser) {
                throw new BadRequestException('Phone number is already in use.');
            }
        }

        //Update user profile
        const updatedUser = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: updateProfileDto },
            { new: true, runValidators: true }
        ).select('username email phoneNumber walletType');

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return updatedUser;
    }
}
