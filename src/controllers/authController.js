import * as authService from "#services/authService.js";

export const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
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

/* -------------------------------------------------------
   Google OAuth redirect handler
------------------------------------------------------- */
export const oauthRedirect = async (req, res) => {
  try {
    const { token, user } = req.user;

    // Send only required user fields, never raw DB object
    const sanitizedUser = {
      id: user.id,
      userName: user.userName,
      email: user.email,
    };

    const redirectURL =
      `${process.env.FRONTEND_URL}/auth/oauth` +
      `?token=${encodeURIComponent(token)}` +
      `&user=${encodeURIComponent(JSON.stringify(sanitizedUser))}`;

    res.redirect(redirectURL);
  } catch (err) {
    console.error("OAuth redirect error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`);
  }
};
