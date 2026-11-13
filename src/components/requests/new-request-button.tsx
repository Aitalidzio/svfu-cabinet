import Link from "next/link";
import { Plus } from "lucide-react";

export function NewRequestButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 font-semibold text-on-primary shadow-sm shadow-primary/30 transition hover:opacity-90"
    >
      <Plus className="size-5" aria-hidden />
      {label}
    </Link>
  );
}
