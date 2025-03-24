import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Screenshot } from './schema/screenshot.schema';
import { diskStorage } from 'multer';
import { MailService } from 'src/mail/mail.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ScreenshotService {
  constructor(
    @InjectModel(Screenshot.name) private screenshotModel: Model<Screenshot>,
    private readonly mailService: MailService,
  ) { }

  // 🔹 Multer Configuration for File Storage
  static multerConfig() {
    const destinationPath = process.env.UPLOAD_PATH || path.join(__dirname, '..', '..', 'uploads');

    // Ensure upload directory exists
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: destinationPath,
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

    const newScreenshot = new this.screenshotModel({ userId, ss: filePath });
    await newScreenshot.save();

    console.log(`📂 Screenshot saved successfully: ${filePath}`);

    await this.mailService.sendDepositConfirmationEmail(userEmail, userName);

    return { message: "Screenshot uploaded successfully, confirmation email sent.", filePath };
  }
}
