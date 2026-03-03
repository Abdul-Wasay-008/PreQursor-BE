import { Controller, Post, UseGuards, Body, Request, Param, Get, NotFoundException } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { IdService } from './id.service';
import { CreateGameIdDto } from './dtos/game-id.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema'; // Adjust the path as necessary

@Controller('idteams')
export class IdController {
    constructor(
        private idTeamsService: IdService,
        @InjectModel(User.name) private readonly userModel: Model<User> // Injecting the user model
    ) { }

    @UseGuards(JwtGuard)
    @Post(':id/add-game-id')  // Add dynamic parameter for the team ID
    async addGameId(
        @Param('id') id: string,  // Capture the team ID from the route
        @Body() createGameIdDto: CreateGameIdDto,
        @Request() req
    ) {
        return this.idTeamsService.IdTeams(id, createGameIdDto);  // Pass the captured ID
    }

    @Get(':id/get-game-id')
    async getGameId(@Param('id') id: string) {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException('User not found'); // Throw an error if the user is not found
        }
        return user.inGameIds; // Return the inGameIds
    }
}
