// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { User, UserSchema } from './schemas/user.schema';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule } from '@nestjs/config';
// import { GoogleStrategy } from './utils/GoogleStrategy';

// ConfigModule.forRoot();

// @Module({
//   imports: [
//     JwtModule.register({
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: "7d" },
//     }),
//     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
//   ],
//   controllers: [AuthController],
//   providers: [AuthService, GoogleStrategy],
// })
// export class AuthModule {}
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { GoogleStrategy } from './utils/GoogleStrategy';

@Module({
  imports: [
    ConfigModule,  // Importing ConfigModule here
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy],
})
export class AuthModule {}
