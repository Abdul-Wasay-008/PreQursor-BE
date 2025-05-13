import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { IdController } from "./id.controller";
import { IdService } from "./id.service";
import { User, UserSchema } from '../auth/schemas/user.schema'; 
import { AuthModule } from "src/auth/auth.module";
import { ConversionsModule } from "src/conversions/conversions.module";

@Module({
    imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      AuthModule, 
      ConversionsModule,  
    ],
    controllers: [IdController],
    providers: [IdService],
  })
  export class IdModule {}