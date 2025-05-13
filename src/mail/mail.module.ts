import { Module } from "@nestjs/common";
import { MailController } from "./mail.controller";
import { MailService } from "./mail.service";
import { ConversionsModule } from "src/conversions/conversions.module";

@Module({
    imports: [ConversionsModule],
    controllers: [MailController],
    providers: [MailService],
    exports: [MailService],
})

export class MailModule { }