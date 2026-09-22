import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { isDatabaseConfigured, databaseUnavailableResponse } from "@/lib/database";
import { reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { demoReviews } from "@/lib/demo-catalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const pid = Number(req.nextUrl.searchParams.get("productId"));
  if (!pid) return NextResponse.json({ reviews: [] });
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      reviews: demoReviews().filter((r) => r.productId === pid || pid <= 3),
      ...databaseUnavailableResponse(),
    });
  }
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db.select().from(reviews).where(eq(reviews.productId, pid)).limit(20);
    return NextResponse.json({ reviews: rows, databaseConfigured: true });
  } catch {
    return NextResponse.json({ reviews: demoReviews(), ...databaseUnavailableResponse() });
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    // Demo mode: acknowledge so the review form stays functional.
    return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
  }
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
    const { productId, userName, rating, title, comment } = await req.json();
    if (!productId || !userName || !rating) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await db.insert(reviews).values({ productId, userName, rating: Math.min(5, Math.max(1, rating)), title: title ?? null, comment: comment ?? null });
    return NextResponse.json({ ok: true, databaseConfigured: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
