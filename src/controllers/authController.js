import * as authService from "#services/authService.js";

const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 1,
};
export const register = async (req, res) => {
  try {
    const { token, user } = await authService.registerUser(req.body);
    const isLocalhost = req.headers.origin?.includes("localhost");

    res.cookie(COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      secure: !isLocalhost,
      sameSite: isLocalhost ? "lax" : "none",
    });
    console.log("🔐 Cookie SET on backend:", {
      name: COOKIE_NAME,
      token: token.slice(0, 15) + "...",
      options: COOKIE_OPTIONS,
    });
    console.log(res);

    res.status(201).json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { token, user } = await authService.loginUser(req.body);
    const isLocalhost = req.headers.origin?.includes("localhost");

    res.cookie(COOKIE_NAME, token, {
      ...COOKIE_OPTIONS,
      secure: !isLocalhost,
      sameSite: isLocalhost ? "lax" : "none",
    });
    console.log("🔐 Cookie SET on backend:", {
      name: COOKIE_NAME,
      token: token.slice(0, 15) + "...", // don't print full JWT
      options: COOKIE_OPTIONS,
    });

    console.log(res);
    res.json({ user });
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
    const { token, user } = req.user;

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    const redirectURL = `${
      process.env.FRONTEND_URL
    }/auth/oauth?user=${encodeURIComponent(JSON.stringify(user))}`;

    return res.redirect(redirectURL);
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
