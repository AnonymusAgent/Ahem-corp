import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

// The pool is created without throwing at import time so that `next build`
// and the public marketing pages can load even when DATABASE_URL is missing
// or the database is briefly unavailable. Public read models in
// `src/lib/data.ts` degrade to empty results in that case; admin routes
// still require a working database and will surface the connection error.
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
