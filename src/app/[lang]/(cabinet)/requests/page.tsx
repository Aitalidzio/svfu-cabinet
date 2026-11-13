import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, FilePen, FileText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { NewRequestButton } from "@/components/requests/new-request-button";
import { PageHeader } from "@/components/page-header";
import { StatusChip } from "@/components/requests/status-chip";
import { sectionMetadata } from "@/components/section-placeholder";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate, formatDateTime, shortName } from "@/lib/format";
import { ACTIVE_STATUSES, isRequestStatus, REQUEST_CATALOG, REQUEST_STATUSES } from "@/lib/requests";
import {
  getInstituteRequests,
  getMyRequests,
  getRequestsAccess,
  type RequestSummary,
  type StaffRequestSummary,
} from "@/server/dal/requests";

export const generateMetadata = () => sectionMetadata("requests");

export default async function RequestsPage({ searchParams }: PageProps<"/[lang]/requests">) {
  const dict = await getDictionary();
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title={dict.nav.requests} lead={dict.requests.lead} />
          <ListSkeleton />
        </>
      }
    >
      <RequestsBody searchParams={searchParams} />
    </Suspense>
  );
}

async function RequestsBody({
  searchParams,
}: {
  searchParams: PageProps<"/[lang]/requests">["searchParams"];
}) {
  const [query, access, dict, locale] = await Promise.all([
    searchParams,
    getRequestsAccess(),
    getDictionary(),
    getLocale(),
  ]);
  const statusFilter = typeof query.status === "string" ? query.status : undefined;
  const { isStudent, isStaff } = access;

  if (isStaff) {
    const list = await getInstituteRequests(statusFilter);
    return (
      <>
        <PageHeader title={dict.nav.requests} lead={dict.requests.staff.lead} />
        <StaffQueue list={list} statusFilter={statusFilter} dict={dict} locale={locale} />
      </>
    );
  }

  if (!isStudent) {
    return (
      <>
        <PageHeader title={dict.nav.requests} lead={dict.requests.lead} />
        <EmptyState icon={<FileText className="size-7" aria-hidden />} title={dict.nav.requests} text={dict.requests.staffOnly} />
      </>
    );
  }

  const list = await getMyRequests();
  return (
    <>
      <PageHeader title={dict.nav.requests} lead={dict.requests.lead} />
      <StudentList list={list} dict={dict} locale={locale} />
    </>
  );
}

function StudentList({ list, dict, locale }: { list: RequestSummary[]; dict: Dictionary; locale: string }) {
  const t = dict.requests;
  const newHref = `/${locale}/requests/new`;

  if (!list.length) {
    return (
      <EmptyState
        icon={<FileText className="size-7" aria-hidden />}
        title={t.emptyTitle}
        text={t.emptyText}
        action={<NewRequestButton href={newHref} label={t.newRequest} />}
      />
    );
  }

  const active = list.filter((r) => ACTIVE_STATUSES.includes(r.status));
  const finished = list.filter((r) => !ACTIVE_STATUSES.includes(r.status));

  return (
    <div className="space-y-8">
      <NewRequestButton href={newHref} label={t.newRequest} />
      {[
        { title: t.active, items: active },
        { title: t.finished, items: finished },
      ]
        .filter((section) => section.items.length)
        .map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <ul className="mt-3 space-y-2.5">
              {section.items.map((r) => (
                <StudentRow key={r.id} r={r} t={t} locale={locale} />
              ))}
            </ul>
          </section>
        ))}
    </div>
  );
}

