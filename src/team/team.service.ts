import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from './schema/team.schema';
import { CreateTeamDto } from './dtos/createTeam.dto';
import { User } from '../auth/schemas/user.schema';
import * as jwt from 'jsonwebtoken';  // For decoding JWT token

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  // Helper function to decode JWT and extract the user ID
  private decodeJwt(token: string): string {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Decode JWT using the secret key
      return decoded['_id'];  // Return the user ID from the decoded JWT
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Updated create method to return the team ID and check for duplicate teams
  async create(createTeamDto: CreateTeamDto): Promise<{ teamId: string; message: string }> {
    const { teamType, teamLeaderId, playerIds } = createTeamDto;

    // Required team sizes for validation
    const TEAM_SIZES = { duo: 2, squad: 4 };

    // Validate the teamType
    if (!TEAM_SIZES[teamType]) {
      throw new BadRequestException(`Invalid team type: ${teamType}. Please choose 'duo' or 'squad'.`);
    }

    // Check if the total number of players matches the teamType requirement
    if (playerIds.length + 1 !== TEAM_SIZES[teamType]) { // +1 for the leader
      throw new BadRequestException(
        `Invalid team size: A ${teamType} team requires exactly ${TEAM_SIZES[teamType]} players, but received ${playerIds.length + 1}`
      );
    }

    // Fetch team leader by in-game ID
    const leader = await this.userModel.findOne({ 'inGameIds.PUBG Mobile': teamLeaderId });
    if (!leader) {
      throw new NotFoundException('PreQursor account for team leader not found');
    }

    // Fetch and verify all players based on in-game IDs
    const players = [];
    for (const id of playerIds) {
      const player = await this.userModel.findOne({ 'inGameIds.PUBG Mobile': id });
      if (!player) {
        throw new NotFoundException(`PreQursor account for player with ID ${id} not found`);
      }
      players.push({
        userId: player._id.toString(),
        inGameId: player.inGameIds.get('PUBG Mobile'),
      });
    }

    // Check if a team with the same leader and players already exists
    const existingTeam = await this.teamModel.findOne({
      teamType,
      'teamLeader.userId': leader._id.toString(),
      players: { $all: players },
    });

    if (existingTeam) {
      return { teamId: existingTeam._id.toString(), message: 'This team is already created' };
    }

    // Create and save the new team
    const newTeam = new this.teamModel({
      teamType,
      teamLeader: {
        userId: leader._id.toString(),
        inGameId: leader.inGameIds.get('PUBG Mobile'),
      },
      players,
    });

    const savedTeam = await newTeam.save();
    return { teamId: savedTeam._id.toString(), message: 'Team created successfully' };
  }

  // Fetch teams by decoded user ID
  async getTeamsByUserId(token: string) {
    const userId = this.decodeJwt(token);  // Decode the JWT to get the user ID

    const teams = await this.teamModel.find({
      $or: [
        { 'teamLeader.userId': userId },  // Check if user is the team leader
        { 'players.userId': userId },     // Check if user is in the players array
      ]
    });

    // Return teams with both in-game IDs and MongoDB IDs (userIDs)
    return teams.map(team => ({
      ...team.toObject(),
      teamLeaderInGameId: team.teamLeader.inGameId,
      playersInGameIds: team.players.map(player => player.inGameId),
    }));
  }

  // Delete a team by ID
  async deleteTeam(teamId: string, token: string): Promise<{ message: string }> {
    const userId = this.decodeJwt(token); // Decode the JWT to get the user ID

    // Find the team by ID
    const team = await this.teamModel.findById(teamId);
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Ensure that the user trying to delete the team is the team leader
    if (team.teamLeader.userId !== userId) {
      throw new UnauthorizedException('You are not authorized to delete this team');
    }

    // Delete the team from the database
    await this.teamModel.findByIdAndDelete(teamId);

    return { message: 'Team deleted successfully' };
  }
}

