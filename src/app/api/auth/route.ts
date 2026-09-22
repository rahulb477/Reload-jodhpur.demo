import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { isDatabaseConfigured, databaseUnavailableResponse } from "@/lib/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { signSession, verifySession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET -> current user (null in demo mode, never crashes)
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ user: null, databaseConfigured: isDatabaseConfigured() });
  const user = verifySession(token);
  return NextResponse.json({ user, databaseConfigured: isDatabaseConfigured() });
}

// POST -> login or signup { mode, name?, email, password, mobile? }
export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      databaseUnavailableResponse({ error: "Accounts are unavailable in demo mode. Database is not configured yet." }),
      { status: 503 }
    );
  }
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(databaseUnavailableResponse({ error: "Database unavailable." }), { status: 503 });
    }
    const body = await req.json();
    const { mode, name, email, password, mobile } = body as {
      mode: string; name?: string; email: string; password: string; mobile?: string;
    };
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    const normalized = email.toLowerCase().trim();

    if (mode === "signup") {
      if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
      const existing = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
      if (existing.length) return NextResponse.json({ error: "Account already exists. Please login." }, { status: 409 });
      const hash = await bcrypt.hash(password, 10);
      const inserted = await db.insert(users).values({ name, email: normalized, mobile: mobile ?? null, passwordHash: hash }).returning();
      const u = inserted[0];
      const token = signSession({ id: u.id, name: u.name, email: u.email, role: u.role });
      const res = NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
      res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
      return res;
    } else {
      const rows = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
      if (!rows.length) return NextResponse.json({ error: "No account found with this email." }, { status: 404 });
      const u = rows[0];
      const ok = await bcrypt.compare(password, u.passwordHash);
      if (!ok) return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
      const token = signSession({ id: u.id, name: u.name, email: u.email, role: u.role });
      const res = NextResponse.json({ user: { id: u.id, name: u.name, email: u.email, role: u.role } });
      res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
      return res;
    }
  } catch (e) {
    console.error("auth", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
