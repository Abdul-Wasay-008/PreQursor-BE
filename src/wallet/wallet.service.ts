import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/auth/schemas/user.schema";
import { ConversionsService } from "src/conversions/conversions.service";

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly conversionsService: ConversionsService  // Injecting CAPI service
  ) { }

  //Fetch the user wallet balance and display it on the fontend
  async getUserWalletBalance(userId: string): Promise<{ walletBalance: string, lastCredited: string, lastDebited: string }> {
    const user = await this.userModel.findOne({ _id: userId }).exec();

    if (!user) {
      throw new NotFoundException("User not found in database");
    }

    return {
      walletBalance: `${user.walletBalance.toLocaleString()} PKR`,
      lastCredited: user.lastCredited ? `+${user.lastCredited.toLocaleString()} PKR` : "+0 PKR",
      lastDebited: user.lastDebited ? `-${user.lastDebited.toLocaleString()} PKR` : "-0 PKR"
    };
  }

  //Update the user wallet balance against user id (_id)
  async updateWalletBalance(userId: string, amount: number) {
    console.log(`🔹 Updating Wallet Balance for User: ${userId}`);
    console.log(`💰 Amount to Change: ${amount}`);

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    if (amount === 0) {
      throw new BadRequestException("Amount must be greater than zero");
    }

    if (amount < 0 && user.walletBalance < Math.abs(amount)) {
      throw new BadRequestException("Insufficient funds");
    }

    // Determine if it's a credit (positive) or debit (negative)
    if (amount > 0) {
      user.lastCredited = amount;  // Store the latest credited amount
    } else {
      user.lastDebited = Math.abs(amount);  // Store the latest debited amount
    }

    // Update balance
    user.walletBalance += amount;

    // Save the updated wallet balance, last credited, and last debited in MongoDB
    await this.userModel.updateOne(
      { _id: userId },
      {
        $set: {
          walletBalance: user.walletBalance,
          lastCredited: user.lastCredited,
          lastDebited: user.lastDebited
        }
      }
    );

    console.log(`✅ Wallet Updated Successfully for User: ${userId}, New Balance: ${user.walletBalance}`);

    // Fire Conversions API if deposit happened
    if (amount > 0) {
      await this.conversionsService.sendConversionEvent(
        'Lead',            // Standard Meta Event
        user.email,
        user.phoneNumber,
        amount                 // Actual deposit amount
      );
    }

    return {
      walletBalance: `${user.walletBalance.toLocaleString()} PKR`,
      lastCredited: `+${user.lastCredited.toLocaleString()} PKR`,
      lastDebited: `-${user.lastDebited.toLocaleString()} PKR`
    };
  }
}
