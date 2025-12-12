import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import * as authService from "#services/authService.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        const userName =
          profile.displayName ||
          `${profile.name?.givenName || ""} ${
            profile.name?.familyName || ""
          }`.trim() ||
          "Google User";

        return done(null, { email, userName });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((data, done) => done(null, data));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;
