import 'dotenv/config';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// ✅ Google OAuth setup
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        // ✅ Find user by email
        let user = await User.findOne({ email });

        // ✅ If not found → create new OAuth user
        if (!user) {
          user = await User.create({
            firstName: profile.name.givenName || "Google",
            lastName: profile.name.familyName || "User",
            email,
            password: "oauth_temp_password", // won't be used
            oauthSignup: true,
            agreedToTerms: true,
          });
        }

        // ✅ Generate JWT using MongoDB user._id
        const token = generateToken({ id: user._id });

        return done(null, { user, token });
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((data, done) => {
  done(null, data);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
