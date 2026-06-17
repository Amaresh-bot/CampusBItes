import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import { User } from '../models/User';

export const configurePassport = () => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️ Google OAuth environment credentials are missing. Passport Google Strategy will not initialize.");
    return;
  }

  console.log(`🔑 Passport Google Strategy initialized:`);
  console.log(`   - Client ID: ${env.GOOGLE_CLIENT_ID.substring(0, 15)}...`);
  console.log(`   - Callback URL: ${env.GOOGLE_CALLBACK_URL}`);

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email address returned from Google OAuth profile"));
          }

          let user = await User.findOne({ email });
          if (!user) {
            // Generate temporary unique roll number so model validations pass during OAuth creation
            const tempRoll = `TEMP_${profile.id.substring(0, 10).toUpperCase()}`;
            user = new User({
              email,
              fullName: profile.displayName || "Google User",
              rollNumber: tempRoll,
              googleId: profile.id,
              role: 'customer',
              profileLocked: false
            });
            await user.save();
          } else if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user as any);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
};
