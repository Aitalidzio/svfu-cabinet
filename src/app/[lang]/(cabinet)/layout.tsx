import Link from "next/link";
import { Bell } from "lucide-react";
import { ConceptNote } from "@/components/concept-note";
import { Logo, LogoMark } from "@/components/logo";
import { LanguageSwitcher } from "@/components/shell/language-switcher";
import { NavLink } from "@/components/shell/nav-link";
import { getNavItems } from "@/components/shell/nav-items";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function CabinetLayout({ children }: LayoutProps<"/[lang]">) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const items = getNavItems(locale, dict);
  const home = `/${locale}`;

  return (
    <div className="min-h-dvh">
      {/* Desktop: sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href={home} className="rounded-xl px-2 py-1">
          <Logo name={dict.app.name} tagline={dict.app.tagline} />
        </Link>
        <nav aria-label={dict.nav.label} className="mt-8 flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.key}
              variant="sidebar"
              href={item.href}
              exact={item.exact}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </nav>
        <div className="mt-auto space-y-5 px-1">
          <LanguageSwitcher current={locale} label={dict.language.label} />
          <ConceptNote text={dict.concept.note} />
        </div>
      </aside>

      {/* Phone: top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
        <div className="flex h-16 items-center gap-2 px-4">
          <Link href={home} className="flex min-w-0 items-center gap-2 rounded-xl">
            <LogoMark className="size-8" />
            <span className="truncate text-[17px] font-bold tracking-tight">{dict.app.name}</span>
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <LanguageSwitcher current={locale} label={dict.language.label} />
            <Link
              href={`${home}/notifications`}
              aria-label={dict.nav.notifications}
              className="grid size-11 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              <Bell className="size-5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-5xl px-4 pb-6 pt-5 sm:px-6 lg:px-10 lg:pb-14 lg:pt-10">
          {children}
        </main>
        <footer className="mx-auto max-w-5xl px-4 pb-28 sm:px-6 lg:hidden">
          <ConceptNote text={dict.concept.note} />
        </footer>
      </div>

      {/* Phone: bottom tab bar */}
      <nav
        aria-label={dict.nav.label}
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-lg px-1 py-1.5">
          {items
            .filter((item) => item.inTabBar)
            .map((item) => (
              <NavLink
                key={item.key}
                variant="tab"
                href={item.href}
                exact={item.exact}
                label={item.shortLabel}
                icon={item.icon}
              />
            ))}
        </div>
      </nav>
    </div>
  );
}
