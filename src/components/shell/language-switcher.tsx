"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, localeNames, locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <nav aria-label={label} className="flex rounded-full bg-surface-2 text-xs font-semibold">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={`/${locale}${rest ? `/${rest}` : ""}`}
            hrefLang={locale}
            lang={locale}
            title={localeNames[locale].native}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
            }}
            className={`grid min-h-11 min-w-11 place-items-center rounded-full px-2 transition-colors ${
              active ? "bg-surface text-fg shadow-sm ring-1 ring-line" : "text-fg-muted hover:text-fg"
            }`}
          >
            <span aria-hidden>{localeNames[locale].short}</span>
            <span className="sr-only">{localeNames[locale].native}</span>
          </Link>
        );
      })}
    </nav>
  );
}
