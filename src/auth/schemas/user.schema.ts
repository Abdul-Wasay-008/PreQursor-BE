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

  @Prop({ required: true })
  phoneNumber: string;  // Added phoneNumber field

  @Prop({ required: true, enum: ['Easypaisa', 'JazzCash'] }) 
  walletType: 'Easypaisa' | 'JazzCash';

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Map, of: String, default: {} }) // Using a Map to store gameName => gameId
  inGameIds: Map<string, string>; // Object to map game names to game IDs

  @Prop({ default: 0 }) // Default wallet balance is 0
  walletBalance: number;

  @Prop({ type: [{ amount: Number, type: String }], default: [] })
  transactions: { amount: number; type: "credit" | "debit"; }[];

  @Prop({ default: 0 }) // Track last credited amount
  lastCredited: number;

  @Prop({ default: 0 }) // Track last debited amount
  lastDebited: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
