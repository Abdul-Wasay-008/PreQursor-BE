import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service'; 

@Controller('contact')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async handleContactForm(@Body() formData: { name: string; email: string; message: string }) {
    return this.mailService.sendMail(formData);
  }
}
