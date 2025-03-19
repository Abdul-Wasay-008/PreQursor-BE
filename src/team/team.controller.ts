import { Body, Controller, Post, Get, Delete, BadRequestException, Headers, Param, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dtos/createTeam.dto';
import { JwtGuard } from 'src/auth/jwt.guard';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamService) { }

  // Creating a team
  @Post()
  @UseGuards(JwtGuard)
  async create(@Body() createTeamDto: CreateTeamDto): Promise<{ teamId: string; message: string }> {
    try {
      const { teamId, message } = await this.teamsService.create(createTeamDto);
      return { teamId, message }; // Return the team ID and message directly
    } catch (error) {
      throw new BadRequestException('Error creating team: ' + error.message);
    }
  }

  // Fetch teams by user ID using JWT token from Authorization header
  @Get('user-teams')
  @UseGuards(JwtGuard)
  async getTeams(@Headers('Authorization') authHeader: string) {
    if (!authHeader) {
      throw new BadRequestException('Authorization token is missing');
    }

    const token = authHeader.replace('Bearer ', '');  // Extract token from 'Bearer <token>'
    return await this.teamsService.getTeamsByUserId(token);
  }

  // Deleting a team by its ID
  @Delete(':teamId')
  @UseGuards(JwtGuard)
  async delete(
    @Param('teamId') teamId: string,  // Get teamId from the route parameter
    @Headers('Authorization') authHeader: string,  // Get JWT token from Authorization header
  ): Promise<{ message: string }> {
    if (!authHeader) {
      throw new BadRequestException('Authorization token is missing');
    }

    const token = authHeader.replace('Bearer ', '');  // Extract token from 'Bearer <token>'
    try {
      return await this.teamsService.deleteTeam(teamId, token);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
