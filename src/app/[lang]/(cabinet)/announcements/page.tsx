import { Suspense } from "react";
import { Megaphone, PartyPopper } from "lucide-react";
import { AnnounceForm } from "@/components/announcements/announce-form";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { formatDateTime } from "@/lib/format";
import { getInstituteAnnouncements, getStaffInstituteGroups } from "@/server/dal/announcements";
import { requireUser } from "@/server/dal/user";

export async function generateMetadata() {
  const dict = await getDictionary();
  return { title: dict.nav.announcements };
}

export default async function AnnouncementsPage({ searchParams }: PageProps<"/[lang]/announcements">) {
  const dict = await getDictionary();
  return (
    <>
      <PageHeader title={dict.nav.announcements} lead={dict.announcements.lead} />
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
        <AnnouncementsBody searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function AnnouncementsBody({
  searchParams,
}: {
  searchParams: PageProps<"/[lang]/announcements">["searchParams"];
}) {
  const [query, user, dict, locale] = await Promise.all([searchParams, requireUser(), getDictionary(), getLocale()]);
  const t = dict.announcements;

  if (user.role !== "staff") {
    return <EmptyState icon={<Megaphone className="size-7" aria-hidden />} title={dict.nav.announcements} text={t.studentOnly} />;
  }

  const [list, groups] = await Promise.all([getInstituteAnnouncements(), getStaffInstituteGroups()]);

  return (
    <div className="space-y-6">
      {query.published ? (
        <p role="status" className="flex gap-2.5 rounded-2xl bg-success-soft px-4 py-3 font-medium text-success">
          <PartyPopper className="mt-0.5 size-5 shrink-0" aria-hidden />
          {t.published}
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <AnnounceForm lang={locale} groups={groups} t={t} />
        <AnnouncementsList list={list} t={t} locale={locale} />
      </div>
    </div>
  );
}

function AnnouncementsList({
  list,
  t,
  locale,
}: {
  list: Awaited<ReturnType<typeof getInstituteAnnouncements>>;
  t: Dictionary["announcements"];
  locale: string;
}) {
  if (!list.length) {
    return <EmptyState icon={<Megaphone className="size-7" aria-hidden />} title={t.emptyTitle} text={t.emptyText} />;
  }

  return (
    <section>
      <h2 className="text-lg font-semibold">{t.listTitle}</h2>
      <ul className="mt-3 space-y-3">
        {list.map((a) => (
          <li key={a.id} className="rounded-2xl border border-line bg-surface p-4">
            <p className="font-semibold">{a.title}</p>
            <p className="mt-1 whitespace-pre-line text-sm text-fg">{a.body}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {t.audiences[a.audience]}
              {a.audience === "course" && a.course != null ? ` · ${a.course}` : null}
              {a.audience === "group" && a.groupCode ? ` · ${a.groupCode}` : null}
              {" · "}
              {formatDateTime(a.createdAt, locale)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
