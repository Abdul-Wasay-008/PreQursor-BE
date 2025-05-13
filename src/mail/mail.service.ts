import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConversionsService } from 'src/conversions/conversions.service';

@Injectable()
export class MailService {
  constructor(private readonly conversionsService: ConversionsService) { }

  async sendMail(formData: { name: string; email: string; message: string }) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: 'PreQursor <alerts@notify.preqursor.com>',
        to: process.env.GMAIL_USER,
        replyTo: formData.email,
        subject: `Message from ${formData.name}`,
        text: formData.message,
      });

      // ✅ Fire Meta CAPI event
      await this.conversionsService.sendConversionEvent(
        'Contact',
        formData.email,
        '', // No phone number from contact form, leave blank
        0
      );
      console.log('✅ CAPI event sent for Contact form');

      return { message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error sending contact form email:', error);
      throw new Error('Failed to send contact form email');
    }
  }

  //Generic match confirmation email
  async sendMatchConfirmationGenericEmail(to: string[], matchDetails: any) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailSubject = `Match Confirmation for Match ID: ${matchDetails.matchId}`;
    const formattedPrizePool = matchDetails.prizePool
      .map(
        (prize) => `<li><strong>${prize.place}:</strong> ${prize.amount} PKR</li>`
      )
      .join('');

    const emailText = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; background: #f3f4f6; }
            .container { max-width: 600px; margin: auto; padding: 20px; background: white; border-radius: 12px; text-align: center; }
            h3 { color: #ff4500; text-align: center; font-size: 2em; }
            .email-content { font-size: 1.2em; padding: 20px; text-align: left; }
            .justify { text-align: justify; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.95em; }
            .logo { width: 100px; height: auto; display: block; margin: 25px auto 15px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
          </style>
        </head>
        <body>
          <div class="container justify">
            <img src="https://res.cloudinary.com/dw9ehsmfa/image/upload/v1745601274/PreQursor_-_Logo_hojvg0.png" class="logo" alt="PreQursor Logo">
            <h3>Match Slot Confirmed</h3>
            <div class="email-content justify">
              <p>Dear Player,</p>
              <p>You've successfully booked a slot in the upcoming <strong>${matchDetails.gameName}</strong> match.</p>
              <ul style="line-height: 1.6;">
                <li><strong>Map:</strong> ${matchDetails.map}</li>
                <li><strong>Battle Type:</strong> ${matchDetails.battleType}</li>
                <li><strong>Scheduled Time:</strong> ${matchDetails.dateTime}</li>
              </ul>
              <p>The Room ID and Password will be shared with you 30 minutes before the match begins.</p>
              <p>Stay tuned and keep an eye on your email for official updates.</p>
              <p class="highlight">
                  📣 Join our <a href="https://chat.whatsapp.com/EJ0rosoihdu9Q7n1mBQ7m7" target="_blank" style="color: #1d4ed8; text-decoration: underline;">official PreQursor WhatsApp group</a> to get exclusive match updates, announcements, rewards, and more!
                </p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The PreQursor Team</p>
            </div>
          </div>
        </body>
      </html>
      `;


    try {
      await resend.emails.send({
        from: 'PreQursor <alerts@notify.preqursor.com>',
        to,
        subject: emailSubject,
        html: emailText,
      });
      console.log('✅ Match confirmation email sent');
    } catch (error) {
      console.error('❌ Error sending match confirmation email:', error);
      throw new Error('Failed to send match confirmation email');
    }
  }

  //Email to send room id and password 30 mins before the match
  async sendMatchIdPassEmail(to: string[], matchDetails: any) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailSubject = `Match Confirmation for Match ID: ${matchDetails.matchId}`;
    const formattedPrizePool = matchDetails.prizePool
      .map(
        (prize) => `<li><strong>${prize.place}:</strong> ${prize.amount} PKR</li>`
      )
      .join('');

    const emailText = `
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; color: #333; background: #f3f4f6; }
      .container { max-width: 600px; margin: auto; padding: 20px; background: white; border-radius: 12px; text-align: center; }
      h3 { color: #ff4500; text-align: center; font-size: 2em; }
      .email-content { font-size: 1.2em; padding: 20px; text-align: left; }
      .justify { text-align: justify; }
      .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.95em; }
      .logo { width: 100px; height: auto; display: block; margin: 25px auto 15px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
      ul { line-height: 1.6; padding-left: 20px; }
      li strong { color: #ff4500; }
    </style>
  </head>
  <body>
    <div class="container justify">
      <img src="https://res.cloudinary.com/dw9ehsmfa/image/upload/v1745601274/PreQursor_-_Logo_hojvg0.png" class="logo" alt="PreQursor Logo">
      <h3>Match Room Details</h3>
      <div class="email-content justify">
        <p>Dear Player,</p>
        <p>Here are your room credentials and match details for the upcoming <strong>${matchDetails.gameName}</strong> match:</p>
        <ul>
          <li><strong>Map:</strong> ${matchDetails.map}</li>
          <li><strong>Battle Type:</strong> ${matchDetails.battleType}</li>
          <li><strong>Scheduled Time:</strong> ${matchDetails.dateTime}</li>
          <li><strong>Game Server:</strong> ${matchDetails.server}</li>
          <li><strong>Room ID:</strong> ${matchDetails.roomId}</li>
          <li><strong>Room Name:</strong> ${matchDetails.roomName || '—'}</li>
          <li><strong>Room Password:</strong> ${matchDetails.roomPassword}</li>
        </ul>
        <p><strong style="color: #e63946;">Confidential:</strong> Please do not share this email, including the Room ID or Password, with anyone.</p>
        <p>Good luck and may the best player win!</p>
        <p>📣 Join our 
          <a href="https://chat.whatsapp.com/EJ0rosoihdu9Q7n1mBQ7m7" target="_blank" style="color: #1d4ed8; text-decoration: underline;">
            official PreQursor WhatsApp group
          </a> 
          to stay updated with match news, rewards, and announcements.
        </p>
      </div>
      <div class="footer">
        <p>Best regards,<br>The PreQursor Team</p>
      </div>
    </div>
  </body>
</html>
`;



    try {
      await resend.emails.send({
        from: 'PreQursor <alerts@notify.preqursor.com>',
        to,
        subject: emailSubject,
        html: emailText,
      });
      console.log('✅ Match confirmation email sent');
    } catch (error) {
      console.error('❌ Error sending match confirmation email:', error);
      throw new Error('Failed to send match confirmation email');
    }
  }

  //Deposit confirmation email
  async sendDepositConfirmationEmail(userEmail: string, userName: string) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailSubject = `Deposit Request Received - PreQursor`;

    const emailText = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; background: #f3f4f6; }
        .container { max-width: 600px; margin: auto; padding: 20px; background: white; border-radius: 12px; text-align: center; }
        h3 { color: #ff4500; text-align: center; font-size: 2em; }
        .email-content { font-size: 1.2em; padding: 20px; text-align: left; }
        .justify { text-align: justify; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.95em; }
        .logo { width: 100px; height: auto; display: block; margin: 25px auto 15px auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
      </style>
    </head>
    <body>
      <div class="container justify">
        <img src="https://res.cloudinary.com/dw9ehsmfa/image/upload/v1745601274/PreQursor_-_Logo_hojvg0.png" class="logo" alt="PreQursor Logo">
        <h3>Deposit Confirmation</h3>
        <div class="email-content justify">
          <p>Dear ${userName},</p>
          <p>Thank you for submitting your deposit request. Our finance team is currently reviewing your transaction. Once the verification process is complete, your wallet will be updated accordingly. If any additional information is required, we will reach out to you via email.</p>
          <p>Thank you for choosing PreQursor!</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The PreQursor Team</p>
        </div>
      </div>
    </body>
    </html>
    `;

    try {
      await resend.emails.send({
        from: 'PreQursor <alerts@notify.preqursor.com>',
        to: userEmail,
        subject: emailSubject,
        html: emailText,
      });
      console.log(`📩 Deposit confirmation email sent to: ${userEmail}`);
    } catch (error) {
      console.error('❌ Error sending deposit confirmation email:', error);
      throw new Error('Failed to send deposit confirmation email');
    }
  }

  //Password Reset Link
  async sendResetEmail(email: string, resetLink: string) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailSubject = `Reset Your PreQursor Password`;

    const emailHtml = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; background-color: #f3f4f6; }
          .container { max-width: 600px; margin: auto; padding: 20px; background: white; border-radius: 12px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          h3 { color: #ff4500; font-size: 1.8em; margin-bottom: 20px; }
          p { font-size: 1.1em; margin-bottom: 20px; }
          a.button { display: inline-block; padding: 12px 24px; font-size: 1.1em; color: white; background-color: #ff4500; text-decoration: none; border-radius: 8px; transition: background-color 0.3s ease; }
          a.button:hover { background-color: #e63e00; }
          .footer { margin-top: 30px; color: #6b7280; font-size: 0.95em; }
          .logo { width: 100px; margin: 25px auto 15px; display: block; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="https://res.cloudinary.com/dw9ehsmfa/image/upload/v1745601274/PreQursor_-_Logo_hojvg0.png" class="logo" alt="PreQursor Logo" />
          <h3>Password Reset Request</h3>
          <p>We received a request to reset your PreQursor account password. If you didn't make this request, you can safely ignore this email.</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>This link is valid for 15 minutes only.</p>
          <div class="footer">
            <p>Stay sharp, gamer. <br />The PreQursor Team</p>
          </div>
        </div>
      </body>
    </html>
    `;

    try {
      await resend.emails.send({
        from: 'PreQursor <alerts@notify.preqursor.com>',
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });

      console.log(`📩 Password reset email sent to: ${email}`);
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
