import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from 'src/auth/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule, // Importing AuthModule for JwtService access
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Exporting UserService for potential reuse
})
export class UserModule {}
