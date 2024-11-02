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

//     // Save the user
//     const savedUser = await newUser.save();

//     // Generate JWT token including _id
//     const token = this.jwtService.sign({ 
//       _id: savedUser._id,  // Include the MongoDB ObjectId
//       email: savedUser.email, 
//       username: savedUser.username 
//     });

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

//     // Generate JWT token including _id
//     const token = this.jwtService.sign({ 
//       _id: user._id,  // Include the MongoDB ObjectId
//       email: user.email, 
//       username: user.username 
//     });

//     return { message: 'Login successful', user, token }; // Return message, user, and token
//   }
// }



import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      username,
    });

    // Save the user
    const savedUser = await newUser.save();

    // Generate JWT token including _id
    const token = this.jwtService.sign({
      _id: savedUser._id, 
      email: savedUser.email, 
      username: savedUser.username 
    });

    return { user: savedUser, token }; // Return user and token
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Find the user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Generate JWT token including _id
    const token = this.jwtService.sign({
      _id: user._id, 
      email: user.email, 
      username: user.username 
    });

    return { message: 'Login successful', user, token }; // Return message, user, and token
  }
}

