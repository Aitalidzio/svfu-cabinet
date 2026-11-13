// Date helpers for the schedule. Pure functions, shared by the app and the seed script.
// Dates are ISO strings "YYYY-MM-DD" — no time zone surprises when stored in a SQL `date` column.

export type ISODate = string;

/** NEFU is in Yakutsk (UTC+9). «Today» must not depend on where the server happens to run. */
export const TIME_ZONE = "Asia/Yakutsk";

/** ⚠️ Typical bell schedule — to be confirmed for NEFU (see docs/product.md). */
export const PAIR_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: "08:00", end: "09:35" },
  2: { start: "09:50", end: "11:25" },
  3: { start: "11:40", end: "13:15" },
  4: { start: "14:00", end: "15:35" },
  5: { start: "15:50", end: "17:25" },
  6: { start: "17:40", end: "19:15" },
  7: { start: "19:30", end: "21:05" },
};

/** Autumn term of the 2026/27 academic year. */
export const SEMESTER = { start: "2026-09-01", end: "2026-12-27" } as const;

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isISODate(value: string): value is ISODate {
  if (!ISO_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const toUTC = (iso: ISODate) => new Date(`${iso}T00:00:00Z`);
const fromUTC = (d: Date): ISODate => d.toISOString().slice(0, 10);

export function addDays(iso: ISODate, days: number): ISODate {
  const d = toUTC(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUTC(d);
}

/** 1 = Monday … 7 = Sunday */
export function dayOfWeek(iso: ISODate): number {
  return toUTC(iso).getUTCDay() || 7;
}

export function mondayOf(iso: ISODate): ISODate {
  return addDays(iso, 1 - dayOfWeek(iso));
}

/** Week number in the term, counting the week of SEMESTER.start as week 1. */
export function semesterWeek(iso: ISODate): number {
  const diff = toUTC(mondayOf(iso)).getTime() - toUTC(mondayOf(SEMESTER.start)).getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
}

export function weekParity(iso: ISODate): "odd" | "even" {
  return semesterWeek(iso) % 2 === 1 ? "odd" : "even";
}

export function inSemester(iso: ISODate): boolean {
  return iso >= SEMESTER.start && iso <= SEMESTER.end;
}

/** Current date and minutes since midnight in Yakutsk. */
export function yakutskNow(now: Date): { date: ISODate; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
