import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { sectionMetadata } from "@/components/section-placeholder";
import { DaySection } from "@/components/schedule/day-section";
import { GroupSelect } from "@/components/schedule/group-select";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { addDays, isISODate, mondayOf, weekParity, type ISODate } from "@/lib/calendar";
import { fill, formatDateRange } from "@/lib/format";
import { getSchedule, getToday } from "@/server/dal/schedule";

export const generateMetadata = () => sectionMetadata("schedule");

type View = "today" | "tomorrow" | "week";

export default async function SchedulePage({ searchParams }: PageProps<"/[lang]/schedule">) {
  const dict = await getDictionary();
  return (
    <>
      <PageHeader title={dict.nav.schedule} />
      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleView searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

async function ScheduleView({ searchParams }: { searchParams: PageProps<"/[lang]/schedule">["searchParams"] }) {
  const [query, dict, locale, today] = await Promise.all([searchParams, getDictionary(), getLocale(), getToday()]);
  const t = dict.schedule;

  const viewParam = param(query.view);
  const view: View = viewParam === "tomorrow" || viewParam === "week" ? viewParam : "today";
  const weekParam = param(query.week);
  const weekStart = mondayOf(weekParam && isISODate(weekParam) ? weekParam : today);

  const range =
    view === "today" ? { from: today, days: 1 } : view === "tomorrow" ? { from: addDays(today, 1), days: 1 } : { from: weekStart, days: 6 };

  const schedule = await getSchedule({ groupCode: param(query.group), ...range });

  const basePath = `/${locale}/schedule`;
  const groupParam: Record<string, string> = schedule.isOwnGroup ? {} : { group: schedule.group.code };
  const href = (params: Record<string, string>) => {
    const search = new URLSearchParams({ ...params, ...groupParam }).toString();
    return search ? `${basePath}?${search}` : basePath;
  };
  const weekHref = (monday: ISODate) =>
    href(monday === mondayOf(today) ? { view: "week" } : { view: "week", week: monday });

  const tabs: { view: View; href: string }[] = [
    { view: "today", href: href({}) },
    { view: "tomorrow", href: href({ view: "tomorrow" }) },
    { view: "week", href: weekHref(mondayOf(today)) },
  ];

  const keep: Record<string, string> = view === "today" ? {} : { view };
  if (view === "week" && weekStart !== mondayOf(today)) keep.week = weekStart;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={t.viewLabel} className="flex rounded-full bg-surface-2 p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.view}
              href={tab.href}
              aria-current={tab.view === view ? "page" : undefined}
              className={`grid min-h-10 min-w-20 place-items-center rounded-full px-4 text-sm font-semibold transition-colors ${
                tab.view === view ? "bg-surface text-fg shadow-sm ring-1 ring-line" : "text-fg-muted hover:text-fg"
              }`}
            >
              {t.tabs[tab.view]}
            </Link>
          ))}
        </nav>
        <GroupSelect label={t.group} current={schedule.group.code} groups={schedule.groups} basePath={basePath} keep={keep} />
      </div>

      {schedule.ownGroupCode && !schedule.isOwnGroup ? (
        <p className="rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary">
          {fill(t.otherGroup, { group: schedule.group.code })}{" "}
          <Link
            href={`${basePath}${keep.view ? `?${new URLSearchParams(keep)}` : ""}`}
            className="font-semibold underline underline-offset-2"
          >
            {t.backToOwn}
          </Link>
        </p>
      ) : null}

      {view === "week" ? (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface p-2">
          <Link
            href={weekHref(addDays(weekStart, -7))}
            aria-label={t.prevWeek}
            className="grid size-11 place-items-center rounded-xl text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </Link>
          <div className="text-center">
            <p className="font-semibold">{formatDateRange(weekStart, addDays(weekStart, 5), locale)}</p>
            <p className="text-sm text-fg-muted">
              {t.parity[weekParity(weekStart)]}
              {weekStart !== mondayOf(today) ? (
                <>
                  {" · "}
                  <Link href={weekHref(mondayOf(today))} className="font-medium text-primary underline-offset-2 hover:underline">
                    {t.thisWeek}
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          <Link
            href={weekHref(addDays(weekStart, 7))}
            aria-label={t.nextWeek}
            className="grid size-11 place-items-center rounded-xl text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <ChevronRight className="size-5" aria-hidden />
          </Link>
        </div>
      ) : null}

      <div className="space-y-8">
        {schedule.days.map((day) => (
          <DaySection key={day.date} day={day} t={t} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-12 w-72 max-w-full animate-pulse rounded-full bg-surface-2" />
      <div className="h-6 w-48 animate-pulse rounded-lg bg-surface-2" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-2" />
      ))}
    </div>
  );
}
