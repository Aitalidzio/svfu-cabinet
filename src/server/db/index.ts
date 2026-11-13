import "server-only";
import { io } from "next/cache";
import { connectDatabase, type Database, type DatabaseConnection } from "./client";

const globalForDb = globalThis as typeof globalThis & { __cabinetDb?: DatabaseConnection };

/**
 * The shared database connection, opened on first use (one per server process).
 *
 * - Lazy: `next build` workers import this module but never query, so they must not open the database.
 * - `await io()`: PGlite runs Postgres inside this process, and SQL like `now()` reads the JavaScript
 *   clock. With Cache Components, Next.js must know a query is request-time I/O so it is never baked
 *   into a prerendered page. During a real request io() resolves immediately.
 */
export async function db(): Promise<Database> {
  await io();
  globalForDb.__cabinetDb ??= connectDatabase();
  return globalForDb.__cabinetDb.db;
}
