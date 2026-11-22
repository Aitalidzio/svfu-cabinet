import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import ru from "@/i18n/dictionaries/ru.json";

export default function RequestNotFound() {
  return (
    <EmptyState
      icon={<SearchX className="size-7" aria-hidden />}
      title={ru.notFound.title}
      text={ru.notFound.text}
      action={
        <Link
          href="/ru/requests"
          className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-on-primary transition-opacity hover:opacity-90"
        >
          {ru.requests.back}
        </Link>
      }
    />
  );
}
