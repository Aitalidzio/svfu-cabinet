import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, FileText, MapPin, UserRound } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { RequestForm } from "@/components/requests/request-form";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fill, formatDate } from "@/lib/format";
import { addWorkingDays, isRequestType, REQUEST_CATALOG, REQUEST_TYPES, type RequestType } from "@/lib/requests";
import { getRequestsAccess } from "@/server/dal/requests";
import { getToday } from "@/server/dal/schedule";

export async function generateStaticParams() {
  return REQUEST_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/requests/new/[type]">): Promise<Metadata> {
  const [{ type }, dict] = await Promise.all([params, getDictionary()]);
  return isRequestType(type) ? { title: dict.requests.types[type].title } : {};
}

// The shell (back link) does not depend on the URL; everything that reads `type` streams in behind Suspense,
// so navigation into the form stays instant (Next.js «URL data outside of Suspense» insight).
export default async function NewRequestTypePage({ params }: PageProps<"/[lang]/requests/new/[type]">) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <>
      <Link
        href={`/${locale}/requests/new`}
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {dict.requests.chooseTitle}
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
        <TypeHeaderAndForm params={params} />
      </Suspense>
    </>
  );
}

async function TypeHeaderAndForm({ params }: { params: PageProps<"/[lang]/requests/new/[type]">["params"] }) {
  const [{ type }, dict] = await Promise.all([params, getDictionary()]);
  if (!isRequestType(type)) notFound();
  return (
    <>
      <PageHeader title={dict.requests.types[type].title} lead={dict.requests.types[type].text} />
      <FormSection type={type} />
    </>
  );
}

async function FormSection({ type }: { type: RequestType }) {
  const [{ user, isStudent, deanery }, dict, locale, today] = await Promise.all([
    getRequestsAccess(),
    getDictionary(),
    getLocale(),
    getToday(),
  ]);
  const t = dict.requests;
  if (!isStudent) {
    return <EmptyState icon={<FileText className="size-7" aria-hidden />} title={t.newRequest} text={t.staffOnly} />;
  }

  const expected = addWorkingDays(today, REQUEST_CATALOG[type].workingDays);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-start">
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <RequestForm lang={locale} type={type} t={t} />
      </div>
      <aside className="space-y-3 rounded-2xl bg-surface-2 p-5 text-sm">
        <p className="flex gap-2.5">
          <UserRound className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
          {fill(t.issuedTo, { name: user.fullName, group: user.group?.code ?? "" })}
        </p>
        <p className="flex gap-2.5">
          <CalendarCheck className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
          {fill(t.expected, { date: formatDate(expected, locale, { weekday: "long", day: "numeric", month: "long" }) })}
        </p>
        {deanery ? (
          <p className="flex gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-fg-muted" aria-hidden />
            {fill(t.pickup, { place: deanery.place, from: deanery.hours.from, to: deanery.hours.to })}
          </p>
        ) : null}
      </aside>
    </div>
  );
}
