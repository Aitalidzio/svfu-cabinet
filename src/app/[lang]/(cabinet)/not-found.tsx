import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import ru from "@/i18n/dictionaries/ru.json";

// Sync only: async getLocale() → notFound() here blanked the page (Cache Components).
export default function CabinetNotFound() {
  return (
    <EmptyState
      icon={<SearchX className="size-7" aria-hidden />}
      title={ru.notFound.title}
      text={ru.notFound.text}
      action={
        <Link
          href="/ru"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          {ru.common.toHome}
        </Link>
      }
    />
  );
}
