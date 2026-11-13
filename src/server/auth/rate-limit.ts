import "server-only";
import { and, count, eq, gt, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { loginAttempts } from "@/server/db/schema";

// Kept in the database (not in memory) so the limit holds across several app instances.
const WINDOW = sql`now() - interval '15 minutes'`;
const MAX_FAILURES_PER_LOGIN = 5;
const MAX_FAILURES_PER_IP = 20;
export const UNKNOWN_IP = "unknown";

export async function isLoginThrottled(login: string, ip: string): Promise<boolean> {
  const database = await db();
  const recentFailures = and(eq(loginAttempts.success, false), gt(loginAttempts.createdAt, WINDOW));

  const [byLogin] = await database
    .select({ n: count() })
    .from(loginAttempts)
    .where(and(recentFailures, eq(loginAttempts.login, login)));
  if (byLogin.n >= MAX_FAILURES_PER_LOGIN) return true;

  // Without a real client IP every visitor would share the same «unknown» bucket,
  // and one attacker could lock everybody out — so the per-IP limit applies only to known IPs.
  if (ip === UNKNOWN_IP) return false;

  const [byIp] = await database
    .select({ n: count() })
    .from(loginAttempts)
    .where(and(recentFailures, eq(loginAttempts.ip, ip)));
  return byIp.n >= MAX_FAILURES_PER_IP;
}

export async function recordLoginAttempt(login: string, ip: string, success: boolean): Promise<void> {
  await (await db()).insert(loginAttempts).values({ login, ip, success });
}
