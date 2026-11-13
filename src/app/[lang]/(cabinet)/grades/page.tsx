import { Suspense } from "react";
import Link from "next/link";
import { Award, CalendarCheck, GraduationCap, Sparkles, TriangleAlert } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { DisciplineCard } from "@/components/grades/discipline-card";
import { roomLabel } from "@/components/schedule/lesson-card";
import { PageHeader } from "@/components/page-header";
import { sectionMetadata } from "@/components/section-placeholder";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { needsAttention } from "@/lib/brs";
import { termOf } from "@/lib/calendar";
import { fill, formatDate } from "@/lib/format";
import { getMyGrades, type DisciplineGrades, type RecordTerm } from "@/server/dal/grades";

export const generateMetadata = () => sectionMetadata("grades");

type T = Dictionary["grades"];

export default async function GradesPage({ searchParams }: PageProps<"/[lang]/grades">) {
  const dict = await getDictionary();
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title={dict.nav.grades} />
          <GradesSkeleton />
        </>
      }
    >
      <GradesView searchParams={searchParams} />
    </Suspense>
  );
}

async function GradesView({ searchParams }: { searchParams: PageProps<"/[lang]/grades">["searchParams"] }) {
  const [query, dict, locale, grades] = await Promise.all([searchParams, getDictionary(), getLocale(), getMyGrades()]);
  const t = dict.grades;

  if (grades.kind === "noGroup") {
    return (
      <>
        <PageHeader title={dict.nav.grades} />
        <EmptyState icon={<GraduationCap className="size-7" aria-hidden />} title={dict.nav.grades} text={t.noGroup} />
      </>
    );
  }

  const term = termOf(grades.semester, grades.course);
  const tab = query.tab === "record" ? "record" : "term";
  const base = `/${locale}/grades`;

  return (
    <>
      <PageHeader
        title={dict.nav.grades}
        lead={fill(t.lead, { n: grades.semester, season: t.seasons[term.season], years: term.years })}
      />
      <nav aria-label={t.tabsLabel} className="mb-6 flex w-fit max-w-full rounded-full bg-surface-2 p-1">
        {(["term", "record"] as const).map((key) => (
          <Link
            key={key}
            href={key === "term" ? base : `${base}?tab=record`}
            aria-current={tab === key ? "page" : undefined}
            className={`grid min-h-10 place-items-center rounded-full px-4 text-sm font-semibold transition-colors ${
              tab === key ? "bg-surface text-fg shadow-sm ring-1 ring-line" : "text-fg-muted hover:text-fg"
            }`}
          >
            {t.tabs[key]}
          </Link>
        ))}
      </nav>

      {tab === "term" ? (
        <div className="space-y-8">
          <Summary disciplines={grades.disciplines} lastTerm={grades.record[0]} t={t} locale={locale} />
          <ul className="grid gap-3 lg:grid-cols-2 lg:items-start">
            {grades.disciplines.map((d) => (
              <DisciplineCard key={d.id} d={d} t={t} locale={locale} />
            ))}
          </ul>
          <Session disciplines={grades.disciplines} t={t} roomT={dict.schedule} locale={locale} />
        </div>
      ) : (
        <RecordBook record={grades.record} course={grades.course} t={t} />
      )}
    </>
  );
}

