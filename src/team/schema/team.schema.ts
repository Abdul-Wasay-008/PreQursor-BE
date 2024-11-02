import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Team extends Document {
  @Prop({ required: true })
  teamType: string; // 'duo' or 'squad'

  @Prop({ required: true })
  teamLeaderId: string; // In-game ID of the team leader

  @Prop({ required: true, type: [String] })
  playerIds: string[]; // Array of player in-game IDs

  @Prop({ default: Date.now })
  createdAt: Date; // Automatically set the creation time
}

export const TeamSchema = SchemaFactory.createForClass(Team);
