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

  // Updated create method to ensure users can only be in one team
  async create(createTeamDto: CreateTeamDto): Promise<{ teamId: string; message: string }> {
    const { teamType, teamLeaderId, playerIds } = createTeamDto;

    const TEAM_SIZES = { duo: 2, squad: 4 };

    if (!TEAM_SIZES[teamType]) {
      throw new BadRequestException(`Invalid team type: ${teamType}. Please choose 'duo' or 'squad'.`);
    }

    if (playerIds.length + 1 !== TEAM_SIZES[teamType]) {
      throw new BadRequestException(
        `Invalid team size: A ${teamType} team requires exactly ${TEAM_SIZES[teamType]} players, but received ${playerIds.length + 1}`
      );
    }

    // Fetch leader from the database
    const leader = await this.userModel.findOne({ 'inGameIds.PUBG Mobile': teamLeaderId });
    if (!leader) {
      throw new NotFoundException('PreQursor account for team leader not found');
    }

    // Check if leader is already in a team
    const leaderExists = await this.teamModel.findOne({
      $or: [
        { 'teamLeader.userId': leader._id.toString() },
        { 'players.userId': leader._id.toString() }
      ]
    });

    if (leaderExists) {
      throw new BadRequestException(`The team leader is already part of another team and cannot create a new one.`);
    }

    // Fetch and verify all players
    const players = [];
    for (const id of playerIds) {
      const player = await this.userModel.findOne({ 'inGameIds.PUBG Mobile': id });
      if (!player) {
        throw new NotFoundException(`PreQursor account for player with ID ${id} not found`);
      }

      // Check if the player is already in a team
      const playerExists = await this.teamModel.findOne({
        $or: [
          { 'teamLeader.userId': player._id.toString() },
          { 'players.userId': player._id.toString() }
        ]
      });

      if (playerExists) {
        throw new BadRequestException(`Player with ID ${id} is already a member of another team.`);
      }

      players.push({
        userId: player._id.toString(),
        inGameId: player.inGameIds.get('PUBG Mobile'),
      });
    }

    // Check if the exact team already exists
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
      throw new UnauthorizedException(' You are not authorized to delete this team');
    }

    // Delete the team from the database
    await this.teamModel.findByIdAndDelete(teamId);

    return { message: 'Team deleted successfully' };
  }
}

