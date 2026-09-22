/**
 * Lazy, optional Drizzle client.
 * Importing this module NEVER throws, even when DATABASE_URL is missing.
 * Use `getDb()` / `isDatabaseConfigured()` before querying.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { isDatabaseConfigured } from "@/lib/database";

type DbType = ReturnType<typeof drizzle>;

const globalForDb = globalThis as typeof globalThis & {
  __nycPool?: Pool;
  __nycDb?: DbType;
};

function createPool(): Pool | null {
  if (!isDatabaseConfigured()) return null;
  if (globalForDb.__nycPool) return globalForDb.__nycPool;
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    pool.on("error", () => {
      // Swallow idle-client errors in demo mode; live mode logs via route handlers.
    });
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__nycPool = pool;
    } else {
      globalForDb.__nycPool = pool;
    }
    return pool;
  } catch {
    return null;
  }
}

/** Returns the Drizzle client, or null when DATABASE_URL is missing. Never throws. */
export function getDb(): DbType | null {
  if (!isDatabaseConfigured()) return null;
  if (globalForDb.__nycDb) return globalForDb.__nycDb;
  const pool = createPool();
  if (!pool) return null;
  try {
    const db = drizzle(pool);
    globalForDb.__nycDb = db;
    return db;
  } catch {
    return null;
  }
}

/** Returns the pg Pool, or null when DATABASE_URL is missing. Never throws. */
export function getPool(): Pool | null {
  return createPool();
}

/**
 * Legacy `db` export kept for backwards compatibility.
 * It is a lazy Proxy: property access only initializes when DATABASE_URL exists.
 * If accessed without configuration it throws a clear, catchable error
 * (route handlers should prefer `getDb()` and demo fallbacks instead).
 */
export const db: DbType = new Proxy({} as DbType, {
  get(_target, prop) {
    const real = getDb();
    if (!real) {
      throw new Error("DATABASE_URL is not configured. Database is optional — use demo fallback.");
    }
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? (value as Function).bind(real) : value;
  },
});

export { isDatabaseConfigured };
export const pool: Pool | null = null; // kept for type-compat; use getPool() instead
