import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  Flame,
  TriangleAlert,
} from "lucide-react";
import { hintLines } from "@/components/grades/discipline-card";
import { StatusChip } from "@/components/requests/status-chip";
import { LessonCard } from "@/components/schedule/lesson-card";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate } from "@/lib/format";
import { notificationHref } from "@/lib/notifications";
import { getTodayOverview, type TodayOverview } from "@/server/dal/today";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.today };
}

type T = Dictionary["today"];

export default async function TodayPage() {
  const dict = await getDictionary();
  return (
    <Suspense fallback={<TodaySkeleton greeting={dict.today.greeting} />}>
      <TodayDashboard />
    </Suspense>
  );
}

async function TodayDashboard() {
  const [overview, dict, locale] = await Promise.all([getTodayOverview(), getDictionary(), getLocale()]);
  const t = dict.today;
  const base = `/${locale}`;

  return (
    <div className="space-y-8">
      <Hero overview={overview} t={t} locale={locale} />

      {overview.changes.length ? (
        <Section
          icon={<CalendarClock className="size-5" aria-hidden />}
          title={t.sections.changes}
          tone="warning"
          actionHref={`${base}/schedule?view=week`}
          actionLabel={t.seeSchedule}
        >
          <div className="space-y-5">
            {overview.changes.map((day) => (
              <div key={day.date}>
                <p className="mb-2 text-sm font-semibold text-warning">
                  {t.dayLabel[day.label]} · {formatDate(day.date, locale, { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <ul className="space-y-2.5">
                  {day.items.map((item) => (
                    <LessonCard key={item.key} item={item} t={dict.schedule} locale={locale} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section
        icon={<Clock3 className="size-5" aria-hidden />}
        title={t.sections.nextClass}
        tone="primary"
        actionHref={`${base}/schedule`}
        actionLabel={t.seeSchedule}
      >
        {overview.nextClass ? (
          <div className="space-y-3">
            {overview.kind === "student" && overview.nextClassWhen ? (
              <p className="text-sm font-semibold text-primary">{t.when[overview.nextClassWhen]}</p>
            ) : null}
            {overview.kind === "staff" && overview.groupCode ? (
              <p className="text-sm text-fg-muted">{fill(t.lookingAtGroup, { code: overview.groupCode })}</p>
            ) : null}
            <ul>
              <LessonCard item={overview.nextClass} t={dict.schedule} locale={locale} />
            </ul>
          </div>
        ) : (
          <p className="text-sm text-fg-muted">{t.noClass}</p>
        )}
      </Section>

      {overview.kind === "student" ? (
        <>
          <Section
            icon={<Flame className="size-5" aria-hidden />}
            title={t.sections.grades}
            tone="danger"
            actionHref={`${base}/grades`}
            actionLabel={t.seeGrades}
          >
            {overview.attention.length ? (
              <ul className="space-y-2.5">
                {overview.attention.map((d) => {
                  const line = hintLines(d.assessment, d.points, dict.grades, locale)[0];
                  return (
                    <li key={d.id}>
                      <Link
                        href={`${base}/grades#discipline-${d.id}`}
                        className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-danger-soft text-danger">
                          <TriangleAlert className="size-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold leading-snug">{d.subject}</span>
                          <span className="mt-1 block text-sm text-fg-muted">{line}</span>
                          <span className="mt-1 block text-sm tabular-nums text-fg">
                            {d.points} / {d.semesterMax}
                          </span>
                        </span>
                        <ChevronRight className="mt-3 size-5 shrink-0 text-fg-muted" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">{t.noAttention}</p>
            )}
          </Section>

          <Section
            icon={<FileText className="size-5" aria-hidden />}
            title={t.sections.requests}
            tone="success"
            actionHref={`${base}/requests`}
            actionLabel={t.seeRequests}
          >
            {overview.activeRequests.length ? (
              <ul className="space-y-2.5">
                {overview.activeRequests.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`${base}/requests/${r.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold leading-snug">{dict.requests.types[r.type].title}</span>
                          <StatusChip status={r.status} label={dict.requests.statuses[r.status]} />
                        </span>
                        <span className="mt-1 block text-sm text-fg-muted">
                          {fill(dict.requests.dueOn, {
                            date: formatDate(r.dueDate, locale, { weekday: "short", day: "numeric", month: "long" }),
                          })}
                        </span>
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-fg-muted" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">{t.noRequests}</p>
            )}
          </Section>

          <Section
            icon={<Bell className="size-5" aria-hidden />}
            title={t.sections.notifications}
            tone="primary"
            actionHref={`${base}/notifications`}
            actionLabel={t.seeNotifications}
            badge={overview.unreadCount > 0 ? fill(t.unreadCount, { n: overview.unreadCount }) : undefined}
          >
            {overview.unread.length ? (
              <ul className="space-y-2.5">
                {overview.unread.map((n) => {
                  const href = notificationHref(locale, n.href) ?? `${base}/notifications`;
                  return (
                    <li key={n.id}>
                      <Link
                        href={href}
                        className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary-soft/40 p-4 transition-colors hover:bg-primary-soft"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-primary">{dict.notifications.filters[n.category]}</span>
                          <span className="mt-0.5 block font-semibold leading-snug">{n.title}</span>
                          <span className="mt-1 block text-sm text-fg-muted">{n.body}</span>
                        </span>
                        <ChevronRight className="mt-3 size-5 shrink-0 text-fg-muted" aria-hidden />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">{t.noNotifications}</p>
            )}
          </Section>

          <Section icon={<ClipboardList className="size-5" aria-hidden />} title={t.sections.deadlines} tone="primary">
            {overview.deadlines.length ? (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
                {overview.deadlines.map((d) => {
                  const title =
                    d.kind === "request" && d.requestType
                      ? dict.requests.types[d.requestType].title
                      : d.title;
                  return (
                    <li key={`${d.kind}-${d.href}-${d.date}`}>
                      <Link
                        href={`${base}${d.href.startsWith("/") ? d.href : `/${d.href}`}`}
                        className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="text-xs font-semibold text-fg-muted">{t.deadlineKinds[d.kind]}</span>
                          <span className="mt-0.5 block font-semibold leading-snug">{title}</span>
                        </span>
                        <span className="shrink-0 text-sm font-medium text-fg">
                          {fill(t.dueOn, {
                            date: formatDate(d.date, locale, { day: "numeric", month: "short" }),
                          })}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-fg-muted">{t.noDeadlines}</p>
            )}
          </Section>
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-line bg-surface px-5 py-4 text-sm text-fg-muted">{t.leadStaff}</p>
      )}
    </div>
  );
}

function Hero({ overview, t, locale }: { overview: TodayOverview; t: T; locale: string }) {
  const greeting = overview.firstName ? fill(t.greetingNamed, { name: overview.firstName }) : t.greeting;
  const date = formatDate(overview.today, locale, { weekday: "long", day: "numeric", month: "long" });

  return (
    <section className="bg-aurora relative isolate overflow-hidden rounded-3xl px-6 py-9 text-white shadow-lg shadow-primary/20 sm:px-10 sm:py-12">
      <svg
        aria-hidden
        viewBox="0 0 32 32"
        className="absolute -right-10 -top-12 -z-10 size-60 opacity-20"
        fill="none"
        stroke="white"
        strokeWidth="0.6"
        strokeLinejoin="round"
      >
        <path d="M10 7h12l6 6-12 14L4 13z" />
        <path d="M4 13h24M13 13l3-6 3 6M13 13l3 14 3-14" />
      </svg>
      <p className="text-sm font-medium text-white/80">{fill(t.dateToday, { date })}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{greeting}</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
        {overview.kind === "student" ? t.leadStudent : t.leadStaff}
      </p>
      {overview.kind === "student" ? (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
          <CalendarDays className="size-4" aria-hidden />
          {fill(t.group, { code: overview.groupCode })}
        </p>
      ) : null}
    </section>
  );
}

function Section({
  icon,
  title,
  tone,
  actionHref,
  actionLabel,
  badge,
  children,
}: {
  icon: ReactNode;
  title: string;
  tone: "primary" | "warning" | "danger" | "success";
  actionHref?: string;
  actionLabel?: string;
  badge?: string;
  children: ReactNode;
}) {
  const toneClass = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    success: "bg-success-soft text-success",
  }[tone];

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`grid size-10 place-items-center rounded-xl ${toneClass}`}>{icon}</span>
        <h2 className="min-w-0 flex-1 text-lg font-semibold">{title}</h2>
        {badge ? <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-on-primary">{badge}</span> : null}
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function TodaySkeleton({ greeting }: { greeting: string }) {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="bg-aurora rounded-3xl px-6 py-9 text-white sm:px-10 sm:py-12">
        <div className="h-4 w-40 rounded bg-white/30" />
        <p className="mt-3 text-3xl font-bold">{greeting}</p>
        <div className="mt-4 h-4 w-2/3 rounded bg-white/20" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl bg-surface-2" />
      ))}
    </div>
  );
}
