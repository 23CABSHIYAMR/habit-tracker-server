import crypto from "crypto";
const codes = new Map();

export function generateOAuthCode(userId) {
  const code = crypto.randomUUID();

  codes.set(code, {
    userId,
    expiresAt: Date.now() + 60 * 1000,
  });

  return code;
}

export function consumeOAuthCode(code) {
  const entry = codes.get(code);

  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    codes.delete(code);
    return null;
  }

  codes.delete(code);
  return entry.userId;
}
