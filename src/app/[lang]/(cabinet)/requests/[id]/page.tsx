import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Ban, CalendarCheck, CircleCheckBig, CircleX, MapPin, PartyPopper } from "lucide-react";
import { StatusChip } from "@/components/requests/status-chip";
import { StatusForm } from "@/components/requests/status-form";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { fill, formatDate, formatDateTime, shortName } from "@/lib/format";
import { REQUEST_CATALOG, type RequestStatus } from "@/lib/requests";
import { getRequestForViewer, getRequestsAccess } from "@/server/dal/requests";
import { cancelRequest } from "@/server/requests/actions";

// Ownership / institute check runs before streaming so a foreign id gets a real HTTP 404.
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.requests };
}

type T = Dictionary["requests"];

const statusBox: Record<RequestStatus, string> = {
  submitted: "bg-primary-soft text-primary",
  in_progress: "bg-primary-soft text-primary",
  ready: "bg-success-soft text-success",
  issued: "bg-surface-2 text-fg-muted",
  rejected: "bg-danger-soft text-danger",
  cancelled: "bg-surface-2 text-fg-muted",
};

export default async function RequestPage({ params, searchParams }: PageProps<"/[lang]/requests/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const request = /^\d{1,9}$/.test(id) ? await getRequestForViewer(Number(id)) : null;
  if (!request) notFound();

  const [dict, locale, { isStaff, isStudent, deanery }] = await Promise.all([
    getDictionary(),
    getLocale(),
    getRequestsAccess(),
  ]);
  const t = dict.requests;
  const spec = REQUEST_CATALOG[request.type];
  const optionLabel = (name: string, value: string) =>
    ((t.fields as Record<string, { options?: Record<string, string> }>)[name]?.options ?? {})[value] ?? value;

  return (
    <>
      <Link href={`/${locale}/requests`} className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary">
        <ArrowLeft className="size-4" aria-hidden />
        {t.back}
      </Link>

      {query.created ? (
        <p role="status" className="mb-6 flex gap-2.5 rounded-2xl bg-success-soft px-4 py-3 font-medium text-success">
          <PartyPopper className="mt-0.5 size-5 shrink-0" aria-hidden />
          {t.created}
        </p>
      ) : null}
      {query.updated ? (
        <p role="status" className="mb-6 flex gap-2.5 rounded-2xl bg-success-soft px-4 py-3 font-medium text-success">
          <CircleCheckBig className="mt-0.5 size-5 shrink-0" aria-hidden />
          {t.staff.updated}
        </p>
      ) : null}

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.types[request.type].title}</h1>
          <StatusChip status={request.status} label={t.statuses[request.status]} large />
        </div>
        <p className="mt-2 text-fg-muted">
          {fill(t.number, { n: request.id })} · {fill(t.submittedOn, { date: formatDateTime(request.createdAt, locale) })}
        </p>
        {isStaff ? (
          <p className="mt-1 text-sm text-fg">
            {t.staff.student}: {shortName(request.studentName)}
            {request.groupCode ? ` · ${fill(t.staff.group, { code: request.groupCode })}` : null}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <section className={`rounded-2xl p-5 ${statusBox[request.status]}`}>
            <p className="flex gap-2.5 font-semibold">
              {request.status === "ready" ? (
                <CircleCheckBig className="mt-0.5 size-5 shrink-0" aria-hidden />
              ) : request.status === "rejected" ? (
                <CircleX className="mt-0.5 size-5 shrink-0" aria-hidden />
              ) : request.status === "cancelled" ? (
                <Ban className="mt-0.5 size-5 shrink-0" aria-hidden />
              ) : (
                <CalendarCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
              )}
              {t.statusText[request.status]}
            </p>
            {request.status === "submitted" || request.status === "in_progress" ? (
              <p className="mt-2 pl-7 text-sm">
                {fill(t.dueOn, { date: formatDate(request.dueDate, locale, { weekday: "long", day: "numeric", month: "long" }) })}
              </p>
            ) : null}
            {(request.status === "ready" || request.status === "submitted" || request.status === "in_progress") && deanery ? (
              <p className="mt-2 flex gap-2.5 text-sm text-fg">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {fill(t.pickup, { place: deanery.place, from: deanery.hours.from, to: deanery.hours.to })}
              </p>
            ) : null}
            {request.status === "rejected" && request.rejectionReason ? (
              <p className="mt-2 pl-7 text-sm text-fg">
                <span className="font-semibold">{t.rejectionReason}:</span> {request.rejectionReason}
              </p>
            ) : null}
          </section>

          <section aria-labelledby="details" className="rounded-2xl border border-line bg-surface p-5">
            <h2 id="details" className="font-semibold">
              {t.details}
            </h2>
            <dl className="mt-3 divide-y divide-line text-sm">
              {spec.fields
                .filter((f) => f.type === "choice" && request.details[f.name])
                .map((f) => (
                  <div key={f.name} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-fg-muted">{(t.fields as Record<string, { label: string }>)[f.name].label}</dt>
                    <dd className="text-right font-medium">{optionLabel(f.name, request.details[f.name])}</dd>
                  </div>
                ))}
              {request.comment ? (
                <div className="py-2.5">
                  <dt className="text-fg-muted">{t.fields.comment.label}</dt>
                  <dd className="mt-1 whitespace-pre-line">{request.comment}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {isStaff && request.nextStatuses.length ? (
            <StatusForm lang={locale} requestId={request.id} nextStatuses={request.nextStatuses} t={t} />
          ) : null}

          {isStudent && request.status === "submitted" ? (
            <form action={cancelRequest} className="rounded-2xl border border-line bg-surface p-5">
              <input type="hidden" name="lang" value={locale} />
              <input type="hidden" name="id" value={request.id} />
              <button
                type="submit"
                className="flex min-h-11 items-center gap-2 rounded-xl px-4 font-semibold text-danger ring-1 ring-danger/30 transition-colors hover:bg-danger-soft"
              >
                <Ban className="size-5" aria-hidden />
                {t.cancel}
              </button>
              <p className="mt-2 text-sm text-fg-muted">{t.cancelHint}</p>
            </form>
          ) : null}
        </div>

        <History events={request.events} t={t} locale={locale} isStaffViewer={isStaff} />
      </div>
    </>
  );
}

function History({
  events,
  t,
  locale,
  isStaffViewer,
}: {
  events: { status: RequestStatus; note: string | null; at: Date; byStaff: boolean }[];
  t: T;
  locale: string;
  isStaffViewer: boolean;
}) {
  return (
    <section aria-labelledby="history" className="rounded-2xl border border-line bg-surface p-5">
      <h2 id="history" className="font-semibold">
        {t.history}
      </h2>
      <ol className="mt-4 space-y-0">
        {[...events].reverse().map((e, i, list) => (
          <li key={`${e.status}-${e.at.toISOString()}`} className="relative flex gap-3 pb-5 last:pb-0">
            {i < list.length - 1 ? <span aria-hidden className="absolute left-[7px] top-5 bottom-0 w-0.5 bg-line" /> : null}
            <span
              aria-hidden
              className={`relative mt-1 size-4 shrink-0 rounded-full border-2 ${
                i === 0 ? "border-primary bg-primary" : "border-line bg-surface"
              }`}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{t.statuses[e.status]}</p>
              <p className="text-xs text-fg-muted">
                {formatDateTime(e.at, locale)} ·{" "}
                {e.byStaff ? t.byStaff : isStaffViewer ? t.staff.byStudent : t.byYou}
              </p>
              {e.note && e.status !== "rejected" ? <p className="mt-1 text-sm">{e.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
