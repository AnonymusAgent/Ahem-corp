import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "@/db";

const g = globalThis as typeof globalThis & { __ahemDbReady?: Promise<void> };

/**
 * Makes a fresh database usable without manual steps:
 *  1. if the schema is missing, apply the SQL migrations in ./drizzle
 *  2. if the database is empty, insert the initial admin user and sample content
 * Both steps are idempotent and run once per server process.
 */
export function ensureDb(): Promise<void> {
  if (!g.__ahemDbReady) {
    g.__ahemDbReady = (async () => {
      const res = await db.execute(sql`select to_regclass('public.settings') as present`);
      if (!res.rows[0]?.present) {
        const { migrate } = await import("drizzle-orm/node-postgres/migrator");
        await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
        console.log("[bootstrap] database schema created from migrations");
      }
      const { seedIfEmpty } = await import("./seed");
      await seedIfEmpty();
    })().catch((e) => {
      console.error("[bootstrap] database initialisation failed", e);
      g.__ahemDbReady = undefined;
    });
  }
  return g.__ahemDbReady;
}
