import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.AUTH_SECRET || process.env.DATABASE_URL || "";
const COOKIE = "nyc_session";

export type SessionUser = { id: number; name: string; email: string; role: string };

export function signSession(user: SessionUser): string {
  return jwt.sign(user, SECRET, { expiresIn: "30d" });
}

export function verifySession(token: string): SessionUser | null {
  try {
    return jwt.verify(token, SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    return verifySession(token);
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE;
