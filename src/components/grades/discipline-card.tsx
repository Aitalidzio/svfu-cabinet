import { CircleAlert, CircleCheck, CircleDot, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import { BRS, type Assessment, type Level } from "@/lib/brs";
import { fill, formatDate, plural, shortName } from "@/lib/format";
import type { DisciplineGrades } from "@/server/dal/grades";
import { levelText, PointsBar } from "./points-bar";

type T = Dictionary["grades"];

const levelIcon: Record<Level, ReactNode> = {
  success: <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />,
  info: <CircleDot className="mt-0.5 size-4 shrink-0" aria-hidden />,
  warning: <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />,
  danger: <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />,
};

/** Turns the BRS assessment into one or two plain sentences: the point of the whole page. */
export function hintLines(a: Assessment, points: number, t: T, locale: string): string[] {
  const pts = (n: number) => plural(locale, n, t.points);
  switch (a.type) {
    case "credit":
      return [a.passed ? t.hint.creditPassed : fill(t.hint.creditNeed, { n: a.need, points: pts(a.need) })];
    case "graded_credit": {
      // Mid-term the total is not final, so below «4» the hint counts towards the goal instead of naming a mark.
      if (a.mark === 3) {
        const n = BRS.markMin[4] - points;
        return [fill(t.hint.gradedHasThree, { n, points: pts(n) })];
      }
      if (a.mark === 2) {
        const n = BRS.markMin[4] - points;
        return [fill(t.hint.gradedToFour, { n, points: pts(n), n3: BRS.markMin[3] - points })];
      }
      const now = fill(t.hint.gradedMark, { mark: a.mark, markName: t.marks[String(a.mark) as keyof T["marks"]] });
      return [a.next ? `${now}, ${fill(t.hint.gradedNext, { mark: a.next.mark, n: a.next.need, points: pts(a.next.need) })}` : now];
    }
    case "exam":
      if (a.stage === "noAdmission") return [fill(t.hint.noAdmission, { n: a.need, points: pts(a.need) })];
      if (a.stage === "done") return [fill(t.hint.examDone, { total: a.total, mark: a.mark })];
      return [
        a.automat ? t.hint.automat : t.hint.admitted,
        ...(a.target && a.target.examNeed > 0 ? [fill(t.hint.examTarget, { mark: a.target.mark, n: a.target.examNeed })] : []),
      ];
  }
}

export function DisciplineCard({ d, t, locale }: { d: DisciplineGrades; t: T; locale: string }) {
  const level = d.assessment.level;
  const pts = (n: number) => plural(locale, n, t.points);
  const showRemaining = d.remaining > 0 && level !== "success";

  return (
    <li id={`discipline-${d.id}`} className="scroll-mt-24 rounded-2xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{d.subject}</h3>
          <p className="mt-0.5 text-sm text-fg-muted">
            {t.control[d.controlType]} · {shortName(d.teacher)}
          </p>
        </div>
        <p className="shrink-0 text-right tabular-nums">
          <span className="text-2xl font-bold">{d.points}</span>
          <span className="text-sm text-fg-muted"> / {d.semesterMax}</span>
        </p>
      </div>

      <PointsBar
        type={d.controlType}
        points={d.points}
        remaining={d.remaining}
        max={d.semesterMax}
        level={level}
        label={fill(t.barLabel, { points: d.points, max: d.semesterMax, remaining: d.remaining })}
      />

      <div className={`mt-2 space-y-1 text-sm font-medium ${levelText[level]}`}>
        {hintLines(d.assessment, d.points, t, locale).map((line) => (
          <p key={line} className="flex gap-2">
            {levelIcon[level]}
            <span>{line}</span>
          </p>
        ))}
      </div>
      {showRemaining ? (
        <p className="mt-1 pl-6 text-sm text-fg-muted">{fill(t.hint.remaining, { n: d.remaining, points: pts(d.remaining) })}</p>
      ) : null}
      {level === "danger" ? <p className="mt-1 pl-6 text-sm text-fg-muted">{t.hint.tooLittleLeft}</p> : null}

      <details className="group mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-primary">
          {t.breakdown} ({d.items.length})
        </summary>
        <ul className="divide-y divide-line rounded-xl bg-surface-2 px-3">
          {d.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0">
                <span className="block font-medium">{item.title}</span>
                <span className="text-xs text-fg-muted">{formatDate(item.dueDate, locale, { day: "numeric", month: "long" })}</span>
              </span>
              <span className="shrink-0 tabular-nums">
                {item.points === null ? (
                  <span className="text-fg-muted">
                    {t.planned} · {item.maxPoints}
                  </span>
                ) : (
                  <>
                    <span className="font-semibold">{item.points}</span>
                    <span className="text-fg-muted"> / {item.maxPoints}</span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </li>
  );
}
