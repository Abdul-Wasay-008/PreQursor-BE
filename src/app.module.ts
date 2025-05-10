import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';  
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminAuthModule } from './admin/admin-auth.module';
import { MailModule } from './mail/mail.module';
import { IdModule } from './id/id.module';
import { TeamsModule } from './team/team.module';
import { MatchModule } from './match/match.module';
import { WalletModule } from './wallet/wallet.module';
import { ScreenshotModule } from './screenshot/screenshot.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot(),  //Initialization of the config module
    MongooseModule.forRoot(process.env.DATABASE_URL),  // Using the environment variable
    EventEmitterModule.forRoot(), // Initialization of event emitter module
    AuthModule,
    AdminAuthModule,
    MailModule,
    IdModule,
    TeamsModule,
    MatchModule,
    WalletModule,
    ScreenshotModule,
    UserModule,
  ],
})
export class AppModule {}