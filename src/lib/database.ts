/**
 * DATABASE ISOLATION LAYER
 * -----------------------
 * PostgreSQL/Drizzle is OPTIONAL for this project.
 *
 * - `isDatabaseConfigured()` returns true only when DATABASE_URL is set.
 * - All DB access must go through `getDb()` which returns null when unconfigured.
 * - API routes must return a controlled demo response when DB is missing
 *   instead of throwing.
 * - To reconnect PostgreSQL later: set DATABASE_URL and everything
 *   automatically switches back to live DB mode (demo fallbacks are bypassed).
 *
 * Production safety: on Vercel, localhost / 127.0.0.1 URLs are NEVER used
 * (they would point nowhere — no local Postgres exists there). Such values are
 * treated as unconfigured so the app cleanly runs in demo mode instead of
 * crashing or hanging. Local/sandbox previews with a real local Postgres
 * keep working normally.
 */

export function isDatabaseConfigured(): boolean {
  const url = (process.env.DATABASE_URL ?? "").trim();
  if (!url) return false;
  if (url.includes("localhost-fake")) return false;
  if (process.env.VERCEL) {
    const lower = url.toLowerCase();
    if (lower.includes("localhost") || lower.includes("127.0.0.1")) return false;
  }
  return true;
}

export function databaseUnavailableResponse(extra: Record<string, unknown> = {}) {
  return {
    databaseConfigured: false,
    message: "Database is not configured yet.",
    demo: true,
    ...extra,
  };
}
