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
  ) { }

  async signup(createUserDto: CreateUserDto) {
    const { email, password, username, phoneNumber, walletType } = createUserDto;

    // Check if user with this username already exists
    const existingUserByUsername = await this.userModel.findOne({ username });
    if (existingUserByUsername) {
      throw new HttpException('User with this username already exists', HttpStatus.BAD_REQUEST);
    }

    // Check if user with this email already exists
    const existingUserByEmail = await this.userModel.findOne({ email });
    if (existingUserByEmail) {
      throw new HttpException('User with this email already exists', HttpStatus.BAD_REQUEST);
    }

    // Check if user with this phone number already exists
    const existingUserByPhone = await this.userModel.findOne({ phoneNumber });
    if (existingUserByPhone) {
      throw new HttpException('Phone number is already registered', HttpStatus.BAD_REQUEST);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      username,
      phoneNumber,
      walletType,
    });

    // Save the user
    const savedUser = await newUser.save();

    // Generate JWT token including _id
    const token = this.jwtService.sign({
      _id: savedUser._id,
      email: savedUser.email,
      username: savedUser.username,
    });

    return { user: savedUser, token }; // Return user and token
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password: userPassword } = loginUserDto;

    // Find the user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(userPassword, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Exclude the password from the returned user object
    const { password, ...userWithoutPassword } = user.toObject();

    // Generate JWT token including _id
    const token = this.jwtService.sign({
      _id: user._id,
      email: user.email,
      username: user.username,
    });

    return { message: 'Login successful', user: userWithoutPassword, token }; // Return user without password and token
  }

}