function Summary({ disciplines, lastTerm, t, locale }: { disciplines: DisciplineGrades[]; lastTerm?: RecordTerm; t: T; locale: string }) {
  const attention = disciplines.filter((d) => needsAttention(d.assessment));
  const ok = disciplines.length - attention.length;
  const firstDate = (type: "exam" | "credit") =>
    disciplines
      .filter((d) => (type === "exam" ? d.controlType === "exam" : d.controlType !== "exam") && d.sessionDate)
      .map((d) => d.sessionDate!)
      .sort()[0];
  const credits = firstDate("credit");
  const exams = firstDate("exam");
  const day = (iso: string) => formatDate(iso, locale, { day: "numeric", month: "long" });

  return (
    <section aria-labelledby="summary-title" className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <h2 id="summary-title" className="text-lg font-semibold">
        {t.summary.title}
      </h2>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums">{ok}</span>
        <span className="text-fg-muted">{fill(t.summary.onTrack, { ok: "", total: disciplines.length }).trim()}</span>
      </p>

      {attention.length ? (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning">
            <TriangleAlert className="size-4" aria-hidden />
            {t.summary.attention}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {attention.map((d) => (
              <li key={d.id}>
                <a
                  href={`#discipline-${d.id}`}
                  className={`inline-flex min-h-9 items-center rounded-full px-3 text-sm font-medium ring-1 ${
                    d.assessment.level === "danger"
                      ? "bg-danger-soft text-danger ring-danger/30"
                      : "bg-warning-soft text-warning ring-warning/30"
                  }`}
                >
                  {d.subject}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-success">
          <Sparkles className="size-4" aria-hidden />
          {t.summary.allGood}
        </p>
      )}

      <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
        <p className="flex gap-2">
          <Award className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
          <span>
            {lastTerm ? (
              <>
                {t.summary.scholarshipNow}{" "}
                <span className={`font-semibold ${lastTerm.scholarship ? "text-success" : "text-fg"}`}>
                  {lastTerm.scholarship ? t.summary.scholarshipYes : t.summary.scholarshipNo}
                </span>
                .{" "}
              </>
            ) : null}
            {attention.length
              ? fill(t.summary.forecastRisk, { list: attention.map((d) => `«${d.subject}»`).join(", ") })
              : t.summary.forecastOk}
          </span>
        </p>
        {credits && exams ? (
          <p className="flex gap-2">
            <CalendarCheck className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
            <span>{fill(t.summary.session, { credits: day(credits), exams: day(exams) })}</span>
          </p>
        ) : null}
        <p className="pl-6 text-xs text-fg-muted">{t.summary.rule}</p>
      </div>
    </section>
  );
}

function Session({ disciplines, t, roomT, locale }: { disciplines: DisciplineGrades[]; t: T; roomT: Dictionary["schedule"]; locale: string }) {
  const events = disciplines.filter((d) => d.sessionDate).sort((a, b) => a.sessionDate!.localeCompare(b.sessionDate!));
  if (!events.length) return null;

  return (
    <section aria-labelledby="session-title">
      <h2 id="session-title" className="text-lg font-semibold">
        {t.sessionTitle}
      </h2>
      <ol className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
        {events.map((d) => {
          const noAdmission = d.assessment.type === "exam" && d.assessment.stage === "noAdmission";
          return (
            <li key={d.id} className="flex gap-4 px-4 py-3">
              <span className="w-16 shrink-0 text-sm font-semibold tabular-nums first-letter:uppercase">
                {formatDate(d.sessionDate!, locale, { day: "numeric", month: "short" })}
                <span className="block text-xs font-normal text-fg-muted">
                  {formatDate(d.sessionDate!, locale, { weekday: "short" })}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-snug">{d.subject}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-fg-muted">
                  {t.control[d.controlType]}
                  {d.sessionRoom ? <span>· {roomLabel(roomT, d.sessionRoom)}</span> : null}
                  {noAdmission ? (
                    <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-semibold text-danger">{t.noAdmissionBadge}</span>
                  ) : null}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function RecordBook({ record, course, t }: { record: RecordTerm[]; course: number; t: T }) {
  if (!record.length) {
    return <EmptyState icon={<GraduationCap className="size-7" aria-hidden />} title={t.tabs.record} text={t.record.empty} />;
  }

  return (
    <div className="space-y-6">
      {record.map((term) => {
        const when = termOf(term.semester, course);
        return (
          <section key={term.semester} aria-labelledby={`term-${term.semester}`} className="rounded-2xl border border-line bg-surface">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
              <h2 id={`term-${term.semester}`} className="font-semibold">
                {fill(t.record.semester, { n: term.semester })}
                <span className="font-normal text-fg-muted">
                  {" "}
                  · {t.seasons[when.season]} {when.years}
                </span>
              </h2>
              <span className="flex flex-wrap gap-2 text-xs font-semibold">
                {term.average !== null ? (
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-fg-muted">
                    {fill(t.record.average, { avg: term.average.toLocaleString("ru-RU") })}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-2.5 py-1 ${
                    term.scholarship ? "bg-success-soft text-success" : "bg-surface-2 text-fg-muted"
                  }`}
                >
                  {term.scholarship ? t.record.scholarship : t.record.noScholarship}
                </span>
              </span>
            </header>
            <ul className="divide-y divide-line">
              {term.entries.map((e) => (
                <li key={e.subject} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-snug">{e.subject}</span>
                    <span className="text-xs text-fg-muted">
                      {t.control[e.controlType]} · {e.points}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-sm font-semibold tabular-nums ${
                      !e.passed
                        ? "bg-danger-soft text-danger"
                        : e.mark === 3
                          ? "bg-warning-soft text-warning"
                          : "bg-success-soft text-success"
                    }`}
                  >
                    {e.mark === null
                      ? e.passed
                        ? t.record.passed
                        : t.record.failed
                      : `${e.mark} · ${t.marks[String(e.mark) as keyof T["marks"]]}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function GradesSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-11 w-80 max-w-full animate-pulse rounded-full bg-surface-2" />
      <div className="h-48 animate-pulse rounded-3xl bg-surface-2" />
      <div className="grid gap-3 lg:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-surface-2" />
        ))}
      </div>
    </div>
  );
}
