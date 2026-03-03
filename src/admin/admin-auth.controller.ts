import { Controller, Post, Patch, Param, Body, Get } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';

@Controller('admin')
export class AdminAuthController {
    constructor(private readonly adminAuthService: AdminAuthService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const token = await this.adminAuthService.validateAdmin(body.email, body.password);
        return { token };
    }

    //fetch all the matches for admin dashboard
    @Get('matches/all')
    async getAllMatches() {
        return this.adminAuthService.getAllMatches();
    }

    //Update match info
    @Patch('matches/:matchId/send-info')
    async sendRoomInfo(
        @Param('matchId') matchId: string,
        @Body() body: { roomId: string; roomName?: string }
    ) {
        return this.adminAuthService.updateMatchRoomInfo(matchId, body.roomId, body.roomName);
    }
}
