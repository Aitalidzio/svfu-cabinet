import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { assess, BRS, type Assessment, type ControlType, type Level } from "@/lib/brs";
import type { ISODate } from "@/lib/calendar";
import { db } from "@/server/db";
import { assessmentResults, assessments, disciplines, recordBook, studyGroups, subjects, teachers } from "@/server/db/schema";
import { getToday } from "./schedule";
import { requireUser } from "./user";

export type AssessmentItem = {
  id: number;
  title: string;
  dueDate: ISODate;
  maxPoints: number;
  points: number | null; // null — not graded yet
};

export type DisciplineGrades = {
  id: number;
  subject: string;
  teacher: string;
  controlType: ControlType;
  semesterMax: number;
  points: number;
  remaining: number; // points still possible from assessments without a grade
  sessionDate: ISODate | null;
  sessionRoom: string | null;
  assessment: Assessment;
  items: AssessmentItem[];
};

export type RecordEntry = { subject: string; controlType: ControlType; points: number; mark: number | null; passed: boolean };
export type RecordTerm = { semester: number; entries: RecordEntry[]; average: number | null; scholarship: boolean };

export type Grades =
  | { kind: "noGroup" }
  | {
      kind: "student";
      today: ISODate;
      course: number;
      semester: number;
      disciplines: DisciplineGrades[];
      record: RecordTerm[];
    };

const levelOrder: Record<Level, number> = { danger: 0, warning: 1, info: 2, success: 3 };

/**
 * Grades of the signed-in student only. Every query is filtered by the user id taken from the session —
 * there is no parameter through which another student's points could be requested.
 */
export async function getMyGrades(): Promise<Grades> {
  const user = await requireUser();
  if (user.role !== "student" || !user.group) return { kind: "noGroup" };

  const database = await db();
  const today = await getToday();
  const course = user.group.course;
  const semester = course * 2 - 1; // autumn term

  const courseRows = await database
    .select({
      id: disciplines.id,
      subject: subjects.name,
      teacher: teachers.fullName,
      controlType: disciplines.controlType,
      sessionDate: disciplines.sessionDate,
      sessionRoom: disciplines.sessionRoom,
    })
    .from(disciplines)
    .innerJoin(subjects, eq(disciplines.subjectId, subjects.id))
    .innerJoin(teachers, eq(disciplines.teacherId, teachers.id))
    .innerJoin(studyGroups, eq(disciplines.groupId, studyGroups.id))
    .where(and(eq(studyGroups.code, user.group.code), eq(disciplines.semester, semester)));

  const ids = courseRows.map((c) => c.id);
  const planned = ids.length
    ? await database
        .select()
        .from(assessments)
        .where(inArray(assessments.disciplineId, ids))
        .orderBy(asc(assessments.dueDate))
    : [];
  const results = planned.length
    ? await database
        .select({ assessmentId: assessmentResults.assessmentId, points: assessmentResults.points })
        .from(assessmentResults)
        .where(and(eq(assessmentResults.studentId, user.id), inArray(assessmentResults.assessmentId, planned.map((a) => a.id))))
    : [];
  const pointsOf = new Map(results.map((r) => [r.assessmentId, r.points]));

  const courses: DisciplineGrades[] = courseRows.map((c) => {
    const items = planned
      .filter((a) => a.disciplineId === c.id)
      .map((a) => ({ id: a.id, title: a.title, dueDate: a.dueDate, maxPoints: a.maxPoints, points: pointsOf.get(a.id) ?? null }));
    const points = items.reduce((sum, i) => sum + (i.points ?? 0), 0);
    const remaining = items.reduce((sum, i) => sum + (i.points === null ? i.maxPoints : 0), 0);
    return {
      ...c,
      semesterMax: BRS.semesterMax[c.controlType],
      points,
      remaining,
      assessment: assess(c.controlType, points, remaining),
      items,
    };
  });
  courses.sort(
    (a, b) =>
      levelOrder[a.assessment.level] - levelOrder[b.assessment.level] ||
      (a.sessionDate ?? "").localeCompare(b.sessionDate ?? ""),
  );

  const recordRows = await database
    .select({
      semester: recordBook.semester,
      subject: subjects.name,
      controlType: recordBook.controlType,
      points: recordBook.points,
      mark: recordBook.mark,
      passed: recordBook.passed,
    })
    .from(recordBook)
    .innerJoin(subjects, eq(recordBook.subjectId, subjects.id))
    .where(eq(recordBook.studentId, user.id))
    .orderBy(asc(recordBook.semester), asc(subjects.name));

  const terms = [...new Set(recordRows.map((r) => r.semester))].sort((a, b) => b - a);
  const record: RecordTerm[] = terms.map((term) => {
    const entries = recordRows
      .filter((r) => r.semester === term)
      .map((r) => ({ subject: r.subject, controlType: r.controlType, points: r.points, mark: r.mark, passed: r.passed }));
    const marks = entries.map((e) => e.mark).filter((m): m is number => m !== null);
    return {
      semester: term,
      entries,
      average: marks.length ? Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 100) / 100 : null,
      // The general rule for the academic scholarship: everything passed, no «3».
      scholarship: entries.every((e) => e.passed && (e.mark === null || e.mark >= 4)),
    };
  });

  return { kind: "student", today, course, semester, disciplines: courses, record };
}
