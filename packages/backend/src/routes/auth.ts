import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { parseRequestBody } from '../middleware/request-parse.js';
import { AuthJWTPayload, ErrorResponseDTO } from '../types/index.js';
import z from 'zod';
import { registerSchema, loginSchema, type RegisterPayload, type LoginPayload } from '@chat-room/shared';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import { config } from '../config/index.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import * as jose from 'jose';
import { transporter } from '../lib/nodemailer.js';
import { JOSEError } from 'jose/errors';
import log from '../lib/winston.js'
import { guard } from '../middleware/auth-handler.js';

type RegisterRequestDTO = RegisterPayload;
type LoginRequstDTO = LoginPayload;
type AuthDTO = Omit<{ id: string, accessToken: string } & RegisterRequestDTO, 'password'>;
type RegisterDTO = Omit<AuthDTO, 'accessToken'>;

const generateAccessToken = async (payload: AuthJWTPayload) => {
  return new jose.SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(config.jwt.access.expiresIn)
    .setIssuedAt()
    .sign(config.jwt.access.secret);
};

type VerificationJWTPayload = { userId: string };

const generateVerificationToken = async (payload: VerificationJWTPayload) => {
  return new jose.SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(config.jwt.verification.expiresIn)
    .setIssuedAt()
    .sign(config.jwt.verification.secret);
};

const verifyVerificationToken = async (token: string) => {
  return jose.jwtVerify<VerificationJWTPayload>(token, config.jwt.verification.secret);
};

export const formatTimeSec = (value: number): string => {
  let days = 0, hours = 0, minutes = 0;
  let minInSec = 60, hInSec = 60 * minInSec, dInSec = 24 * hInSec;
  let temp: number;
  if ((temp = value / dInSec) > 1) {
    days = Math.trunc(temp);
    value %= dInSec;
  }
  if ((temp = value / hInSec) > 1) {
    hours = Math.trunc(temp);
    value %= hInSec;
  }
  if ((temp = value / minInSec) > 1) {
    minutes = Math.trunc(temp);
    value %= minInSec;
  }

  const labelQuantity = (quantity: number, label: string) => quantity > 0 
    ? quantity > 1
      ? `${quantity} ${label}s`
      : `${quantity} ${label}`
    : '';

  return [labelQuantity(days, 'day'), labelQuantity(hours, 'hour'), labelQuantity(minutes, 'minute'), labelQuantity(value, 'second')]
    .filter(Boolean)  
    .join(' ');
};

const sendAccountActivationEmail = (userEmail: string, activationToken: string) => {
  const activationUrl = `${config.server.appUrl}/api/auth/verify?token=${activationToken}`;
  return transporter.sendMail({
    from: `"Chat Room" <${config.smtp.user}>`,  
    to: userEmail,
    subject: 'Activate your account',
    html: /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Activate your account</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                  <tr>
                    <td>
                      <h1 style="margin:0 0 16px;font-size:22px;color:#18181b;">Activate your account</h1>
                      <p style="margin:0 0 24px;font-size:15px;color:#52525b;line-height:1.6;">
                        Thanks for signing up! Click the button below to activate your account.
                        This link expires in <strong>${formatTimeSec(config.jwt.verification.expiresIn)}</strong>.
                      </p>
                      <a href="${activationUrl}"
                         style="display:inline-block;padding:12px 28px;background-color:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600;">
                        Activate account
                      </a>
                      <p style="margin:24px 0 0;font-size:13px;color:#a1a1aa;">
                        If you didn't create an account, you can safely ignore this email.<br/>
                        Or paste this link into your browser:<br/>
                        <a href="${activationUrl}" style="color:#2563eb;word-break:break-all;">${activationUrl}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
};

const register = async (req: Request<{}, any, RegisterRequestDTO>, res: Response<RegisterDTO | ErrorResponseDTO>, next: NextFunction) => {
  const hashedPassword = await bcrypt.hash(req.body.password, config.bcrypt.rounds);
  try {
    const createdUser = await prisma.user.create({
      data: {
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword
      }
    });
    log.info(`User registered with ID: ${createdUser.id}`);
    const verificationToken = await generateVerificationToken({ userId: createdUser.id });
    await sendAccountActivationEmail(createdUser.email, verificationToken);
    res.status(201).json({ 
      id: createdUser.id, 
      username: createdUser.username, 
      email: createdUser.email
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      // according to the docs it is should work but it doesn't, it is probabelly a bug, here is an issue: https://github.com/prisma/prisma/issues/28953
      // const fields = err.meta!.target as string[];
      // fix for now
      const fields = (err.meta as any).driverAdapterError.cause.constraint.fields as string[];
      return res.status(409).json({
        errorType: 'REGISTERATION_ERROR',
        message: `Validation failed`,
        additionalData: {
          alreadyTakenFields: fields.reduce((acc, f) => {
            acc[f] = `${f} already taken`
            return acc;
          }, {} as Record<string, string>)
        }
      });
    }
    next(err);
  }
}

const login = async (req: Request<{}, any, LoginRequstDTO>, res: Response<AuthDTO | ErrorResponseDTO>) => {
  const invalidUsernameOrPasswordResBody = {
    errorType: 'LOGIN_ERROR',
    message: 'Invalid username or password'
  };

  const user = await prisma.user.findFirst({
    select: { id: true, username: true, email: true, password: true, isActive: true, roles: true },
    where: { 
      OR: [{ username: req.body.identifier }, { email: req.body.identifier }]
    }
  });
  if (!user) return res.status(401).json(invalidUsernameOrPasswordResBody);
  if (!user.isActive) return res.status(403).json({ errorType: 'ACCOUNT_NOT_ACTIVATED', message: 'Account not activated, check out your email address'});

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) return res.json(invalidUsernameOrPasswordResBody);
  
  res.status(200).json({
    id: user.id,
    username: user.username, 
    email: user.email, 
    accessToken: await generateAccessToken({ userId: user.id, username: user.username, email: user.email, roles: user.roles })
  });
  log.info(`User with ID ${user.id} logged in`);
};

const verify = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.query.token as string;
  if (!token) return res.status(400).json({ errorType: 'BAD_REQUEST', message: 'Token is required' });
  try {
    const { payload } = await verifyVerificationToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(400).json({ errorType: 'INVALID_TOKEN', message: 'Invalid activation token' });
    if (user.isActive) return res.status(400).json({ errorType: 'ALREADY_ACTIVATED', message: 'Account already activated' });
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: true }
    });
    res.status(200).json({ message: 'Account activated successfully' });
  } catch (err) {
    if (err instanceof JOSEError) return res.status(400).json({ errorType: 'INVALID_TOKEN', message: 'Invalid activation token' }); 
    next(err);
  }
};

// function authWss(req: Request, res: Response) {

// }

const authRouter = Router();
authRouter.post('/auth/login', parseRequestBody(loginSchema), login);
authRouter.post('/auth/register', parseRequestBody(registerSchema), register);
authRouter.get('/auth/verify', verify);
// authRouter.post('/auth/ws-ticket', handleAuth)

export { authRouter };
