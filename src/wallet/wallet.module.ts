import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { User, UserSchema } from "src/auth/schemas/user.schema";
import { AuthModule } from "src/auth/auth.module";
import { ConversionsModule } from "src/conversions/conversions.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), 
        AuthModule,
        ConversionsModule,
    ],
    controllers: [WalletController],
    providers: [WalletService],
    exports: [WalletService],
})

export class WalletModule { }