import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenUserPayload {
  id: string;
  email: string;
  role: 'customer' | 'admin';
}

export const generateAccessToken = (user: TokenUserPayload): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY as any }
  );
};

export const generateRefreshToken = (user: TokenUserPayload): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY as any }
  );
};

export const verifyAccessToken = (token: string): TokenUserPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenUserPayload;
};

export const verifyRefreshToken = (token: string): TokenUserPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenUserPayload;
};
