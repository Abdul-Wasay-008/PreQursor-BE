import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Match } from 'src/match/schema/match.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team } from 'src/team/schema/team.schema';
import { User } from 'src/auth/schemas/user.schema';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AdminAuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        @InjectModel(Match.name) private readonly matchModel: Model<Match>,
        @InjectModel(User.name) private readonly userModel: Model<User>, 
        @InjectModel(Team.name) private readonly teamModel: Model<Team>,
        private readonly mailService: MailService,
    ) { }

    async validateAdmin(email: string, password: string): Promise<string> {
        const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
        const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

        if (email !== adminEmail || password !== adminPassword) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign(
            { isAdmin: true },
            {
                secret: this.configService.get('ADMIN_SECRET_KEY'),
                expiresIn: '1h',
            }
        );

        return token;
    }

    //Fetch ALL matches and show on admin dashboard
    async getAllMatches(): Promise<Match[]> {
        return this.matchModel.find().sort({ date: 1 }).exec();
    }

    //Update room info and send emails
    async updateMatchRoomInfo(matchId: string, roomId: string, roomName?: string): Promise<string> {
        const match = await this.matchModel.findById(matchId);
        if (!match) throw new NotFoundException('Match not found.');
      
        match.roomId = roomId;
        if (roomName) match.roomName = roomName;
        match.status = 'published';
      
        await match.save();
      
        // ✅ 1. Get all userIds (solo + team-based)
        const userIds: string[] = [];
      
        for (const p of match.participants) {
          if (p.userId) userIds.push(p.userId); // solo
          else if (p.teamId) {
            const team = await this.teamModel.findById(p.teamId);
            if (team) {
              userIds.push(team.teamLeader.userId);
              userIds.push(...team.players.map(player => player.userId));
            }
          }
        }
      
        // ✅ 2. Get all emails
        const users = await this.userModel.find({ _id: { $in: userIds } });
        const emails = users.map(u => u.email);
      
        // ✅ 3. Prepare match details
        const matchDetails = {
          matchId: match._id,
          gameName: match.gameName,
          map: match.map,
          battleType: match.battleType,
          prizePool: match.prizePool,
          dateTime: `${match.date} ${match.time}`,
          roomId: match.roomId,
          roomName: match.roomName,
          roomPassword: match.roomPassword,
          server: match.server,
        };
      
        // ✅ 4. Send email with ID + password
        await this.mailService.sendMatchIdPassEmail(emails, matchDetails);
      
        return '✅ Match details sent and updated successfully!';
      }
      
}
