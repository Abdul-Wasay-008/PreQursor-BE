// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { CreateUserDto } from './dtos/create-user.dto';
// import { LoginUserDto } from './dtos/login-user.dto';
// import { User } from './schemas/user.schema';
// import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt'; // Import JwtService

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectModel(User.name) private userModel: Model<User>,
//     private jwtService: JwtService, // Inject JwtService
//   ) {}

//   async signup(createUserDto: CreateUserDto) {
//     const { email, password, username } = createUserDto;

//     // Check if user already exists
//     const existingUser = await this.userModel.findOne({ email });
//     if (existingUser) {
//       throw new Error('User with this email already exists');
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create and save user
//     const newUser = new this.userModel({
//       email,
//       password: hashedPassword,
//       username,
//     });

//     // Save the user and generate JWT token
//     const savedUser = await newUser.save();
//     const token = this.jwtService.sign({ email: savedUser.email, username: savedUser.username }); // Generate JWT

//     return { user: savedUser, token }; // Return user and token
//   }

//   async login(loginUserDto: LoginUserDto) {
//     const { email, password } = loginUserDto;

//     // Find the user by email
//     const user = await this.userModel.findOne({ email });
//     if (!user) {
//       throw new Error('Invalid credentials');
//     }

//     // Compare the password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       throw new Error('Invalid credentials');
//     }

//     // Generate JWT token
//     const token = this.jwtService.sign({ email: user.email, username: user.username }); // Generate JWT

//     return { message: 'Login successful', user, token }; // Return message, user, and token
//   }
// }





// import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { CreateUserDto } from './dtos/create-user.dto';
// import { LoginUserDto } from './dtos/login-user.dto';
// import { User } from './schemas/user.schema';
// import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt'; // Import JwtService
// import { Profile } from 'passport-google-oauth20';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectModel(User.name) private userModel: Model<User>,
//     private jwtService: JwtService, // Inject JwtService
//   ) {}

//   // Sign up method for PreQursor account
//   async signup(createUserDto: CreateUserDto) {
//     const { email, password, username } = createUserDto;

//     // Check if user already exists
//     const existingUser = await this.userModel.findOne({ email });
//     if (existingUser) {
//       throw new ConflictException('User with this email already exists'); // Better error handling
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create and save user
//     const newUser = new this.userModel({
//       email,
//       password: hashedPassword,
//       username,
//     });

//     // Save the user and generate JWT token
//     const savedUser = await newUser.save();
//     const token = this.generateJwtToken(savedUser);

//     return { user: savedUser, token }; // Return user and token
//   }

//   // Login method for PreQursor account
//   async login(loginUserDto: LoginUserDto) {
//     const { email, password } = loginUserDto;

//     // Find the user by email
//     const user = await this.userModel.findOne({ email });
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     // Compare the password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     // Generate JWT token
//     const token = this.generateJwtToken(user);

//     return { message: 'Login successful', user, token }; // Return message, user, and token
//   }

//   // Find or create user for Google login
//   async findOrCreateUser(profile: Profile): Promise<User> {
//     const existingUser = await this.userModel.findOne({ googleId: profile.id });

//     if (existingUser) {
//       return existingUser;
//     }

//     // Create a new user if not found
//     const newUser = new this.userModel({
//       email: profile.emails[0].value, // Use the email provided by Google
//       username: profile.displayName,  // Use display name from Google
//       googleId: profile.id,           // Store Google ID for future logins
//     });

//     return await newUser.save();
//   }

//   // Utility method to generate JWT tokens
//   private generateJwtToken(user: User): string {
//     const payload = { userId: user._id, email: user.email, username: user.username }; // Add userId
//     return this.jwtService.sign(payload); // Sign with JWT service
//   }
// }




import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // Import JwtService
import { Profile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService, // Inject JwtService
  ) {}

  // Sign up method for PreQursor account
  async signup(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists'); // Better error handling
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      username,
    });

    // Save the user and generate JWT token
    const savedUser = await newUser.save();
    const token = this.generateJwtToken(savedUser);

    return { user: savedUser, token }; // Return user and token
  }

  // Login method for PreQursor account
  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Find the user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = this.generateJwtToken(user);

    return { message: 'Login successful', user, token }; // Return message, user, and token
  }

  // Find or create user for Google login
  async findOrCreateUser(profile: Profile): Promise<User> {
    const existingUser = await this.userModel.findOne({ googleId: profile.id });

    if (existingUser) {
      return existingUser;
    }

    // Create a new user if not found
    const newUser = new this.userModel({
      email: profile.emails[0].value, // Use the email provided by Google
      username: profile.displayName,  // Use display name from Google
      googleId: profile.id,           // Store Google ID for future logins
    });

    return await newUser.save();
  }

  // Validate user from Google profile
  async validateUser(profile: any): Promise<{ user: User; token: string }> {
    const user = await this.findOrCreateUser(profile); // Find or create the user
    const token = this.generateJwtToken(user); // Generate JWT token for the user
    return { user, token }; // Return the user and the token
  }

  // Utility method to generate JWT tokens
  private generateJwtToken(user: User): string {
    const payload = { userId: user._id, email: user.email, username: user.username }; // Add userId
    return this.jwtService.sign(payload); // Sign with JWT service
  }
}
