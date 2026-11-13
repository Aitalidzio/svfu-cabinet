// Validation for one-off lesson changes by the dean's office.
import { isISODate, PAIR_TIMES, type ISODate } from "./calendar";

export const CHANGE_KINDS = ["cancelled", "moved", "modified"] as const;
export type ChangeKind = (typeof CHANGE_KINDS)[number];

export function isChangeKind(value: string): value is ChangeKind {
  return (CHANGE_KINDS as readonly string[]).includes(value);
}

export type ChangeFieldError = "required" | "invalid";

export type ChangeValidation =
  | {
      ok: true;
      lessonId: number;
      date: ISODate;
      kind: ChangeKind;
      newDate: ISODate | null;
      newPairNumber: number | null;
      newRoom: string | null;
      newTeacherId: number | null;
      reason: string | null;
    }
  | { ok: false; errors: Partial<Record<"lessonId" | "date" | "kind" | "newDate" | "newPairNumber" | "newRoom" | "reason", ChangeFieldError>> };

const ROOM_MAX = 80;
const REASON_MAX = 500;

export function validateLessonChange(input: Record<string, string | undefined>): ChangeValidation {
  const errors: Partial<
    Record<"lessonId" | "date" | "kind" | "newDate" | "newPairNumber" | "newRoom" | "reason", ChangeFieldError>
  > = {};

  const lessonId = Number(input.lessonId);
  if (!Number.isSafeInteger(lessonId) || lessonId <= 0) errors.lessonId = "invalid";

  const date = (input.date ?? "").trim();
  if (!isISODate(date)) errors.date = "invalid";

  const kindRaw = (input.kind ?? "").trim();
  if (!isChangeKind(kindRaw)) errors.kind = "invalid";

  let newDate: ISODate | null = null;
  let newPairNumber: number | null = null;
  let newRoom: string | null = null;
  let newTeacherId: number | null = null;

  if (kindRaw === "moved") {
    const nd = (input.newDate ?? "").trim();
    if (!isISODate(nd)) errors.newDate = "invalid";
    else newDate = nd;
    const pair = Number(input.newPairNumber);
    if (!Number.isInteger(pair) || !(pair in PAIR_TIMES)) errors.newPairNumber = "invalid";
    else newPairNumber = pair;
    const room = (input.newRoom ?? "").trim();
    if (room && room.length <= ROOM_MAX) newRoom = room;
  }

  if (kindRaw === "modified") {
    const room = (input.newRoom ?? "").trim();
    const teacherRaw = (input.newTeacherId ?? "").trim();
    const teacherId = teacherRaw ? Number(teacherRaw) : null;
    if (!room && !teacherId) errors.newRoom = "required";
    if (room) {
      if (room.length > ROOM_MAX) errors.newRoom = "invalid";
      else newRoom = room;
    }
    if (teacherId != null) {
      if (!Number.isSafeInteger(teacherId) || teacherId <= 0) errors.newRoom = "invalid";
      else newTeacherId = teacherId;
    }
  }

  const reason = (input.reason ?? "").trim();
  if (reason.length > REASON_MAX) errors.reason = "invalid";

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    lessonId,
    date: date as ISODate,
    kind: kindRaw as ChangeKind,
    newDate,
    newPairNumber,
    newRoom,
    newTeacherId,
    reason: reason || null,
  };
}
