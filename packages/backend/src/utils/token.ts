import { AuthJWTPayload } from '../types/index.js';
import { config } from '../config/index.js'
import * as jose from 'jose';

export const extractBearerToken = (header: string) => {
  const [prefix, token] = header.split(' ');
  if (prefix !== 'Bearer' || !token) return null;
  return token;
};

export const verifyAccessToken = (token: string) => {
  return jose.jwtVerify<AuthJWTPayload>(token, config.jwt.access.secret);
};