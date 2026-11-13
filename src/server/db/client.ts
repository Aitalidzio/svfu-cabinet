import "server-only";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import * as schema from "./schema";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

export type DatabaseConnection = {
  db: Database;
  kind: "postgres" | "pglite";
  close: () => Promise<void>;
};

export const PGLITE_DIR = ".data/pglite";

/**
 * DATABASE_URL set   → real PostgreSQL (production, scales to many users and app instances).
 * DATABASE_URL empty → PGlite: the same PostgreSQL compiled to WebAssembly, stored on disk.
 *                      Lets anyone run the project locally without installing a database.
 */
export function connectDatabase(): DatabaseConnection {
  const url = process.env.DATABASE_URL;

  if (url) {
    const pool = new Pool({ connectionString: url, max: 10 });
    return {
      db: drizzlePg(pool, { schema }) as unknown as Database,
      kind: "postgres",
      close: () => pool.end(),
    };
  }

  // PGlite creates its own folder but not missing parents.
  mkdirSync(dirname(PGLITE_DIR), { recursive: true });
  const client = new PGlite(PGLITE_DIR);
  return {
    db: drizzlePglite(client, { schema }) as unknown as Database,
    kind: "pglite",
    close: () => client.close(),
  };
}
