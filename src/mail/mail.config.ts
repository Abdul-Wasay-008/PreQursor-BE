import * as nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      
    pass: process.env.GMAIL_PASSWORD,     
  },
});

export default transporter;
