import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match } from './schema/match.schema';
import { User } from 'src/auth/schemas/user.schema';
import { Team } from 'src/team/schema/team.schema';
import { Document } from 'mongoose';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class MatchService {
    constructor(
        @InjectModel(Match.name) private readonly matchModel: Model<Match & Document>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Team.name) private readonly teamModel: Model<Team>,
        private readonly mailService: MailService,
    ) { }

    // Create a new match
    async createMatch(matchData: Partial<Match>): Promise<Match> {
        const newMatch = new this.matchModel(matchData);
        return newMatch.save();
    }

    // Get all matches
    async findAllMatches(): Promise<Match[]> {
        return this.matchModel.find().exec();
    }

    //Function to populate match modal with necessary match details 
    async getMatchDetails(matchId: string, userId: string) {
        // Fetch the match details
        const match = await this.matchModel.findById(matchId).lean();

        if (!match) {
            throw new Error('Match not found');
        }

        // If the match is a solo match, return without team details
        if (match.battleType === 'solo') {
            return {
                matchId: match._id,
                gameName: match.gameName,
                map: match.map,
                battleType: match.battleType,
                date: match.date,
                time: match.time,
                entryFee: match.entryFee,
                teamMembers: null, // No team members for solo
            };
        }

        // For duo/squad matches, query the Teams collection
        const team = await this.teamModel.findOne({
            $or: [
                { 'teamLeader.userId': userId },
                { 'players.userId': userId },
            ],
        }).lean();

        if (!team) {
            console.log('No team found for userId:', userId); // Debugging log
            throw new Error('Team not found for the user');
        }

        // Construct the list of in-game IDs
        const teamMembers = [
            team.teamLeader.inGameId,
            ...team.players.map((player) => player.inGameId),
        ];

        return {
            matchId: match._id,
            gameName: match.gameName,
            map: match.map,
            battleType: match.battleType,
            date: match.date,
            time: match.time,
            entryFee: match.entryFee,
            teamMembers, // Return the team members' in-game IDs
        };
    }

    // Main function to book a match based on battle type
    async bookMatch(matchId: string, userId: string): Promise<{ message: string }> {
        const match = await this.matchModel.findById(matchId).exec();
        if (!match) {
            throw new NotFoundException('Match not found.');
        }

        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found.');
        }

        if (match.availableSlots <= 0) {
            throw new BadRequestException('No slots available for this match.');
        }

        let result: { message: string };
        let emailRecipients: string[] = []; // Store email recipients

        if (match.battleType === 'Solo') {
            result = await this.bookSoloMatch(match, userId, user);
            emailRecipients = [user.email]; // Send email only to the user
        }
        else if (match.battleType === 'Duo') {
            result = await this.bookDuoMatch(match, userId);

            const team = await this.teamModel.findOne({
                $or: [
                    { 'teamLeader.userId': userId },
                    { 'players.userId': userId },
                ],
            });

            const userIds = [team.teamLeader.userId, ...team.players.map(player => player.userId)];
            emailRecipients = await this.getUserEmails(userIds); // Send email to both players in the duo
        } else if (match.battleType === 'Squad') {
            result = await this.bookSquadMatch(match, userId);

            const team = await this.teamModel.findOne({
                $or: [
                    { 'teamLeader.userId': userId },
                    { 'players.userId': userId },
                ],
            });

            const userIds = [team.teamLeader.userId, ...team.players.map(player => player.userId)];
            emailRecipients = await this.getUserEmails(userIds); // Send email to all 4 players in the squad
        } else {
            throw new BadRequestException('Invalid battle type.');
        }

        // Prepare match details for email
        const matchDetails = {
            matchId: match._id,
            gameId: user.inGameIds.get('PUBG Mobile'), // Assuming this is correct
            gameName: match.gameName,
            map: match.map,
            battleType: match.battleType,
            prizePool: match.prizePool,
            dateTime: `${match.date} ${match.time}`,
        };

        // Send match confirmation email to the relevant recipients
        await this.mailService.sendMatchConfirmationEmail(emailRecipients, matchDetails);

        return result; // Always return { message: string }
    }

    // Helper function to get user emails based on userIds
    private async getUserEmails(userIds: string[]): Promise<string[]> {
        const users = await this.userModel.find({ '_id': { $in: userIds } }).exec();
        return users.map(user => user.email);
    }

    // Update the booking logic for solo match
    private async bookSoloMatch(match: Match & Document, userId: string, user: User): Promise<{ message: string }> {
        if (!user.inGameIds || user.inGameIds.size === 0) {
            throw new BadRequestException('You must associate an in-game ID to join solo matches.');
        }

        const inGameId = user.inGameIds.get('PUBG Mobile'); // Use the first associated in-game ID

        const isAlreadyRegistered = match.participants.some(
            (participant) => participant.userId === userId,
        );
        if (isAlreadyRegistered) {
            throw new BadRequestException('You are already registered for this match.');
        }

        match.participants.push({
            userId,
            inGameId,
        });

        match.availableSlots -= 1;
        await match.save();

        return { message: 'Slot booked successfully for Solo match.' };
    }

    // Update the booking logic for duo match
    private async bookDuoMatch(match: Match & Document, userId: string): Promise<{ message: string }> {
        const team = await this.teamModel.findOne({
            $or: [
                { 'teamLeader.userId': userId },
                { 'players.userId': userId },
            ],
        });

        if (!team) {
            throw new BadRequestException('You must belong to a team to join duo matches.');
        }

        const teamSize = 2;
        const totalMembers = team.players.length + 1; // Including the leader
        if (totalMembers !== teamSize) {
            throw new BadRequestException('Your team must have exactly 2 members to join a duo match.');
        }

        const allMembers = [team.teamLeader, ...team.players];
        const invalidMembers = allMembers.filter((member) => !member.inGameId);

        if (invalidMembers.length > 0) {
            throw new BadRequestException(
                `All team members must have associated in-game IDs. Missing IDs for: ${invalidMembers
                    .map((member) => member.userId)
                    .join(', ')}`,
            );
        }

        const isAlreadyRegistered = match.participants.some(
            (participant) => participant.teamId === team._id.toString(),
        );

        if (isAlreadyRegistered) {
            throw new BadRequestException('Your team is already registered for this match.');
        }

        match.participants.push({
            teamId: team._id.toString(),
            teamMembers: allMembers.map((member) => member.inGameId),
        });

        match.availableSlots -= 1;
        await match.save();

        return { message: 'Slot booked successfully for Duo match.' };
    }

    // Update the booking logic for squad match
    private async bookSquadMatch(match: Match & Document, userId: string): Promise<{ message: string }> {
        const team = await this.teamModel.findOne({
            $or: [
                { 'teamLeader.userId': userId },
                { 'players.userId': userId },
            ],
        });

        if (!team) {
            throw new BadRequestException('You must belong to a team to join squad matches.');
        }

        const teamSize = 4;
        const totalMembers = team.players.length + 1; // Including the leader
        if (totalMembers !== teamSize) {
            throw new BadRequestException('Your team must have exactly 4 members to join a squad match.');
        }

        const allMembers = [team.teamLeader, ...team.players];
        const invalidMembers = allMembers.filter((member) => !member.inGameId);

        if (invalidMembers.length > 0) {
            throw new BadRequestException(
                `All team members must have associated in-game IDs. Missing IDs for: ${invalidMembers
                    .map((member) => member.userId)
                    .join(', ')}`,
            );
        }

        const isAlreadyRegistered = match.participants.some(
            (participant) => participant.teamId === team._id.toString(),
        );

        if (isAlreadyRegistered) {
            throw new BadRequestException('Your team is already registered for this match.');
        }

        match.participants.push({
            teamId: team._id.toString(),
            teamMembers: allMembers.map((member) => member.inGameId),
        });

        match.availableSlots -= 1;
        await match.save();

        return { message: 'Slot booked successfully for Squad match.' };
    }
}







