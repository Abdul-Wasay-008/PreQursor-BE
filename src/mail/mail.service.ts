import { Injectable } from '@nestjs/common';
import transporter from './mail.config';

@Injectable()
export class MailService {
  async sendMail(formData: { name: string; email: string; message: string }) {
    const mailOptions = {
      from: formData.email,                     // Sender's email (from the form)
      to: process.env.GMAIL_USER,               // Your PQ email
      subject: `Message from ${formData.name}`,  // Username
      text: formData.message,                   // Message 
    };

    try {
      await transporter.sendMail(mailOptions);
      return { message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
