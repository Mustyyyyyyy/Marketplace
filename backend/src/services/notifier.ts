import { env } from '../config';
import { logger } from '../logger';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(msg: EmailMessage): Promise<{ delivered: boolean; channel: string }> {
  // Real SMTP path
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    try {
      // Lazy require to keep this module lightweight
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT || 587),
        secure: Number(env.SMTP_PORT) === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      });
      await transporter.sendMail({ from: env.SMTP_FROM, to: msg.to, subject: msg.subject, html: msg.html, text: msg.text });
      return { delivered: true, channel: 'smtp' };
    } catch (e) {
      logger.error({ err: e }, 'smtp send failed');
    }
  }
  // Dev fallback: log to console
  logger.info({ to: msg.to, subject: msg.subject }, '[EMAIL-DEV] would send');
  return { delivered: false, channel: 'console' };
}

export async function sendSms(to: string, body: string): Promise<{ delivered: boolean; channel: string }> {
  if (env.SMS_PROVIDER === 'console' || !env.SMS_PROVIDER) {
    logger.info({ to, body }, '[SMS-DEV] would send');
    return { delivered: false, channel: 'console' };
  }
  // Plug your Twilio/Vonage/etc. integration here
  return { delivered: false, channel: env.SMS_PROVIDER };
}