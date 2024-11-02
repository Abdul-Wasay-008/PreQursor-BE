import { Body, Controller, Post, Get, Param, BadRequestException } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dtos/createTeam.dto';
import { Team } from './schema/team.schema';

@Controller('teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamService) { }

    //Creating a team
    @Post()
    async create(@Body() createTeamDto: CreateTeamDto): Promise<{ teamId?: string; message?: string }> {
        try {
            const team = await this.teamsService.create(createTeamDto);
            return { teamId: team._id.toString() }; // Return the team ID
        } catch (error) {
            throw new BadRequestException('Error creating team: ' + error.message);
        }
    }

    // Fetch team data by team ID
    @Get(':id')
    async getTeam(@Param('id') id: string): Promise<Team> {
        return this.teamsService.findById(id);
    }
}
