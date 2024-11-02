import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';  
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { IdModule } from './id/id.module';
import { TeamsModule } from './team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot(),  //Initialization of the config module
    MongooseModule.forRoot(process.env.DATABASE_URL),  // Using the environment variable
    AuthModule,
    MailModule,
    IdModule,
    TeamsModule,
  ],
})
export class AppModule {}
