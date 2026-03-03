import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScreenshotService } from './screenshot.service';
import { ScreenshotController } from './screenshot.controller';
import { Screenshot, ScreenshotSchema } from 'src/screenshot/schema/screenshot.schema';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Screenshot.name, schema: ScreenshotSchema }]),
    AuthModule,
    MailModule,
    WalletModule,
  ],
  controllers: [ScreenshotController],
  providers: [ScreenshotService],
  exports: [ScreenshotService],
})
export class ScreenshotModule { }
