import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

// 404 inside the cabinet: e.g. someone else's request id. Navigation stays in place.
export default async function CabinetNotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <EmptyState
      icon={<SearchX className="size-7" aria-hidden />}
      title={dict.notFound.title}
      text={dict.notFound.text}
      action={
        <Link
          href={`/${locale}`}
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          {dict.common.toHome}
        </Link>
      }
    />
  );
}
