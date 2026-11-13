/**
 * npm run db:setup  — apply migrations and fill every empty section with demo data.
 * npm run db:reset  — local PGlite only: delete the database folder and set it up again.
 *
 * Each section (accounts, schedule, …) is seeded only if its table is empty,
 * so the script can be re-run after every new stage without touching existing data.
 * Stop `npm run dev` first when using PGlite: it allows one process at a time.
 */
import { randomBytes } from "node:crypto";
import { rmSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import { count, eq } from "drizzle-orm";
import { migrate as migratePostgres } from "drizzle-orm/node-postgres/migrator";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { addDays } from "@/lib/calendar";
import { hashPassword } from "@/server/auth/password";
import { connectDatabase, PGLITE_DIR, type Database } from "@/server/db/client";
import {
  institutes,
  lessonChanges,
  lessons,
  studyGroups,
  subjects,
  teachers,
  users,
} from "@/server/db/schema";
import {
  seedChangeCycle,
  seedChangeWeeks,
  seedGroups,
  seedInstitutes,
  seedTeachers,
  seedTimetable,
  seedUsers,
} from "./seed-data";

loadEnvConfig(process.cwd());

async function isEmpty(db: Database, table: typeof users | typeof lessons) {
  const [{ n }] = await db.select({ n: count() }).from(table);
  return n === 0;
}

async function seedAccounts(db: Database) {
  const password = process.env.SEED_DEMO_PASSWORD || randomBytes(9).toString("base64url");
  // A separate hash per user: each gets its own random salt, so equal passwords still look different in the table.
  const passwordHashes = await Promise.all(seedUsers.map(() => hashPassword(password)));

  await db.transaction(async (tx) => {
    const instituteRows = await tx.insert(institutes).values([...seedInstitutes]).returning();
    const instituteId = new Map(instituteRows.map((row) => [row.code, row.id]));

    const groupRows = await tx
      .insert(studyGroups)
      .values(seedGroups.map(({ institute, ...group }) => ({ ...group, instituteId: instituteId.get(institute)! })))
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
}

async function seedSchedule(db: Database) {
  await db.transaction(async (tx) => {
    const teacherRows = await tx
      .insert(teachers)
      .values(seedTeachers.map((fullName) => ({ fullName })))
      .returning();
    const teacherId = new Map(teacherRows.map((row) => [row.fullName, row.id]));

    const subjectNames = [...new Set(Object.values(seedTimetable).flat().map((l) => l.subject))];
    const subjectRows = await tx
      .insert(subjects)
      .values(subjectNames.map((name) => ({ name })))
      .returning();
    const subjectId = new Map(subjectRows.map((row) => [row.name, row.id]));

    const lessonId = new Map<string, number>(); // "group|day|pair" → id (only for every-week classes)
    for (const [groupCode, timetable] of Object.entries(seedTimetable)) {
      const [group] = await tx.select({ id: studyGroups.id }).from(studyGroups).where(eq(studyGroups.code, groupCode));
      const rows = await tx
        .insert(lessons)
        .values(
          timetable.map((l) => ({
            groupId: group.id,
            subjectId: subjectId.get(l.subject)!,
            teacherId: teacherId.get(l.teacher)!,
            kind: l.kind,
            dayOfWeek: l.day,
            pairNumber: l.pair,
            weekParity: l.parity ?? "every",
            room: l.room,
          })),
        )
        .returning();
      rows
        .filter((row) => row.weekParity === "every")
        .forEach((row) => lessonId.set(`${groupCode}|${row.dayOfWeek}|${row.pairNumber}`, row.id));
    }

    const changes = [];
    for (let week = 0; week < seedChangeWeeks.count; week++) {
      const monday = addDays(seedChangeWeeks.firstMonday, week * 7);
      for (const c of seedChangeCycle[week % seedChangeCycle.length]) {
        changes.push({
          lessonId: lessonId.get(`${c.group}|${c.day}|${c.pair}`)!,
          date: addDays(monday, c.day - 1),
          kind: c.kind,
          newDate: c.toDay ? addDays(monday, c.toDay - 1) : null,
          newPairNumber: c.toPair ?? null,
          newRoom: c.toRoom ?? null,
          newTeacherId: c.toTeacher ? teacherId.get(c.toTeacher)! : null,
          reason: c.reason,
        });
      }
    }
    await tx.insert(lessonChanges).values(changes);

    console.log(
      `Расписание: ${teacherRows.length} преподавателей, ${subjectRows.length} дисциплин, ` +
        `${lessonId.size} регулярных пар (+ чередующиеся), ${changes.length} изменений.`,
    );
  });
}

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

  if (await isEmpty(db, users)) await seedAccounts(db);
  else console.log("Аккаунты уже есть — пропускаю.");

  if (await isEmpty(db, lessons)) await seedSchedule(db);
  else console.log("Расписание уже есть — пропускаю.");

  await connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
