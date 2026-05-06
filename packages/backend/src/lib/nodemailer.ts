import { exit } from 'node:process';
import { config } from '../config/index.js';
import nodemailer from 'nodemailer';
import log from './winston.js'

const verify = () => {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
  try {
    transporter.verify();
  } catch (err) {
    log.error('An error occured trying to connect to SMTP server:', err);
    exit(1);
  }
  return transporter;
}

export const transporter = verify();