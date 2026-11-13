import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { dayOfWeek, inSemester, isISODate, weekParity, type ISODate } from "@/lib/calendar";
import { db } from "@/server/db";
import { lessonChanges, lessons, studyGroups, subjects, teachers, users } from "@/server/db/schema";
import { requireUser } from "./user";

export type ChangeLessonOption = {
  lessonId: number;
  pairNumber: number;
  subject: string;
  teacher: string;
  room: string;
  kind: "lecture" | "practice" | "lab";
};

export type TeacherOption = { id: number; fullName: string };

/**
 * Regular lessons of an institute group that fall on the given date
 * (weekday + odd/even week). Only for staff of that institute.
 */
export async function getLessonsForChange(groupCode: string, date: string): Promise<ChangeLessonOption[]> {
  const user = await requireUser();
  if (user.role !== "staff" || !isISODate(date) || !inSemester(date)) return [];

  const database = await db();
  const [group] = await database
    .select({ id: studyGroups.id })
    .from(studyGroups)
    .where(and(eq(studyGroups.code, groupCode), eq(studyGroups.instituteId, user.institute.id)))
    .limit(1);
  if (!group) return [];

  const dow = dayOfWeek(date);
  const parity = weekParity(date);
  const rows = await database
    .select({
      lessonId: lessons.id,
      pairNumber: lessons.pairNumber,
      weekParity: lessons.weekParity,
      subject: subjects.name,
      teacher: teachers.fullName,
      room: lessons.room,
      kind: lessons.kind,
    })
    .from(lessons)
    .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
    .innerJoin(teachers, eq(lessons.teacherId, teachers.id))
    .where(and(eq(lessons.groupId, group.id), eq(lessons.dayOfWeek, dow)))
    .orderBy(asc(lessons.pairNumber));

  return rows
    .filter((l) => l.weekParity === "every" || l.weekParity === parity)
    .map(({ lessonId, pairNumber, subject, teacher, room, kind }) => ({
      lessonId,
      pairNumber,
      subject,
      teacher,
      room,
      kind,
    }));
}

export async function getTeacherOptions(): Promise<TeacherOption[]> {
  const user = await requireUser();
  if (user.role !== "staff") return [];
  return (await db()).select({ id: teachers.id, fullName: teachers.fullName }).from(teachers).orderBy(asc(teachers.fullName));
}

/** Student ids of a group — only if the group belongs to the staff member's institute. */
export async function getGroupStudentIds(groupId: number): Promise<string[]> {
  const user = await requireUser();
  if (user.role !== "staff") return [];

  const database = await db();
  const [group] = await database
    .select({ id: studyGroups.id })
    .from(studyGroups)
    .where(and(eq(studyGroups.id, groupId), eq(studyGroups.instituteId, user.institute.id)))
    .limit(1);
  if (!group) return [];

  const rows = await database
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.groupId, group.id), eq(users.role, "student")));
  return rows.map((r) => r.id);
}

export type CreateLessonChangeInput = {
  lessonId: number;
  date: ISODate;
  kind: "cancelled" | "moved" | "modified";
  newDate?: ISODate | null;
  newPairNumber?: number | null;
  newRoom?: string | null;
  newTeacherId?: number | null;
  reason?: string | null;
};

/**
 * Inserts a one-off change for a lesson of the staff member's institute.
 * Returns the group code and student ids for notifications, or null if not allowed.
 */
export async function createLessonChangeForStaff(
  input: CreateLessonChangeInput,
): Promise<{ groupCode: string; studentIds: string[]; subject: string } | null> {
  const user = await requireUser();
  if (user.role !== "staff") return null;

  const database = await db();
  const [lesson] = await database
    .select({
      id: lessons.id,
      groupId: lessons.groupId,
      groupCode: studyGroups.code,
      instituteId: studyGroups.instituteId,
      subject: subjects.name,
    })
    .from(lessons)
    .innerJoin(studyGroups, eq(lessons.groupId, studyGroups.id))
    .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
    .where(eq(lessons.id, input.lessonId))
    .limit(1);

  if (!lesson || lesson.instituteId !== user.institute.id) return null;

  await database
    .insert(lessonChanges)
    .values({
      lessonId: input.lessonId,
      date: input.date,
      kind: input.kind,
      newDate: input.kind === "moved" ? (input.newDate ?? null) : null,
      newPairNumber: input.kind === "moved" ? (input.newPairNumber ?? null) : null,
      newRoom: input.kind !== "cancelled" ? (input.newRoom ?? null) : null,
      newTeacherId: input.kind === "modified" ? (input.newTeacherId ?? null) : null,
      reason: input.reason ?? null,
      createdBy: user.id,
    })
    .onConflictDoUpdate({
      target: [lessonChanges.lessonId, lessonChanges.date],
      set: {
        kind: input.kind,
        newDate: input.kind === "moved" ? (input.newDate ?? null) : null,
        newPairNumber: input.kind === "moved" ? (input.newPairNumber ?? null) : null,
        newRoom: input.kind !== "cancelled" ? (input.newRoom ?? null) : null,
        newTeacherId: input.kind === "modified" ? (input.newTeacherId ?? null) : null,
        reason: input.reason ?? null,
        createdBy: user.id,
      },
    });

  const studentIds = await getGroupStudentIds(lesson.groupId);
  return { groupCode: lesson.groupCode, studentIds, subject: lesson.subject };
}
