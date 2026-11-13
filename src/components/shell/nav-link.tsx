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
};

export function NavLink({ href, label, icon, exact = false, variant }: NavLinkProps) {
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
      <span className="truncate">{label}</span>
    </Link>
  );
}
