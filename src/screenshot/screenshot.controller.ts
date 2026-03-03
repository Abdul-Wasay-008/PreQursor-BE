import { Controller, Post, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtGuard } from '../auth/jwt.guard';
import { ScreenshotService } from './screenshot.service';

@Controller('screenshot')
export class ScreenshotController {
  constructor(private readonly screenshotService: ScreenshotService) {}

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('ss', ScreenshotService.multerConfig())) // Call config from service
  async uploadFile(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const { _id, email, username } = req.user; // Extract user data from JWT
    
    // ✅ Pass userId, file, email, and username to service
    return this.screenshotService.uploadScreenshot(_id, file.filename, email, username);
  }
}
