import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/server/db";
import { sessions } from "@/server/db/schema";
import { SESSION_COOKIE } from "./cookie";

const SESSION_DAYS = 7;

// The database keeps only a hash of the token: a leaked sessions table cannot be used to log in.
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await (await db()).insert(sessions).values({ id: hashToken(token), userId, expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from JavaScript in the browser
    secure: process.env.NODE_ENV === "production", // HTTPS only on the real site
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** The user id of a valid, unexpired session, or null. */
export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [row] = await (await db())
    .select({ userId: sessions.userId })
    .from(sessions)
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, sql`now()`)))
    .limit(1);

  return row?.userId ?? null;
}

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) await (await db()).delete(sessions).where(eq(sessions.id, hashToken(token)));
  cookieStore.delete(SESSION_COOKIE);
}

/** «Выйти на всех устройствах»: removes every session of the user. */
export async function deleteAllSessions(userId: string): Promise<void> {
  await (await db()).delete(sessions).where(eq(sessions.userId, userId));
  (await cookies()).delete(SESSION_COOKIE);
}
