import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export function isAdminRequest(req: NextRequest): boolean {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? verifySession(token) : null;
  if (user?.role === "admin") return true;

  const providedKey = req.nextUrl.searchParams.get("key") ?? req.headers.get("x-admin-key");
  const configuredKey = process.env.RJ_ADMIN_KEY?.trim();
  if (!providedKey || !configuredKey) return false;

  const provided = Buffer.from(providedKey);
  const expected = Buffer.from(configuredKey);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
