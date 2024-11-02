import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { CreateGameIdDto } from './dtos/game-id.dto';

@Injectable()
export class IdService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  // Add or update game ID for the logged-in user
  async IdTeams(userId: string, CreateGameIdDto: CreateGameIdDto): Promise<any> {
    const { gameName, gameId } = CreateGameIdDto;

    // Find the user by their MongoDB ID
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update or add the game ID for the provided game name
    user.inGameIds.set(gameName, gameId); // Use Map's set method

    // Save the updated user document
    await user.save(); // Ensure you await the save operation

    // Remove the sensitive fields before returning the response
    const { password, ...userWithoutPassword } = user.toObject();  // Convert to plain object and exclude password

    return {
      message: 'Game ID added successfully',
      user: userWithoutPassword,  // Return only non-sensitive fields
    };
  }
}
