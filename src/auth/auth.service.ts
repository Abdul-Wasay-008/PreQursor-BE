import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { MailService } from '../mail/mail.service';
import { ConversionsService } from 'src/conversions/conversions.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly conversionsService: ConversionsService,
  ) { }

  //Sign Up Method
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

    // Send Conversions API Event (User Signup)
    await this.conversionsService.sendConversionEvent(
      'CompleteRegistration',       // Event Name
      email,                // User Email
      phoneNumber,          // User Phone Number
      0                     // Value (0 for signup, no monetary value)
    );

    // Generate JWT token including _id
    const token = this.jwtService.sign({
      _id: savedUser._id,
      email: savedUser.email,
      username: savedUser.username,
    });

    return { user: savedUser, token }; // Return user and token
  }

  //Login Method
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

    //Send Conversions API Event (User Login)
    await this.conversionsService.sendConversionEvent(
      'Login',         // Event Name
      user.email,           // User Email
      user.phoneNumber,     // User Phone Number (ensure you store it)
      0                      // Value (0 for login, no monetary value)
    );

    // Generate JWT token including _id
    const token = this.jwtService.sign({
      _id: user._id,
      email: user.email,
      username: user.username,
    });

    return { message: 'Login successful', user: userWithoutPassword, token }; // Return user without password and token
  }

  // Reset password Method link with token generation
  async sendPasswordResetLink(email: string) {
    const user = await this.userModel.findOne({ email });

    // ❌ Don't reveal whether email exists
    if (!user) {
      return {
        message: 'If an account exists with this email, a reset link has been sent.',
      };
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // Expires in 15 mins
    );

    const resetLink = `https://www.preqursor.com/reset-password?token=${token}`;

    await this.mailService.sendResetEmail(email, resetLink);

    return {
      message: 'If an account exists with this email, a reset link has been sent.',
    };
  }

  //Reset password logic
  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };

      const user = await this.userModel.findById(decoded.userId);
      if (!user) {
        throw new HttpException('Invalid or expired token', HttpStatus.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await user.save();

      return { message: 'Password reset successful! Redirecting to login page...' };
    } catch (err) {
      throw new HttpException('Invalid or expired token', HttpStatus.BAD_REQUEST);
    }
  }
}