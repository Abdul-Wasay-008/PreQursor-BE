import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsController } from './team.controller';
import { TeamService } from './team.service';
import { Team, TeamSchema } from './schema/team.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    AuthModule,
  ],
  controllers: [TeamsController],
  providers: [TeamService],
  exports: [MongooseModule],
})
export class TeamsModule { }
