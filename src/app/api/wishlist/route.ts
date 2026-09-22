import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { isDatabaseConfigured, databaseUnavailableResponse } from "@/lib/database";
import { wishlistItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

function sessionUser(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? verifySession(token) : null;
}

export async function GET(req: NextRequest) {
  // Demo mode: wishlist lives in localStorage; server sync is a no-op.
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ids: [], ...databaseUnavailableResponse() });
  }
  const u = sessionUser(req);
  if (!u) return NextResponse.json({ ids: [] });
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ ids: [], ...databaseUnavailableResponse() });
    const rows = await db.select().from(wishlistItems).where(eq(wishlistItems.userId, u.id));
    return NextResponse.json({ ids: rows.map((r) => r.productId), databaseConfigured: true });
  } catch {
    return NextResponse.json({ ids: [], ...databaseUnavailableResponse() });
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    // Client keeps wishlist in localStorage; acknowledge so UI stays functional.
    return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
  }
  const u = sessionUser(req);
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
    const existing = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, u.id), eq(wishlistItems.productId, productId)))
      .limit(1);
    if (!existing.length) await db.insert(wishlistItems).values({ userId: u.id, productId });
    return NextResponse.json({ ok: true, databaseConfigured: true });
  } catch {
    return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
  }
  const u = sessionUser(req);
  if (!u) return NextResponse.json({ error: "Login required" }, { status: 401 });
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
    const { productId } = await req.json();
    await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, u.id), eq(wishlistItems.productId, productId)));
    return NextResponse.json({ ok: true, databaseConfigured: true });
  } catch {
    return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
  }
}
