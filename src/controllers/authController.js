import * as authService from "#services/authService.js";
import { generateOAuthCode, consumeOAuthCode } from "#utils/oauthCodeStore.js";
import { generateToken } from "#utils/generateToken.js";

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 10,
};

export const register = async (req, res) => {
  try {
    const { token } = await authService.registerUser(req.body);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(201).json({ message: "Signed in successfully", token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { token } = await authService.loginUser(req.body);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ message: "Logged In successfully", token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const result = await authService.getMe(req.user);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const oauthRedirect = async (req, res) => {
  try {
    const { userName, email } = req.user;
    if (!userName) {
      console.error("OAuth redirect: Missing req.user");
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/login?error=no_user`
      );
    }

    const { userId } = await authService.oauthLogin({ email, userName });

    const code = generateOAuthCode(userId);

    return res.redirect(`${process.env.FRONTEND_URL}/auth/oauth?code=${code}`);
  } catch (err) {
    console.error("OAuth redirect error:", err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`
    );
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed" });
  }
};

export const exchangeCode = async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ message: "Missing code" });

  const userId = consumeOAuthCode(code);

  if (!userId) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  const token = generateToken({ id: userId });

  return res.json({ token });
};
