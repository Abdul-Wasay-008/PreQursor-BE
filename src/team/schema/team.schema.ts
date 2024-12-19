import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Team extends Document {
  @Prop({ required: true })
  teamType: string; // 'duo' or 'squad'

  @Prop({
    type: Object, // Explicitly defining this as an object type
    required: true,
  })
  teamLeader: {
    userId: string;  // MongoDB ObjectId of the team leader
    inGameId: string; // In-game ID of the team leader
  };

  @Prop({
    type: [Object], // Explicitly defining this as an array of objects
    required: true,
  })
  players: { userId: string; inGameId: string }[]; // Array of players' MongoDB ObjectIds and In-game IDs

  @Prop({ default: Date.now })
  createdAt: Date; // Automatically set the creation time
}

export const TeamSchema = SchemaFactory.createForClass(Team);
