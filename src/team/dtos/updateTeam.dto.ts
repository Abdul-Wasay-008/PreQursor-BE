export class UpdateTeamDto {
    teamType?: string;      // Optional: 'duo' or 'squad'
    teamLeaderId?: string;  // Optional: In-game ID of the team leader
    playerIds?: string[];   // Optional: Array of in-game IDs of team members
}