function StaffQueue({
  list,
  statusFilter,
  dict,
  locale,
}: {
  list: StaffRequestSummary[];
  statusFilter?: string;
  dict: Dictionary;
  locale: string;
}) {
  const t = dict.requests;
  const st = t.staff;
  const activeFilter = statusFilter && isRequestStatus(statusFilter) ? statusFilter : null;
  const base = `/${locale}/requests`;

  return (
    <div className="space-y-6">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label={st.filterAll}>
        <FilterChip href={base} label={st.filterAll} active={!activeFilter} />
        {REQUEST_STATUSES.filter((s) => s !== "cancelled").map((s) => (
          <FilterChip key={s} href={`${base}?status=${s}`} label={t.statuses[s]} active={activeFilter === s} />
        ))}
      </div>

      {!list.length ? (
        <EmptyState icon={<FileText className="size-7" aria-hidden />} title={st.queueEmptyTitle} text={st.queueEmptyText} />
      ) : (
        <ul className="space-y-2.5">
          {list.map((r) => (
            <StaffRow key={r.id} r={r} t={t} locale={locale} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
        active ? "bg-primary text-on-primary" : "bg-surface-2 text-fg-muted hover:bg-surface hover:text-fg"
      }`}
    >
      {label}
    </Link>
  );
}

function StudentRow({ r, t, locale }: { r: RequestSummary; t: Dictionary["requests"]; locale: string }) {
  const kind = REQUEST_CATALOG[r.type].kind;
  const finished = !ACTIVE_STATUSES.includes(r.status);

  return (
    <li>
      <Link
        href={`/${locale}/requests/${r.id}`}
        className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
      >
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${
            r.status === "ready" ? "bg-success-soft text-success" : "bg-primary-soft text-primary"
          }`}
        >
          {kind === "certificate" ? <FileText className="size-5" aria-hidden /> : <FilePen className="size-5" aria-hidden />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`font-semibold leading-snug ${finished ? "text-fg-muted" : ""}`}>{t.types[r.type].title}</span>
            <StatusChip status={r.status} label={t.statuses[r.status]} />
          </span>
          <span className="mt-0.5 block text-sm text-fg-muted">
            {fill(t.number, { n: r.id })} · {fill(t.submittedOn, { date: formatDateTime(r.createdAt, locale, false) })}
          </span>
          {r.status === "ready" ? (
            <span className="mt-1 block text-sm font-semibold text-success">{t.readyToPick}</span>
          ) : r.status === "submitted" || r.status === "in_progress" ? (
            <span className="mt-1 block text-sm text-fg">
              {fill(t.dueOn, { date: formatDate(r.dueDate, locale, { weekday: "short", day: "numeric", month: "long" }) })}
            </span>
          ) : null}
        </span>
        <ChevronRight className="size-5 shrink-0 text-fg-muted" aria-hidden />
      </Link>
    </li>
  );
}

function StaffRow({ r, t, locale }: { r: StaffRequestSummary; t: Dictionary["requests"]; locale: string }) {
  const kind = REQUEST_CATALOG[r.type].kind;

  return (
    <li>
      <Link
        href={`/${locale}/requests/${r.id}`}
        className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
      >
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${
            r.status === "ready" ? "bg-success-soft text-success" : "bg-primary-soft text-primary"
          }`}
        >
          {kind === "certificate" ? <FileText className="size-5" aria-hidden /> : <FilePen className="size-5" aria-hidden />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold leading-snug">{t.types[r.type].title}</span>
            <StatusChip status={r.status} label={t.statuses[r.status]} />
          </span>
          <span className="mt-0.5 block text-sm text-fg-muted">
            {shortName(r.studentName)}
            {r.groupCode ? ` · ${fill(t.staff.group, { code: r.groupCode })}` : null}
            {" · "}
            {fill(t.number, { n: r.id })}
          </span>
          {r.status === "submitted" || r.status === "in_progress" ? (
            <span className="mt-1 block text-sm text-fg">
              {fill(t.dueOn, { date: formatDate(r.dueDate, locale, { weekday: "short", day: "numeric", month: "long" }) })}
            </span>
          ) : null}
        </span>
        <ChevronRight className="size-5 shrink-0 text-fg-muted" aria-hidden />
      </Link>
    </li>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-11 w-44 animate-pulse rounded-xl bg-surface-2" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />
      ))}
    </div>
  );
}
