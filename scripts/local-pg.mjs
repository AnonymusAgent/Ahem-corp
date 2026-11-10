// Local development database: PGlite (WASM Postgres) exposed on a TCP socket
// so the app's `pg` Pool can connect to it like any other Postgres.
// Usage: node scripts/local-pg.mjs  (listens on 127.0.0.1:5433)
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const db = await PGlite.create();
const server = new PGLiteSocketServer({ db, host: "127.0.0.1", port: Number(process.env.PG_PORT || 5433), maxConnections: 16 });
await server.start();
console.log(`[local-pg] listening on 127.0.0.1:${process.env.PG_PORT || 5433}`);
