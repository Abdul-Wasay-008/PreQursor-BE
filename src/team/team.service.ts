import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from './schema/team.schema';
import { CreateTeamDto } from './dtos/createTeam.dto';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<Team>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) { }

  //Team creation with PQ account verification
  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const { teamLeaderId, playerIds } = createTeamDto;

    // Find the team leader by their in-game ID for "PUBG Mobile"
    const leader = await this.userModel.findOne({ 'inGameIds.PUBG Mobile': teamLeaderId });
    if (!leader) throw new NotFoundException('PreQursor account for team leader not found');

    // Fetch ObjectIds of all players by their in-game IDs from the User collection
    const playerObjectIds = await Promise.all(
      playerIds.map(async (id) => {
        // Check if the player ID exists in any user's inGameIds Map
        const player = await this.userModel.findOne({ 'inGameIds.PUBG Mobile': id });
        if (!player) throw new NotFoundException(`PreQursor account for player with ID ${id} not found`);
        return player._id; // Return the valid ObjectId
      }),
    );

    // Create and save the new team with ObjectId references
    const newTeam = new this.teamModel({
      ...createTeamDto,
      teamLeaderId: leader._id, // Use the ObjectId of the team leader
      playerIds: playerObjectIds, // An array of ObjectIds for players
    });

    return newTeam.save(); // Save the team and return it
  }

  // Find a team by ID
  async findById(id: string): Promise<Team> {
    return this.teamModel.findById(id).populate('teamLeaderId playerIds').exec();
  }
}
