// NEFU point-rating system (БРС). Rules confirmed by the team, see docs/product.md → «Правила БРС».
// Pure functions: the same code builds the hints on the grades page and is covered by brs.test.ts.

export type ControlType = "credit" | "graded_credit" | "exam";
export type Mark = 2 | 3 | 4 | 5;
export type PassMark = 3 | 4 | 5;

export const BRS = {
  /** Points available during the term (the exam adds up to 30 on top for «exam» courses). */
  semesterMax: { credit: 100, graded_credit: 100, exam: 70 } as Record<ControlType, number>,
  examMax: 30,
  creditPass: 60,
  admission: 45,
  automat: 65,
  /** Lower bounds of the total for each mark: 55–64 → 3, 65–84 → 4, 85–100 → 5. */
  markMin: { 3: 55, 4: 65, 5: 85 } as Record<PassMark, number>,
} as const;

export function markFor(total: number): Mark {
  if (total >= BRS.markMin[5]) return 5;
  if (total >= BRS.markMin[4]) return 4;
  if (total >= BRS.markMin[3]) return 3;
  return 2;
}

/** How urgent a course is: drives the colour and the «needs attention» list. */
export type Level = "success" | "info" | "warning" | "danger";

export type Assessment =
  | { type: "credit"; level: Level; passed: boolean; need: number }
  | { type: "graded_credit"; level: Level; mark: Mark; next: { mark: PassMark; need: number } | null }
  | { type: "exam"; level: Level; stage: "noAdmission"; need: number }
  | { type: "exam"; level: Level; stage: "admitted"; automat: boolean; target: { mark: PassMark; examNeed: number } | null }
  | { type: "exam"; level: Level; stage: "done"; total: number; mark: Mark };

/**
 * How hard it is to close a gap with the points still planned this term.
 * Mid-term almost every course is «not reached yet», so the level depends on the effort left:
 * up to half of the remaining points — fine (info); more than half — needs attention (warning);
 * more than is left at all — danger: planned work alone will not be enough.
 */
export function effort(need: number, remaining: number): Level {
  if (need <= 0) return "success";
  if (need <= remaining / 2) return "info";
  if (need <= remaining) return "warning";
  return "danger";
}

/**
 * @param semester  points earned during the term so far
 * @param remaining points still possible from assessments planned later in the term
 * @param exam      exam points, once the exam has taken place
 */
export function assess(type: ControlType, semester: number, remaining: number, exam: number | null = null): Assessment {
  const points = Math.min(semester, BRS.semesterMax[type]);

  if (type === "credit") {
    const need = Math.max(0, BRS.creditPass - points);
    return { type, passed: need === 0, need, level: effort(need, remaining) };
  }

  if (type === "graded_credit") {
    const mark = markFor(points);
    const nextMark = mark === 5 ? null : ((mark + 1) as PassMark);
    const next = nextMark ? { mark: nextMark, need: BRS.markMin[nextMark] - points } : null;
    // The academic scholarship needs «4» or «5», so the level is measured against «4».
    let level = effort(BRS.markMin[4] - points, remaining);
    // «4» is out of reach but «3» is not: a scholarship risk, not a debt.
    if (level === "danger" && BRS.markMin[3] - points <= remaining) level = "warning";
    return { type, mark, next, level };
  }

  if (exam !== null) {
    const total = points + Math.min(exam, BRS.examMax);
    const mark = markFor(total);
    return { type, stage: "done", total, mark, level: mark >= 4 ? "success" : mark === 3 ? "warning" : "danger" };
  }

  if (points < BRS.admission) {
    const need = BRS.admission - points;
    return { type, stage: "noAdmission", need, level: effort(need, remaining) };
  }

  // Admitted: the best mark the exam can still bring.
  const automat = points >= BRS.automat;
  const best = ([5, 4, 3] as PassMark[]).find((m) => BRS.markMin[m] - points <= BRS.examMax);
  const target = best ? { mark: best, examNeed: Math.max(0, BRS.markMin[best] - points) } : null;
  return { type, stage: "admitted", automat, target, level: automat ? "success" : "info" };
}

export const needsAttention = (a: Assessment) => a.level === "warning" || a.level === "danger";
