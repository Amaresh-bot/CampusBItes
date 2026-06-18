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
          const isAdminEmail = email.toLowerCase() === 'shivaganeshmummadi7@gmail.com' || email.toLowerCase() === 'amareshkaturi@gmail.com' || email.toLowerCase() === 'akshith5481@gmail.com';

          if (!user) {
            user = new User({
              email,
              fullName: profile.displayName || "Google User",
              googleId: profile.id,
              role: isAdminEmail ? 'admin' : 'customer'
            });
            await user.save();
          } else {
            let needsSave = false;
            if (!user.googleId) {
              user.googleId = profile.id;
              needsSave = true;
            }
            if (isAdminEmail && user.role !== 'admin') {
              user.role = 'admin';
              needsSave = true;
            }
            if (needsSave) {
              await user.save();
            }
          }

          return done(null, user as any);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
};
