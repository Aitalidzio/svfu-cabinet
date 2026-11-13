/**
 * npm run db:setup  — apply migrations and, if the database is empty, add the demo data.
 * npm run db:reset  — local PGlite only: delete the database folder and set it up again.
 *
 * Stop `npm run dev` first when using PGlite: it allows one process at a time.
 */
import { randomBytes } from "node:crypto";
import { rmSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import { count } from "drizzle-orm";
import { migrate as migratePostgres } from "drizzle-orm/node-postgres/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { hashPassword } from "@/server/auth/password";
import { connectDatabase, PGLITE_DIR } from "@/server/db/client";
import { institutes, studyGroups, users } from "@/server/db/schema";
import { seedGroups, seedInstitutes, seedUsers } from "./seed-data";

loadEnvConfig(process.cwd());

async function main() {
  if (process.argv.includes("--reset")) {
    if (process.env.DATABASE_URL) {
      throw new Error("--reset works only with the local PGlite database, not with DATABASE_URL.");
    }
    rmSync(PGLITE_DIR, { recursive: true, force: true });
    console.log(`Удалена локальная база ${PGLITE_DIR}`);
  }

  const connection = connectDatabase();
  const { db } = connection;
  console.log(`База: ${connection.kind === "postgres" ? "PostgreSQL (DATABASE_URL)" : `PGlite (${PGLITE_DIR})`}`);

  const migrationsFolder = "drizzle";
  if (connection.kind === "pglite") {
    await migratePglite(db as unknown as PgliteDatabase, { migrationsFolder });
  } else {
    await migratePostgres(db as unknown as NodePgDatabase, { migrationsFolder });
  }
  console.log("Миграции применены.");

  const [{ n: existingUsers }] = await db.select({ n: count() }).from(users);
  if (existingUsers > 0) {
    console.log(`Пользователи уже есть (${existingUsers}), демо-данные не добавляю.`);
    await connection.close();
    return;
  }

  const password = process.env.SEED_DEMO_PASSWORD || randomBytes(9).toString("base64url");
  // A separate hash per user: each gets its own random salt, so equal passwords still look different in the table.
  const passwordHashes = await Promise.all(seedUsers.map(() => hashPassword(password)));

  await db.transaction(async (tx) => {
    const instituteRows = await tx.insert(institutes).values([...seedInstitutes]).returning();
    const instituteId = new Map(instituteRows.map((row) => [row.code, row.id]));

    const groupRows = await tx
      .insert(studyGroups)
      .values(
        seedGroups.map(({ institute, ...group }) => ({ ...group, instituteId: instituteId.get(institute)! })),
      )
      .returning();
    const groupId = new Map(groupRows.map((row) => [row.code, row.id]));

    await tx.insert(users).values(
      seedUsers.map(({ institute, group, ...user }, index) => ({
        ...user,
        passwordHash: passwordHashes[index],
        instituteId: instituteId.get(institute)!,
        groupId: group ? groupId.get(group)! : null,
      })),
    );
  });

  console.log("\nДемо-аккаунты:");
  console.table(seedUsers.map(({ login, role, fullName }) => ({ login, role, fullName })));
  console.log(
    process.env.SEED_DEMO_PASSWORD
      ? "Пароль у всех — значение SEED_DEMO_PASSWORD из .env.local."
      : `Пароль у всех (сгенерирован, сохраните его): ${password}`,
  );

  await connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
