import { getDb } from "@/db";
import { isDatabaseConfigured } from "@/lib/database";
import { sql } from "drizzle-orm";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  // Health must NEVER fail just because the DB is unconfigured (demo mode).
  if (!isDatabaseConfigured()) {
    return Response.json({ ok: true, databaseConfigured: false, mode: "demo" });
  }
  try {
    const db = getDb();
    if (!db) return Response.json({ ok: true, databaseConfigured: false, mode: "demo" });
    await db.execute(sql`select 1`);
    await db.select({ id: products.id }).from(products).limit(1);
    return Response.json({ ok: true, databaseConfigured: true, mode: "database" });
  } catch {
    return Response.json({ ok: true, databaseConfigured: false, mode: "demo" });
  }
}
