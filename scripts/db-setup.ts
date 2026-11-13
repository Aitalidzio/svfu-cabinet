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
import { BRS, markFor } from "@/lib/brs";
import { addDays } from "@/lib/calendar";
import { hashPassword } from "@/server/auth/password";
import type { PgTable } from "drizzle-orm/pg-core";
import { connectDatabase, PGLITE_DIR, type Database } from "@/server/db/client";
import {
  announcements,
  assessmentResults,
  assessments,
  disciplines,
  institutes,
  lessonChanges,
  lessons,
  studyGroups,
  subjects,
  recordBook,
  notifications,
  requestEvents,
  requests,
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
import { seedAnnouncements } from "./seed-announcements";
import { seedNotifications } from "./seed-notifications";
import { seedRequests } from "./seed-requests";
import { GRADED_UNTIL, seedDisciplines, seedPlans, seedRecordBook, seedTermPoints, splitPoints } from "./seed-grades";

loadEnvConfig(process.cwd());

async function isEmpty(db: Database, table: PgTable) {
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

async function seedGrades(db: Database) {
  await db.transaction(async (tx) => {
    const names = new Set([
      ...Object.values(seedDisciplines).flatMap((g) => g.list.map((d) => d.subject)),
      ...Object.values(seedRecordBook).flatMap((rows) => rows.map((r) => r[1])),
    ]);
    await tx.insert(subjects).values([...names].map((name) => ({ name }))).onConflictDoNothing();
    const subjectId = new Map((await tx.select().from(subjects)).map((s) => [s.name, s.id]));
    const teacherId = new Map((await tx.select().from(teachers)).map((t) => [t.fullName, t.id]));
    const groupId = new Map((await tx.select().from(studyGroups)).map((g) => [g.code, g.id]));
    const students = await tx.select({ id: users.id, login: users.login, groupId: users.groupId }).from(users);

    let assessmentCount = 0;
    let resultCount = 0;
    for (const [groupCode, { semester, list }] of Object.entries(seedDisciplines)) {
      const groupStudents = students.filter((s) => s.groupId === groupId.get(groupCode));
      for (const d of list) {
        const [discipline] = await tx
          .insert(disciplines)
          .values({
            groupId: groupId.get(groupCode)!,
            subjectId: subjectId.get(d.subject)!,
            teacherId: teacherId.get(d.teacher)!,
            semester,
            controlType: d.type,
            sessionDate: d.sessionDate,
            sessionRoom: d.sessionRoom,
          })
          .returning();
        const planned = await tx
          .insert(assessments)
          .values(seedPlans[d.plan].map((p) => ({ disciplineId: discipline.id, title: p.title, kind: p.kind, maxPoints: p.max, dueDate: p.due })))
          .returning();
        assessmentCount += planned.length;

        const graded = planned.filter((a) => a.dueDate <= GRADED_UNTIL);
        for (const student of groupStudents) {
          const total = seedTermPoints[student.login]?.[d.subject];
          if (total === undefined) continue;
          const parts = splitPoints(total, graded.map((a) => a.maxPoints));
          await tx.insert(assessmentResults).values(graded.map((a, i) => ({ assessmentId: a.id, studentId: student.id, points: parts[i] })));
          resultCount += graded.length;
        }
      }
    }

    const records = Object.entries(seedRecordBook).flatMap(([login, rows]) => {
      const student = students.find((s) => s.login === login)!;
      return rows.map(([semester, subject, type, points]) => ({
        studentId: student.id,
        subjectId: subjectId.get(subject)!,
        semester,
        controlType: type,
        points,
        mark: type === "credit" ? null : markFor(points),
        passed: type === "credit" ? points >= BRS.creditPass : markFor(points) >= 3,
      }));
    });
    await tx.insert(recordBook).values(records);

    console.log(`Успеваемость: ${assessmentCount} контрольных, ${resultCount} оценок, ${records.length} записей в зачётках.`);
  });
}

async function seedRequestsSection(db: Database) {
  await db.transaction(async (tx) => {
    const people = await tx
      .select({ id: users.id, login: users.login, role: users.role, instituteId: users.instituteId })
      .from(users);
    let events = 0;
    for (const r of seedRequests) {
      const student = people.find((u) => u.login === r.login)!;
      // Status changes are made by the dean's office of the student's own institute (if it has a demo account).
      const staff = people.find((u) => u.role === "staff" && u.instituteId === student.instituteId);
      const last = r.events[r.events.length - 1];
      const [request] = await tx
        .insert(requests)
        .values({
          studentId: student.id,
          type: r.type,
          status: last.status,
          details: r.details,
          comment: r.comment,
          dueDate: r.dueDate,
          rejectionReason: r.rejectionReason ?? null,
          createdAt: new Date(r.events[0].at),
          updatedAt: new Date(last.at),
        })
        .returning({ id: requests.id });
      await tx.insert(requestEvents).values(
        r.events.map((e) => ({
          requestId: request.id,
          status: e.status,
          note: e.note ?? (e.status === "rejected" ? r.rejectionReason ?? null : null),
          actorId: e.by === "student" ? student.id : (staff?.id ?? null),
          createdAt: new Date(e.at),
        })),
      );
      events += r.events.length;
    }
    console.log(`Заявки: ${seedRequests.length} заявок, ${events} событий в истории.`);
  });
}

async function seedNotificationsSection(db: Database) {
  await db.transaction(async (tx) => {
    const people = await tx.select({ id: users.id, login: users.login }).from(users);
    await tx.insert(notifications).values(
      seedNotifications.map((n) => {
        const user = people.find((u) => u.login === n.login)!;
        return {
          userId: user.id,
          category: n.category,
          title: n.title,
          body: n.body,
          href: n.href,
          createdAt: new Date(n.at),
          readAt: n.read ? new Date(n.at) : null,
        };
      }),
    );
    const unread = seedNotifications.filter((n) => !n.read).length;
    console.log(`Уведомления: ${seedNotifications.length} шт., из них непрочитанных в сиде: ${unread}.`);
  });
}

async function seedAnnouncementsSection(db: Database) {
  await db.transaction(async (tx) => {
    const people = await tx
      .select({ id: users.id, login: users.login, instituteId: users.instituteId })
      .from(users);
    const groups = await tx.select({ id: studyGroups.id, code: studyGroups.code }).from(studyGroups);
    await tx.insert(announcements).values(
      seedAnnouncements.map((a) => {
        const author = people.find((u) => u.login === a.authorLogin)!;
        return {
          instituteId: author.instituteId,
          authorId: author.id,
          title: a.title,
          body: a.body,
          audience: a.audience,
          course: a.course ?? null,
          groupId: a.groupCode ? (groups.find((g) => g.code === a.groupCode)?.id ?? null) : null,
          createdAt: new Date(a.at),
        };
      }),
    );
    console.log(`Объявления: ${seedAnnouncements.length} шт.`);
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

  if (await isEmpty(db, disciplines)) await seedGrades(db);
  else console.log("Успеваемость уже есть — пропускаю.");

  if (await isEmpty(db, requests)) await seedRequestsSection(db);
  else console.log("Заявки уже есть — пропускаю.");

  if (await isEmpty(db, notifications)) await seedNotificationsSection(db);
  else console.log("Уведомления уже есть — пропускаю.");

  if (await isEmpty(db, announcements)) await seedAnnouncementsSection(db);
  else console.log("Объявления уже есть — пропускаю.");

  await connection.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
