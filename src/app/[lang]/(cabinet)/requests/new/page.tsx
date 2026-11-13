import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, FilePen, FileText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { fill } from "@/lib/format";
import { REQUEST_CATALOG, REQUEST_TYPES } from "@/lib/requests";
import { getRequestsAccess } from "@/server/dal/requests";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.requests.newRequest };
}

export default async function NewRequestPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.requests;

  return (
    <>
      <Link
        href={`/${locale}/requests`}
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t.back}
      </Link>
      <PageHeader title={t.chooseTitle} />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-2" aria-hidden />}>
        <Catalog />
      </Suspense>
    </>
  );
}

async function Catalog() {
  const [{ isStudent }, dict, locale] = await Promise.all([getRequestsAccess(), getDictionary(), getLocale()]);
  const t = dict.requests;
  if (!isStudent) {
    return <EmptyState icon={<FileText className="size-7" aria-hidden />} title={t.newRequest} text={t.staffOnly} />;
  }

  return (
    <div className="space-y-8">
      {(["certificate", "application"] as const).map((kind) => (
        <section key={kind}>
          <h2 className="text-lg font-semibold">{t.kinds[kind]}</h2>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {REQUEST_TYPES.filter((type) => REQUEST_CATALOG[type].kind === kind).map((type) => {
              const spec = REQUEST_CATALOG[type];
              return (
                <li key={type}>
                  <Link
                    href={`/${locale}/requests/new/${type}`}
                    className="flex h-full items-start gap-3 rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-surface-2"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      {kind === "certificate" ? <FileText className="size-5" aria-hidden /> : <FilePen className="size-5" aria-hidden />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold leading-snug">{t.types[type].title}</span>
                      <span className="mt-1 block text-sm text-fg-muted">{t.types[type].text}</span>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-fg-muted">
                        <Clock className="size-3.5" aria-hidden />
                        {kind === "certificate" ? t.term.certificate : fill(t.term.application, { n: spec.workingDays })}
                      </span>
                    </span>
                    <ChevronRight className="mt-3 size-5 shrink-0 text-fg-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
