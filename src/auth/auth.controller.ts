import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { GoogleAuthGuard } from './utils/GoogleAuthGuard';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }


  // Google authentication routes

  // Initiating Google login
  @Get('google/login')
  @UseGuards(GoogleAuthGuard) // Use the Google Auth Guard
  async handleLogin() {
    // The request will be redirected to Google for authentication
  }

  // Redirect URI
  @Get('auth/callback')
  @UseGuards(GoogleAuthGuard) // Use the Google Auth Guard
  async handleRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user; // User info returned from Google
    const token = await this.authService.validateUser(user); // Generate JWT from user info

    // Send token back to client (you can redirect to your frontend and include the token in the URL)
    return res.redirect(`your_frontend_url?token=${token}`);
  }
}
