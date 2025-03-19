import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Screenshot } from './schema/screenshot.schema';
import { diskStorage } from 'multer';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ScreenshotService {
  constructor(
    @InjectModel(Screenshot.name) private screenshotModel: Model<Screenshot>,
    private readonly mailService: MailService, // ✅ Inject MailService
  ) {}

  // 🔹 Multer Configuration for File Storage
  static multerConfig() {
    return {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          if (!file) {
            return callback(new Error("No file received"), null);
          }
          const uniqueName = `${Date.now()}-${file.originalname}`;
          callback(null, uniqueName);
        }
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
          return callback(new Error("Only image files are allowed"), false);
        }
        callback(null, true);
      }
    };
  }

  // 🔹 Save Screenshot in Database & Send Confirmation Email
  async uploadScreenshot(userId: string, filename: string, userEmail: string, userName: string) {
    const filePath = `/uploads/${filename}`;

    // ✅ Save screenshot in MongoDB
    const newScreenshot = new this.screenshotModel({ userId, ss: filePath });
    await newScreenshot.save();

    console.log(`📂 Screenshot saved successfully: ${filePath}`);

    // ✅ Send deposit confirmation email
    await this.mailService.sendDepositConfirmationEmail(userEmail, userName);

    return { message: "Screenshot uploaded successfully, confirmation email sent.", filePath };
  }
}
