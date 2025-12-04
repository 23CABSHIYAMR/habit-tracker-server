import User from "#models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "#utils/generateToken.js";

export const registerUser = async ({
  userName,
  email,
  password,
  agreedToTerms,
  oauthSignup,
}) => {
  if (!userName || !email || (!oauthSignup && !password)) {
    throw { status: 400, message: "Missing required fields" };
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw { status: 400, message: "User already exists" };

  const user = await User.create({
    userName,
    email: email.toLowerCase(),
    password: oauthSignup ? null : password,
    agreedToTerms,
    oauthSignup,
  });
  const token = generateToken({ id: user._id });
  return {
    token,
    user: { id: user._id, userName: user.userName, email: user.email,createdAt:user.createdAt },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );
  if (!user) throw { status: 401, message: "Invalid credentials" };

  if (user.oauthSignup) throw { status: 400, message: "Use OAuth login" };

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw { status: 401, message: "Invalid credentials" };

  const token = generateToken({ id: user._id });

  return {
    token,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
};

export const getMe = async (user) => {
  const userData = await User.find({user});
  return {
    id: userData._id,
    userName: userData.userName,
    email: userData.email,
    createdAt: userData.createdAt,
  };
};

/* Google OAuth callback (called from googleStrategy.js) */
export const oauthLogin = async (googleUser) => {
  const email = googleUser.email.toLowerCase();
  
  let user = await User.findOne({ email });
  
  if (!user) {
    user = await User.create({
      userName: googleUser.userName,
      email,
      password: null,
      oauthSignup: true,
      agreedToTerms: true,
    });
  }
  
  const token = generateToken({ id: user._id });
  
  return {
    token,
    user: {
      id: user._id,
      userName: user.userName,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
};
