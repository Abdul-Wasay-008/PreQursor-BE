import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Match } from './schema/match.schema';
import { User } from 'src/auth/schemas/user.schema';
import { Team } from 'src/team/schema/team.schema';
import { Document } from 'mongoose';
import { MailService } from 'src/mail/mail.service';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class MatchService {
    constructor(
        @InjectModel(Match.name) private readonly matchModel: Model<Match & Document>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(Team.name) private readonly teamModel: Model<Team>,
        private readonly mailService: MailService,
        private readonly walletService: WalletService,
    ) { }

    // Function to generate a random 6-character alphanumeric password
    generatePassword(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 6; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // create a new match
    async createMatch(matchDetails: any): Promise<Match> {
        // Create the match without saving it yet
        const newMatch = new this.matchModel({
            ...matchDetails,
            server: 'Asia', // Set the server field to 'Asia'
        });

        // Generate the room password
        const roomPassword = this.generatePassword();

        // Assign the roomName using the generated MongoDB ObjectId
        newMatch.roomName = newMatch._id.toString(); // MongoDB ObjectId as room name

        // Assign the roomPassword
        newMatch.roomPassword = roomPassword;

        // Save the match to the database
        return await newMatch.save();
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
            result = await this.bookSoloMatch(match, userId);
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
            gameId: user.inGameIds.get('PUBG Mobile'),
            gameName: match.gameName,
            map: match.map,
            battleType: match.battleType,
            prizePool: match.prizePool,
            dateTime: `${match.date} ${match.time}`,
            roomName: match.roomName,
            roomPassword: match.roomPassword,
            server: match.server,
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
    private async bookSoloMatch(match: Match & Document, userId: string): Promise<{ message: string }> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found.");
        }

        if (!user.inGameIds || user.inGameIds.size === 0) {
            throw new BadRequestException('You must associate an in-game ID to join solo matches.');
        }

        const isAlreadyRegistered = match.participants.some(
            (participant) => participant.userId === userId,
        );
        if (isAlreadyRegistered) {
            throw new BadRequestException('You are already registered for this match 😎');
        }

        const entryFee = match.entryFee;
        if (user.walletBalance < entryFee) {
            throw new BadRequestException([
                "😮‍💨 Oops!... You do not have enough balance to join this match. 💰 Please top up your wallet and try again."
            ]);
        }

        // ✅ Deduct entry fee from the solo player
        await this.walletService.updateWalletBalance(userId, -entryFee);

        match.participants.push({ userId, inGameId: user.inGameIds.get("PUBG Mobile") });
        match.availableSlots -= 1;
        await match.save();

        return { message: "Slot booked successfully for Solo match." };
    }

    // Update the booking logic for duo match
    private async bookDuoMatch(match: Match & Document, userId: string): Promise<{ message: string }> {
        const team = await this.teamModel.findOne({
            $or: [
                { "teamLeader.userId": userId },
                { "players.userId": userId },
            ],
        });

        if (!team) {
            throw new BadRequestException("You must belong to a team to join duo matches.");
        }

        // Ensure only the team leader can book
        if (team.teamLeader.userId !== userId) {
            throw new BadRequestException("Only the team leader can book a match for the team.");
        }

        const teamSize = 2;
        const totalMembers = team.players.length + 1; // Including the leader
        if (totalMembers !== teamSize) {
            throw new BadRequestException("Your team must have exactly 2 members to join a duo match.");
        }

        const isAlreadyRegistered = match.participants.some(
            (participant) => participant.teamId === team._id.toString(),
        );

        if (isAlreadyRegistered) {
            throw new BadRequestException('Your team is already registered for this match 😎');
        }

        const allMembers = [team.teamLeader.userId, ...team.players.map(player => player.userId)];

        // ✅ Step 1: Fetch User Details (Username, Wallet Balance)
        const users = await this.userModel.find({ _id: { $in: allMembers } }).exec();
        const entryFee = match.entryFee / 2; // Divide entry fee between both players

        // ✅ Step 2: Find Users Who Don't Have Enough Balance
        const insufficientFundsUsers = users.filter(user => user.walletBalance < entryFee);

        // ✅ Step 3: Show Proper Error Message with Usernames
        if (insufficientFundsUsers.length > 0) {
            const usernames = insufficientFundsUsers.map(user => user.username).join(", ");
            throw new BadRequestException(`😮‍💨 Oops! Player(s) ${usernames} do not have enough balance to join this match. 💰 Please top up the wallet and try again`);
        }

        // ✅ Step 4: Deduct Entry Fee from Both Players
        await Promise.all(users.map(user =>
            this.walletService.updateWalletBalance(user._id.toString(), -entryFee)
        ));

        // ✅ Step 5: Finalize the Booking
        match.participants.push({
            teamId: team._id.toString(),
            teamMembers: users.map(user => user.inGameIds.get("PUBG Mobile")), // Store in-game IDs
        });

        match.availableSlots -= 1;
        await match.save();

        return { message: "✅ Slot booked successfully for Duo match." };
    }


    // Update the booking logic for squad match
    private async bookSquadMatch(match: Match & Document, userId: string): Promise<{ message: string }> {
        const team = await this.teamModel.findOne({
            $or: [
                { "teamLeader.userId": userId },
                { "players.userId": userId },
            ],
        });

        if (!team) {
            throw new BadRequestException("You must belong to a team to join squad matches.");
        }

        // ✅ Ensure only the team leader can book
        if (team.teamLeader.userId !== userId) {
            throw new BadRequestException("Only the team leader can book a match for the team.");
        }

        const teamSize = 4;
        const totalMembers = team.players.length + 1; // Including the leader
        if (totalMembers !== teamSize) {
            throw new BadRequestException("Your team must have exactly 4 members to join a squad match.");
        }

        const allMembers = [team.teamLeader.userId, ...team.players.map(player => player.userId)];

        const isAlreadyRegistered = match.participants.some(
            (participant) => participant.teamId === team._id.toString(),
        );

        if (isAlreadyRegistered) {
            throw new BadRequestException('Your team is already registered for this match 😎');
        }

        // ✅ Fetch user details (Usernames, Wallet Balance)
        const users = await this.userModel.find({ _id: { $in: allMembers } }).exec();
        const individualEntryFee = match.entryFee / 4; // Each player pays 1/4th

        // ✅ Step 1: Check if all 4 players have enough balance
        const insufficientFundsUsers = users.filter(user => user.walletBalance < individualEntryFee);

        // ✅ Step 2: Show a proper error message if any player lacks funds
        if (insufficientFundsUsers.length > 0) {
            const usernames = insufficientFundsUsers.map(user => user.username).join(", ");
            throw new BadRequestException(`😮‍💨 Oops! Player(s) ${usernames} do not have enough balance to join this match. 💰 Please top up the wallet and try again`);
        }

        // ✅ Step 3: Deduct entry fee from all 4 players
        await Promise.all(users.map(user =>
            this.walletService.updateWalletBalance(user._id.toString(), -individualEntryFee)
        ));

        // ✅ Step 4: Finalize the booking
        match.participants.push({
            teamId: team._id.toString(),
            teamMembers: users.map(user => user.inGameIds.get("PUBG Mobile")), // Store in-game IDs
        });

        match.availableSlots -= 1;
        await match.save();

        return { message: "✅ Slot booked successfully for Squad match." };
    }
}