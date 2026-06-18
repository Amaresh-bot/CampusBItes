import { Request, Response, NextFunction } from 'express';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyAccessToken } from '../services/authService';
import { User } from '../models/User';
import { env } from '../config/env';

// Helper to set secure access and refresh cookies
const setTokenCookies = (res: Response, user: { id: string; email: string; role: 'customer' | 'admin' }) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return { accessToken, refreshToken };
};

export const googleCallbackHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    if (!user) {
      return res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_FAILURE', error: 'OAuth failed' }, '*');
              }
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    setTokenCookies(res, {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const isTempRoll = user.rollNumber && user.rollNumber.startsWith('TEMP_');
    const hasProfile = !!user.rollNumber && !isTempRoll;
    const profile = hasProfile ? {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      rollNumber: user.rollNumber,
      branch: user.branch,
      academicYear: user.academicYear,
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified
    } : null;

    const authedUser = {
      id: user._id.toString(),
      name: user.fullName,
      email: user.email,
      role: user.role
    };

    return res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'OAUTH_AUTH_SUCCESS',
                user: ${JSON.stringify(authedUser)},
                hasProfile: ${hasProfile},
                profile: ${profile ? JSON.stringify(profile) : "null"}
              }, '*');
              window.close();
            } else {
              setTimeout(() => { window.close(); }, 300);
            }
          </script>
          <p>Authentication successful. You can close this window now.</p>
        </body>
      </html>
    `);
  } catch (err) {
    next(err);
  }
};

export const logoutHandler = (req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const refreshTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session no longer valid' });
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    setTokenCookies(res, payload);

    return res.status(200).json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        rollNumber: user.rollNumber
      }
    });
  } catch (err) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
  }
};

export const authStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.access_token;
    if (!accessToken) {
      return res.status(200).json({ success: true, authenticated: false, user: null });
    }

    const decoded = verifyAccessToken(accessToken);
    const user = await User.findById(decoded.id).populate('collegeId');
    if (!user) {
      return res.status(200).json({ success: true, authenticated: false, user: null });
    }

    return res.status(200).json({
      success: true,
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        rollNumber: user.rollNumber,
        branch: user.branch,
        academicYear: user.academicYear,
        phoneNumber: user.phoneNumber,
        college: user.collegeId
      }
    });
  } catch (err) {
    return refreshTokenHandler(req, res, next);
  }
};
