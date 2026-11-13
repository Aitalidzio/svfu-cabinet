"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  variant: "sidebar" | "tab";
  /** Unread count for the notifications item (sidebar only). */
  badge?: number;
};

export function NavLink({ href, label, icon, exact = false, variant, badge = 0 }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "tab") {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[11px] font-medium transition-colors ${
          active ? "text-primary" : "text-fg-muted hover:text-fg"
        }`}
      >
        <span
          className={`grid h-7 w-12 place-items-center rounded-full transition-colors ${
            active ? "bg-primary-soft" : ""
          }`}
        >
          {icon}
        </span>
        <span className="max-w-full truncate">{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors ${
        active ? "bg-primary-soft text-primary" : "text-fg-muted hover:bg-surface-2 hover:text-fg"
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge > 0 ? (
        <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-bold leading-5 text-on-primary">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
