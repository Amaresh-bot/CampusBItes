import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthenticatedRequest extends Request {}

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("requireAuth middleware triggered");
  console.log("Incoming cookies:", req.cookies);
  console.log("Incoming authorization header:", req.headers.authorization);

  let token = req.cookies?.access_token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.warn("requireAuth failed: No token provided.");
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    console.log("JWT verified successfully. Decoded user:", decoded);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (err: any) {
    console.error("JWT verification failed. Error:", err.message);
    return res.status(401).json({ success: false, message: 'Authentication failed. Invalid or expired token.' });
  }
};
