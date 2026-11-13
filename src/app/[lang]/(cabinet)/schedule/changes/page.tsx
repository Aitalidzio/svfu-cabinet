import { Suspense } from "react";
import Link from "next/link";
import { CalendarClock, CircleCheckBig } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ChangeForm } from "@/components/schedule/change-form";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { isISODate } from "@/lib/calendar";
import { getStaffInstituteGroups } from "@/server/dal/announcements";
import { getLessonsForChange, getTeacherOptions } from "@/server/dal/schedule-changes";
import { getToday } from "@/server/dal/schedule";
import { requireUser } from "@/server/dal/user";

export async function generateMetadata() {
  const dict = await getDictionary();
  return { title: dict.nav.changes };
}

export default async function ScheduleChangesPage({ searchParams }: PageProps<"/[lang]/schedule/changes">) {
  const dict = await getDictionary();
  return (
    <>
      <PageHeader title={dict.nav.changes} lead={dict.scheduleChanges.lead} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
        <ChangesBody searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function ChangesBody({
  searchParams,
}: {
  searchParams: PageProps<"/[lang]/schedule/changes">["searchParams"];
}) {
  const [query, user, dict, locale, today] = await Promise.all([
    searchParams,
    requireUser(),
    getDictionary(),
    getLocale(),
    getToday(),
  ]);
  const t = dict.scheduleChanges;

  if (user.role !== "staff") {
    return <EmptyState icon={<CalendarClock className="size-7" aria-hidden />} title={dict.nav.changes} text={t.studentOnly} />;
  }

  const [groups, teachers] = await Promise.all([getStaffInstituteGroups(), getTeacherOptions()]);
  const groupParam = typeof query.group === "string" ? query.group : undefined;
  const dateParam = typeof query.date === "string" ? query.date : undefined;
  const groupCode = groups.some((g) => g.code === groupParam) ? groupParam! : (groups[0]?.code ?? "");
  const date = dateParam && isISODate(dateParam) ? dateParam : today;
  const lessons = groupCode ? await getLessonsForChange(groupCode, date) : [];

  return (
    <div className="space-y-4">
      {query.saved ? (
        <p role="status" className="flex gap-2.5 rounded-2xl bg-success-soft px-4 py-3 font-medium text-success">
          <CircleCheckBig className="mt-0.5 size-5 shrink-0" aria-hidden />
          {t.saved}
        </p>
      ) : null}
      <ChangeForm lang={locale} groups={groups} teachers={teachers} groupCode={groupCode} date={date} lessons={lessons} t={t} />
      <Link
        href={`/${locale}/schedule?group=${encodeURIComponent(groupCode)}&view=week`}
        className="inline-flex min-h-11 items-center text-sm font-semibold text-primary"
      >
        {t.openSchedule}
      </Link>
    </div>
  );
}
