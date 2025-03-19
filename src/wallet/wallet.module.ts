import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { User, UserSchema } from "src/auth/schemas/user.schema";
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), 
        AuthModule,
    ],
    controllers: [WalletController],
    providers: [WalletService],
    exports: [WalletService],
})

export class WalletModule { }