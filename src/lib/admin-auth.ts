import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "pb_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  return secret;
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminSessionToken(email: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 hari
  const payload = `${email}|${exp}`;
  const signature = sign(payload);
  return `${payload}|${signature}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) return null;
  const parts = token.split("|");
  if (parts.length !== 3) return null;

  const [email, expStr, signature] = parts;
  const payload = `${email}|${expStr}`;
  const expected = sign(payload);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return null;

  return { email };
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "",
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}

export { COOKIE_NAME };
