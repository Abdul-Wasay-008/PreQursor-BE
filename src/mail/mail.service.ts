import { Injectable } from '@nestjs/common';
import transporter from './mail.config';
import * as path from 'path';

@Injectable()
export class MailService {
  async sendMail(formData: { name: string; email: string; message: string }) {
    const mailOptions = {
      from: process.env.GMAIL_USER,              // PQ email
      to: process.env.GMAIL_USER,                // PQ email
      replyTo: formData.email,                   // Sender's email (used for replies)
      subject: `Message from ${formData.name}`,  // Username
      text: formData.message,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Function for sending match confirmation emails
  async sendMatchConfirmationEmail(to: string[], matchDetails: any) {
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
              body {
                font-family: 'Arial', sans-serif;
                background: #fff5e6; /* Fallback for non-gradient support */
                background: linear-gradient(to bottom, #fff5e6, #ffffff); /* Light orange gradient */
                color: #333;
                padding: 0;
                margin: 0;
              }
              .container {
                width: 100%;
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              }
              h3 {
                color: #ff4500; /* Orangered */
                text-align: center;
                font-size: 2em;
                margin-bottom: 20px;
              }
              .email-content {
                padding: 20px;
                font-size: 1.2em;
                color: #444;
                text-align: justify;
              }
              .details-list {
                list-style-type: none;
                padding-left: 0;
              }
              .details-list li {
                margin-bottom: 15px;
                font-size: 1.1em;
              }
              .details-list li strong {
                color: #e63946; /* Red */
              }
              .prize-pool {
                margin-top: 10px;
                padding-left: 20px;
                color: #f77f00; /* Orange */
              }
              .prize-pool li {
                margin-bottom: 5px;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #6b7280;
                font-size: 0.95em;
              }
              .highlight {
                font-weight: bold;
                color: #ff7f50; /* Coral */
                font-size: 1.1em;
              }
              .logo { width: 100px; height: auto; display: block; margin: 25px auto 15px auto; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="cid:pqLogo" class="logo" alt="PreQursor Logo">
              <h3>Match Confirmation</h3>
              <div class="email-content">
              <p>Congratulations! You've successfully booked a match!</p>
              <ul class="details-list">
              <li><strong>Match ID:</strong> ${matchDetails.matchId}</li>
              <li><strong>Game Name:</strong> ${matchDetails.gameName}</li>
              <li><strong>Map:</strong> ${matchDetails.map}</li>
              <li><strong>Battle Type:</strong> ${matchDetails.battleType}</li>
              <li><strong>Game Server:</strong> ${matchDetails.server}</li>
              <li><strong>Prize Pool:</strong>
                <ul class="prize-pool">
                  ${formattedPrizePool}
                </ul>
              </li>
              <li><strong>Date and Time:</strong> ${matchDetails.dateTime}</li>
              <li><strong>Room Name:</strong> ${matchDetails.roomName}</li> 
              <li><strong>Room Password:</strong> ${matchDetails.roomPassword}</li> 
            </ul>

            <p><strong>Confidential:</strong> Please do not share this email, including the room name and password, with anyone. This information is for your use only to ensure a secure and fair match.</p>

            <p>Good luck, and may the best player win!</p>
            <p>Thank you for choosing PreQursor. We are thrilled to have you as part of our vibrant gaming community!</p>
            <p class="highlight"><strong>Make sure to save this email for future reference.</strong></p>
          </div>

          <div class="footer">
            <p>Best regards, <br>The PreQursor Team</p>
          </div>

          </body>
          </html>

  `;

    const mailOptions = {
      from: process.env.GMAIL_USER,  // PQ email
      to: to.join(','),              // Send to multiple recipients (players)
      subject: emailSubject,
      html: emailText,
      attachments: [
        {
          filename: "pqLogo.jpg",
          path: path.join(process.cwd(), 'assets', 'pqLogo.jpg'),
          cid: "pqLogo",
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Match confirmation email sent successfully');
    } catch (error) {
      console.error('Error sending match confirmation email:', error);
      throw new Error('Failed to send match confirmation email');
    }
  }

  // ✅ Function for sending deposit confirmation emails
  async sendDepositConfirmationEmail(userEmail: string, userName: string) {
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
        .details { padding: 10px 20px; border-radius: 10px; background: #f8f8f8; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 0.95em; }
        .cta { background: #ff4500; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; }
        .logo { width: 100px; height: auto; display: block; margin: 25px auto 15px auto; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); }
      </style>
    </head>
    <body>
      <div class="container justify">
        <img src="cid:pqLogo" class="logo" alt="PreQursor Logo">
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


    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: emailSubject,
      html: emailText,
      attachments: [
        {
          filename: "pqLogo.jpg",
          path: path.join(process.cwd(), 'assets', 'pqLogo.jpg'),
          cid: "pqLogo",
        },
      ],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📩 Deposit confirmation email sent to: ${userEmail}`)
    } catch (error) {
      console.error('❌ Error sending deposit confirmation email:', error);
      throw new Error('Failed to send deposit confirmation email');
    }
  }
}
