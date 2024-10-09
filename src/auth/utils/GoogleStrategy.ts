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
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthService } from '../auth.service'; // Import AuthService if needed for user management
import { User } from '../schemas/user.schema'; // Import your User model/schema

@Injectable()  
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService, // Inject AuthService for user handling
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),         
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'), 
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),   
            scope: ['profile', 'email'],                                   
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<User> {
        // Here, you can use the profile information to either find or create a user
        const user = await this.authService.findOrCreateUser(profile); // Example method to find/create user

        // Return the user object (you can also include the JWT generation here if needed)
        return user;  // Return the user to be used in the AuthController
    }
}
