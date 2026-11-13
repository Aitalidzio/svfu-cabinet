import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { burnPasswordCheck, verifyPassword } from "./password";
import { isLoginThrottled, recordLoginAttempt } from "./rate-limit";

export type AuthResult = { ok: true; userId: string } | { ok: false; reason: "invalid" | "throttled" };

/**
 * Checks a login/password pair. «No such login» and «wrong password» return the same
 * `invalid` reason and take the same time, so the form never reveals which logins exist.
 */
export async function authenticate(login: string, password: string, ip: string): Promise<AuthResult> {
  if (await isLoginThrottled(login, ip)) return { ok: false, reason: "throttled" };

  const [user] = await (await db())
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.login, login))
    .limit(1);

  let valid = false;
  if (user) {
    valid = await verifyPassword(password, user.passwordHash);
  } else {
    await burnPasswordCheck(password);
  }

  await recordLoginAttempt(login, ip, valid);
  return valid && user ? { ok: true, userId: user.id } : { ok: false, reason: "invalid" };
}
