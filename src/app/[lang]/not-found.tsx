import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <main className="mx-auto grid min-h-dvh max-w-lg place-items-center px-4">
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
    </main>
  );
}
