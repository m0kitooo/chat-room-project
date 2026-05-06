import { exit } from 'node:process';
import env from './config/env.js';
import nodemailer from 'nodemailer';
import log from './lib/winston.js'
import { transporter } from './lib/nodemailer.js'

transporter.sendMail({
  
});
