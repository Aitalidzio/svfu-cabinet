import "server-only";
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// scrypt is a deliberately slow, memory-hard hash built into Node.js:
// guessing passwords from a leaked database costs ~32 MB of RAM and tens of milliseconds per try.
const PARAMS = { N: 2 ** 15, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

function scryptAsync(password: string, salt: Buffer, keyLength: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, keyLength, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** Returns `scrypt$N$r$p$salt$hash` — a random salt per password, so equal passwords get different hashes. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH, { ...PARAMS, maxmem: MAX_MEMORY });
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, n, r, p, salt, hash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "base64");
  const actual = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: MAX_MEMORY,
  });
  // Constant-time comparison: response time does not reveal how many bytes matched.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;

/**
 * When the login does not exist we still spend the same time on a hash check,
 * so an attacker cannot tell «no such user» from «wrong password» by timing.
 */
export async function burnPasswordCheck(password: string): Promise<void> {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  await verifyPassword(password, await dummyHash);
}
