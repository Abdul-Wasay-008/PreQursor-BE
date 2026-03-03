import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(JwtGuard)
    @Get('profile')
    async getProfile(@Req() req) {
        try {
            const userId = req.user._id; // Using _id directly from JWT
            return await this.userService.getProfile(userId);
        } catch (error) {
            return { message: error.message || 'Failed to fetch user profile' };
        }
    }

    @UseGuards(JwtGuard)
    @Patch('update-profile')
    async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
        const userId = req.user._id;
        return await this.userService.updateProfile(userId, updateProfileDto);
    }
}
