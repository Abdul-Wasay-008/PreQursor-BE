// import { PassportStrategy } from "@nestjs/passport";
// import { Profile, Strategy } from "passport-google-oauth20";
// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";

// @Injectable()  
// export class GoogleStrategy extends PassportStrategy(Strategy) {
//     constructor(private configService: ConfigService) {
//         super({
//             clientID: configService.get<string>('GOOGLE_CLIENT_ID'),         
//             clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'), 
//             callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),   
//             scope: ['profile', 'email'],                                   
//         });
//     }

//     async validate(accessToken: string, refreshToken: string, profile: Profile) {
//         // You can use the profile information here, e.g., to create a user
//         return profile;  // Return the profile to be used in the AuthController
//     }
// }
// import { PassportStrategy } from "@nestjs/passport";
// import { Profile, Strategy } from "passport-google-oauth20";
// import { Injectable, UnauthorizedException } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { AuthService } from '../auth.service';
// import { User } from '../schemas/user.schema';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly authService: AuthService,
//   ) {
//     super({
//       clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
//       clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
//       callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
//       scope: ['profile', 'email'],
//     });
//   }

//   // The `validate` method is called after successful Google OAuth authentication
//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: Profile,
//   ): Promise<User> {
//     try {
//       // Find or create a user using the Google profile
//       const user = await this.authService.findOrCreateUser(profile);

//       // If user not found or failed to create, throw an error
//       if (!user) {
//         throw new UnauthorizedException('Unable to authenticate user with Google');
//       }

//       // Return the user, which will be set on req.user by Passport
//       return user;
//     } catch (error) {
//       console.error('Google OAuth validation error:', error);
//       throw new UnauthorizedException('Google authentication failed');
//     }
//   }
// }

