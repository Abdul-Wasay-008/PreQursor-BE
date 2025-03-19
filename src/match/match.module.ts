import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { Match, MatchSchema } from './schema/match.schema';
import { AuthModule } from 'src/auth/auth.module';
import { TeamsModule } from 'src/team/team.module';
import { MailModule } from 'src/mail/mail.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
        AuthModule,
        TeamsModule,
        MailModule,
        WalletModule,
    ],
    controllers: [MatchController],
    providers: [MatchService],
})
export class MatchModule { }
