import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { verifyRefreshToken } from '../services/authService';

export interface AuthenticatedRequest extends Request {}

export const requireAuth = async (
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

  const handleRefresh = async (): Promise<boolean> => {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return false;

    try {
      console.log("Access token missing/expired. Attempting token auto-refresh via refresh_token...");
      const decodedRefresh = verifyRefreshToken(refreshToken);
      const user = await User.findById(decodedRefresh.id);
      if (!user) {
        console.warn("Auto-refresh failed: User not found in database.");
        return false;
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role },
        env.JWT_ACCESS_SECRET,
        { expiresIn: env.ACCESS_TOKEN_EXPIRY as any }
      );

      // Set the new access token cookie
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      console.log("Auto-refreshed access token successfully.");
      req.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      };
      return true;
    } catch (refreshErr: any) {
      console.error("Auto-refresh failed during requireAuth:", refreshErr.message);
      return false;
    }
  };

  if (!token) {
    const refreshed = await handleRefresh();
    if (refreshed) {
      return next();
    }
    console.warn("requireAuth failed: No access or refresh token provided.");
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
    console.warn("JWT verification failed. Error:", err.message);

    if (err.name === 'TokenExpiredError') {
      const refreshed = await handleRefresh();
      if (refreshed) {
        return next();
      }
    }

    return res.status(401).json({ success: false, message: 'Authentication failed. Invalid or expired token.' });
  }
};

