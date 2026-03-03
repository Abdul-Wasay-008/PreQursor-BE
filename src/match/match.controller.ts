import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { MatchService } from './match.service';
import { Match } from './schema/match.schema';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService) { }

    // Endpoint to create a new match
    @Post()
    async createMatch(@Body() matchData: Partial<Match>): Promise<Match> {
        return this.matchService.createMatch(matchData);
    }

    // Endpoint to fetch all matches
    @Get()
    @UseGuards(JwtGuard)
    async getMatches(): Promise<Match[]> {
        return this.matchService.findAllMatches();
    }

    // Endpoint to fetch a match by ID
    @Get(':matchId/details')
    @UseGuards(JwtGuard)
    async getMatchDetails(
        @Param('matchId') matchId: string,
        @Req() req: any, // Extracted JWT data
    ) {
        const userId = req.user._id; // _id from jwt
        return this.matchService.getMatchDetails(matchId, userId);
    }

    //Endpoint to book a match
    @Post(':matchId/book')
    @UseGuards(JwtGuard)
    async bookMatch(
        @Param('matchId') matchId: string,
        @Body('userId') userId: string,
    ): Promise<{ message: string }> {  // Updated return type here
        return this.matchService.bookMatch(matchId, userId);
    }

    //Endpoint to Fetch User Match History
    @UseGuards(JwtGuard)
    @Get('history')
    async getUserMatchHistory(@Req() req) {
        const userId = req.user._id; // Extracted from JWT
        return this.matchService.getMatchHistory(userId);
    }
}