import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Map, of: String, default: {} }) // Using a Map to store gameName => gameId
  inGameIds: Map<string, string>; // Object to map game names to game IDs
}

export const UserSchema = SchemaFactory.createForClass(User);
