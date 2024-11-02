import { Types } from 'mongoose';

export class CreateTeamDto {
  teamType: string;                // 'duo' or 'squad'
  teamLeaderId: Types.ObjectId;     // ObjectId of the team leader
  playerIds: Types.ObjectId[];      // Array of ObjectIds of team members
}
