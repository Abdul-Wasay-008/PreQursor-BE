import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { IdController } from "./id.controller";
import { IdService } from "./id.service";
import { User, UserSchema } from '../auth/schemas/user.schema'; 
import { AuthModule } from "src/auth/auth.module";

@Module({
    imports: [
      MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      AuthModule, 
    ],
    controllers: [IdController],
    providers: [IdService],
  })
  export class IdModule {}