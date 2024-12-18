import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Named export: sendConfirmationEmail
export const sendConfirmationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const confirmationUrl = `${process.env.BASE_URL}/auth/confirm?token=${token}`;

  const mailOptions = {
    from: '"AI Publisher" <no-reply@aipublisher.com>',
    to: email,
    subject: 'Confirm Your Email',
    html: `<p>Click <a href="${confirmationUrl}">here</a> to confirm your email.</p>`,
  };

  await transporter.sendMail(mailOptions);
};