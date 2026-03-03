import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { CreateGameIdDto } from './dtos/game-id.dto';
import { ConversionsService } from 'src/conversions/conversions.service';

@Injectable()
export class IdService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly conversionsService: ConversionsService, // Injecting ConversionsService
  ) { }


  // Add or update game ID for the logged-in user
  async IdTeams(userId: string, createGameIdDto: CreateGameIdDto): Promise<any> {
    const { gameName, gameId } = createGameIdDto;

    // Check if the gameId already exists in the database (excluding the current user)
    const existingUser = await this.userModel.findOne({ [`inGameIds.${gameName}`]: gameId, _id: { $ne: userId } }).exec();

    if (existingUser) {
      throw new BadRequestException(`The Game ID "${gameId}" is already in use by another user.`);
    }

    // Find the user by their MongoDB ID
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update or add the game ID for the provided game name
    user.inGameIds.set(gameName, gameId); // Use Map's set method

    // Save the updated user document
    await user.save();

    //Send Conversions API Event (In-Game ID Submission)
    await this.conversionsService.sendConversionEvent(
      'SubmitApplication',        // Standard Meta Event Name
      user.email,                 // User Email
      user.phoneNumber,           // User Phone Number
      0                           // Value (0 for submission)
    );

    // Remove the sensitive fields before returning the response
    const { password, ...userWithoutPassword } = user.toObject(); // Convert to plain object and exclude password

    return {
      message: 'Game ID added successfully',
      user: userWithoutPassword, // Return only non-sensitive fields
    };
  }
}

