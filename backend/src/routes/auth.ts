import { Router } from 'express';
import passport from 'passport';
import { googleCallbackHandler, logoutHandler, refreshTokenHandler, authStatusHandler } from '../controllers/authController';

const router = Router();

// Get Google Login Endpoint URL (for popup bootstrap flow)
router.get('/google-url', (req, res) => {
  res.json({ url: '/api/auth/google' });
});

// Trigger Google OAuth Screen
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Google OAuth Callback Redirect URL
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=OAuthFailed', session: false }),
  googleCallbackHandler
);

router.post('/logout', logoutHandler);
router.post('/refresh', refreshTokenHandler);
router.get('/status', authStatusHandler);

export default router;
