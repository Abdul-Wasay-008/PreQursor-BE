import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Define Participant schema
@Schema()
export class Participant {
  @Prop({ type: String })
  userId?: string; // For solo participants or team leaders

  @Prop({ type: String })
  inGameId?: string; // In-game ID for solo players 

  @Prop({ type: String, required: false })
  teamId?: string; // For team-based matches (duo/squad)

  @Prop({ type: [String], required: false })
  teamMembers?: string[]; // List of in-game IDs for team-based matches
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);

// Define PrizeDetail schema
@Schema()
export class PrizeDetail {
  @Prop({ required: true })
  place: string;

  @Prop({ required: true })
  amount: number; // Prize amount in PKR
}

export const PrizeDetailSchema = SchemaFactory.createForClass(PrizeDetail);

// // Define Match schema
// @Schema()
// export class Match extends Document{
//   @Prop({ required: true })
//   gameName: string;

//   @Prop({ required: true })
//   map: string;

//   @Prop({ required: true })
//   date: string;

//   @Prop({ required: true })
//   time: string;

//   @Prop({ required: true })
//   entryFee: number;

//   @Prop({ required: true })
//   prize: number;

//   @Prop({
//     required: true,
//     set: (value: string) => value.toLowerCase(), // Normalize to lowercase for internal storage
//     get: (value: string) => value.charAt(0).toUpperCase() + value.slice(1), // Capitalize when retrieving
//   })
//   battleType: string;

//   @Prop({ required: true })
//   maxSlots: number;

//   @Prop({ default: 0 })
//   availableSlots: number;

//   @Prop({ type: [PrizeDetailSchema], required: true })
//   prizePool: PrizeDetail[]; // Array for prize distribution (Key, Value pairs)

//   @Prop({ type: [ParticipantSchema], default: [] })
//   participants: Participant[]; // List of participants (either solo players or teams)
// }

// export const MatchSchema = SchemaFactory.createForClass(Match);

// // Enable getters in schema
// MatchSchema.set('toObject', { getters: true });
// MatchSchema.set('toJSON', { getters: true });
// Define Match schema
@Schema()
export class Match extends Document {
  @Prop({ required: true })
  gameName: string;

  @Prop({ required: true })
  map: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop({ required: true })
  entryFee: number;

  @Prop({ required: true })
  prize: number;

  @Prop({
    required: true,
    set: (value: string) => value.toLowerCase(), // Normalize to lowercase for internal storage
    get: (value: string) => value.charAt(0).toUpperCase() + value.slice(1), // Capitalize when retrieving
  })
  battleType: string;

  @Prop({ required: true })
  maxSlots: number;

  @Prop({ default: 0 })
  availableSlots: number;

  @Prop({ type: [PrizeDetailSchema], required: true })
  prizePool: PrizeDetail[]; // Array for prize distribution (Key, Value pairs)

  @Prop({ type: [ParticipantSchema], default: [] })
  participants: Participant[]; // List of participants (either solo players or teams)

  // Fields for room details
  @Prop({ required: true })
  roomName: string; 

  @Prop({ required: true })
  roomPassword: string;
  
  @Prop({ required: true, default: 'Asia' }) // Default server is 'Asia'
  server: string;
}

export const MatchSchema = SchemaFactory.createForClass(Match);

// Enable getters in schema
MatchSchema.set('toObject', { getters: true });
MatchSchema.set('toJSON', { getters: true });

