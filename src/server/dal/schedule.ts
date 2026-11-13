import "server-only";
import { and, asc, eq, gte, inArray, lte, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { io } from "next/cache";
import {
  addDays,
  dayOfWeek,
  inSemester,
  PAIR_TIMES,
  toMinutes,
  weekParity,
  yakutskNow,
  type ISODate,
} from "@/lib/calendar";
import { db } from "@/server/db";
import { institutes, lessonChanges, lessons, studyGroups, subjects, teachers } from "@/server/db/schema";
import { requireUser } from "./user";

export type LessonKind = "lecture" | "practice" | "lab";

/** One class as the student sees it on a given day. */
export type ScheduleItem = {
  key: string;
  pairNumber: number;
  start: string;
  end: string;
  subject: string;
  kind: LessonKind;
  room: string;
  teacher: string;
  isNow: boolean;
  status: "regular" | "cancelled" | "movedAway" | "movedHere" | "modified";
  /** «было» for modified classes; where it went / came from for moves. */
  change?: {
    reason: string | null;
    previousRoom?: string;
    previousTeacher?: string;
    to?: { date: ISODate; pairNumber: number; room: string };
    from?: { date: ISODate; pairNumber: number };
  };
};

export type ScheduleDay = { date: ISODate; isToday: boolean; inSemester: boolean; hasChanges: boolean; items: ScheduleItem[] };

export type GroupOption = { code: string; instituteCode: string };

export type Schedule = {
  group: { code: string; programName: string; course: number; instituteCode: string };
  isOwnGroup: boolean;
  /** Students have a group of their own; staff do not. */
  ownGroupCode: string | null;
  groups: GroupOption[];
  today: ISODate;
  days: ScheduleDay[];
};

/**
 * The timetable of one group for a range of days, with changes applied.
 * Group timetables are not personal data — like the paper timetable on the wall, any signed-in
 * user may open any group (the student's own group is the default), but only when signed in.
 */
export async function getSchedule(options: { groupCode?: string; from: ISODate; days: number }): Promise<Schedule> {
  const user = await requireUser();
  const database = await db();

  const allGroups = await database
    .select({ id: studyGroups.id, code: studyGroups.code, programName: studyGroups.programName, course: studyGroups.course, instituteCode: institutes.code })
    .from(studyGroups)
    .innerJoin(institutes, eq(studyGroups.instituteId, institutes.id))
    .orderBy(asc(institutes.code), asc(studyGroups.code));

  const ownGroup = user.group ? allGroups.find((g) => g.code === user.group!.code) : undefined;
  const fallback = ownGroup ?? allGroups.find((g) => g.instituteCode === user.institute.code) ?? allGroups[0];
  const group = allGroups.find((g) => g.code === options.groupCode) ?? fallback;

  await io(); // reading the clock: request time only
  const now = yakutskNow(new Date());

  const dates = Array.from({ length: options.days }, (_, i) => addDays(options.from, i));
  const to = dates[dates.length - 1];

  const regular = await database
    .select({
      id: lessons.id,
      dayOfWeek: lessons.dayOfWeek,
      pairNumber: lessons.pairNumber,
      weekParity: lessons.weekParity,
      room: lessons.room,
      kind: lessons.kind,
      subject: subjects.name,
      teacher: teachers.fullName,
    })
    .from(lessons)
    .innerJoin(subjects, eq(lessons.subjectId, subjects.id))
    .innerJoin(teachers, eq(lessons.teacherId, teachers.id))
    .where(eq(lessons.groupId, group.id));

  const newTeacher = alias(teachers, "new_teacher");
  const changes = regular.length
    ? await database
        .select({
          lessonId: lessonChanges.lessonId,
          date: lessonChanges.date,
          kind: lessonChanges.kind,
          newDate: lessonChanges.newDate,
          newPairNumber: lessonChanges.newPairNumber,
          newRoom: lessonChanges.newRoom,
          newTeacher: newTeacher.fullName,
          reason: lessonChanges.reason,
        })
        .from(lessonChanges)
        .leftJoin(newTeacher, eq(lessonChanges.newTeacherId, newTeacher.id))
        .where(
          and(
            inArray(lessonChanges.lessonId, regular.map((l) => l.id)),
            or(
              and(gte(lessonChanges.date, options.from), lte(lessonChanges.date, to)),
              and(gte(lessonChanges.newDate, options.from), lte(lessonChanges.newDate, to)),
            ),
          ),
        )
    : [];

  const lessonById = new Map(regular.map((l) => [l.id, l]));
  const timing = (date: ISODate, pairNumber: number) => {
    const t = PAIR_TIMES[pairNumber];
    const isNow = date === now.date && now.minutes >= toMinutes(t.start) && now.minutes < toMinutes(t.end);
    return { start: t.start, end: t.end, isNow };
  };

  const days: ScheduleDay[] = dates.map((date) => {
    const active = inSemester(date);
    const items: ScheduleItem[] = [];

    if (active) {
      const parity = weekParity(date);
      for (const l of regular) {
        if (l.dayOfWeek !== dayOfWeek(date) || (l.weekParity !== "every" && l.weekParity !== parity)) continue;
        const change = changes.find((c) => c.lessonId === l.id && c.date === date);
        const base = { pairNumber: l.pairNumber, ...timing(date, l.pairNumber), subject: l.subject, kind: l.kind, room: l.room, teacher: l.teacher };

        if (!change) {
          items.push({ key: `${l.id}-${date}`, ...base, status: "regular" });
        } else if (change.kind === "cancelled") {
          items.push({ key: `${l.id}-${date}`, ...base, isNow: false, status: "cancelled", change: { reason: change.reason } });
        } else if (change.kind === "moved") {
          items.push({
            key: `${l.id}-${date}`,
            ...base,
            isNow: false,
            status: "movedAway",
            change: {
              reason: change.reason,
              to: { date: change.newDate ?? date, pairNumber: change.newPairNumber ?? l.pairNumber, room: change.newRoom ?? l.room },
            },
          });
        } else {
          items.push({
            key: `${l.id}-${date}`,
            ...base,
            room: change.newRoom ?? l.room,
            teacher: change.newTeacher ?? l.teacher,
            status: "modified",
            change: {
              reason: change.reason,
              previousRoom: change.newRoom ? l.room : undefined,
              previousTeacher: change.newTeacher ? l.teacher : undefined,
            },
          });
        }
      }
    }

    // Classes moved INTO this day from another date or pair.
    for (const c of changes) {
      if (c.kind !== "moved" || c.newDate !== date) continue;
      const l = lessonById.get(c.lessonId);
      if (!l) continue;
      const pairNumber = c.newPairNumber ?? l.pairNumber;
      items.push({
        key: `${l.id}-${c.date}-to-${date}`,
        pairNumber,
        ...timing(date, pairNumber),
        subject: l.subject,
        kind: l.kind,
        room: c.newRoom ?? l.room,
        teacher: l.teacher,
        status: "movedHere",
        change: { reason: c.reason, from: { date: c.date, pairNumber: l.pairNumber } },
      });
    }

    items.sort((a, b) => a.pairNumber - b.pairNumber || (a.status === "movedAway" ? -1 : 1));
    return { date, isToday: date === now.date, inSemester: active, hasChanges: items.some((i) => i.status !== "regular"), items };
  });

  return {
    group: { code: group.code, programName: group.programName, course: group.course, instituteCode: group.instituteCode },
    isOwnGroup: group.code === user.group?.code,
    ownGroupCode: ownGroup?.code ?? null,
    groups: allGroups.map(({ code, instituteCode }) => ({ code, instituteCode })),
    today: now.date,
    days,
  };
}

/** «Today» in Yakutsk, for pages that need it before loading the schedule. */
export async function getToday(): Promise<ISODate> {
  await io();
  return yakutskNow(new Date()).date;
}
