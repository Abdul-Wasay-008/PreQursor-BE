import { Controller, Get, Post, Req, Body, UseGuards, BadRequestException, Headers, UnauthorizedException } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { JwtGuard } from "src/auth/jwt.guard";
import * as dotenv from "dotenv";
dotenv.config();

@Controller("wallet")
export class WalletController {
  constructor(private readonly walletService: WalletService) { }

  // Fetch user wallet balance along with last credited and last debited
  @UseGuards(JwtGuard)
  @Get("balance")
  async getWalletBalance(@Req() req) {
    const userId = req.user._id;
    const walletDetails = await this.walletService.getUserWalletBalance(userId);

    return {
      walletBalance: walletDetails.walletBalance,
      lastCredited: walletDetails.lastCredited,
      lastDebited: walletDetails.lastDebited
    };
  }

  // Update the user wallet balance
  @Post("update-balance")
  async updateWalletBalance(@Body() body, @Headers("x-api-key") apiKey: string) {
    const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

    if (!ADMIN_API_KEY || apiKey !== ADMIN_API_KEY) {
      throw new UnauthorizedException("Invalid API Key. Access Denied.");
    }

    const { userId, amount } = body;

    if (!userId || !amount) {
      throw new BadRequestException("User ID and amount are required.");
    }

    const updatedWallet = await this.walletService.updateWalletBalance(userId, amount);

    return {
      message: "Wallet updated successfully",
      walletBalance: updatedWallet.walletBalance,
      lastCredited: updatedWallet.lastCredited,
      lastDebited: updatedWallet.lastDebited
    };
  }
}
