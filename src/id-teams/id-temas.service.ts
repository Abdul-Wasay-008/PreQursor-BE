import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { CreateGameIdDto } from './dtos/game-id.dto';

@Injectable()
export class IdTeamsService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Add or update game ID for the logged-in user
  async IdTeams(userId: string, CreateGameIdDto: CreateGameIdDto): Promise<User> {
    const { gameName, gameId } = CreateGameIdDto;
    
    // Find the user by their MongoDB ID
    const user = await this.userModel.findById(userId).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update or add the game ID for the provided game name
    user.inGameIds[gameName] = gameId;
    
    // Save the updated user document
    return user.save();
  }
}
