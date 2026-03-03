import { Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from 'src/mail/mail.module';
import { AuthModule } from 'src/auth/auth.module';
import { TeamsModule } from 'src/team/team.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from 'src/match/schema/match.schema';

@Module({
  imports: [ConfigModule, JwtModule.register({}),
    MongooseModule.forFeature([{ name: Match.name, schema: MatchSchema }]),
    MailModule,
    AuthModule, 
    TeamsModule,
  ],
  controllers: [AdminAuthController],
  providers: [AdminAuthService],
})
export class AdminAuthModule {}
