import { Suspense } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getNavItems, type NavItem } from "@/components/shell/nav-items";
import { NavLink } from "@/components/shell/nav-link";
import { NotificationBell } from "@/components/shell/notification-bell";
import { SidebarNav } from "@/components/shell/sidebar-nav";
import { getCurrentUser } from "@/server/dal/user";

async function resolveItems(locale: Locale, dict: Dictionary): Promise<NavItem[]> {
  const user = await getCurrentUser();
  return getNavItems(locale, dict, user?.role ?? "student");
}

async function SidebarRoleNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = await resolveItems(locale, dict);
  return <SidebarNav items={items} />;
}

async function TabRoleNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = await resolveItems(locale, dict);
  return (
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
  );
}

function StudentSidebarFallback({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return <SidebarNav items={getNavItems(locale, dict, "student")} />;
}

function StudentTabFallback({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const items = getNavItems(locale, dict, "student");
  return (
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
  );
}

export function RoleSidebarNav({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <Suspense fallback={<StudentSidebarFallback locale={locale} dict={dict} />}>
      <SidebarRoleNav locale={locale} dict={dict} />
    </Suspense>
  );
}

export function RoleTabBar({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <nav
      aria-label={dict.nav.label}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <Suspense fallback={<StudentTabFallback locale={locale} dict={dict} />}>
        <TabRoleNav locale={locale} dict={dict} />
      </Suspense>
    </nav>
  );
}

async function HeaderBellInner({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const user = await getCurrentUser();
  if (user?.role === "staff") return null;
  return (
    <NotificationBell
      locale={locale}
      label={dict.notifications.bellLabel}
      labelUnread={dict.notifications.bellLabelUnread}
    />
  );
}

export function HeaderBell({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const home = `/${locale}`;
  return (
    <Suspense
      fallback={
        <Link
          href={`${home}/notifications`}
          aria-label={dict.notifications.bellLabel}
          className="grid size-11 place-items-center rounded-full text-fg-muted"
        >
          <Bell className="size-5" aria-hidden />
        </Link>
      }
    >
      <HeaderBellInner locale={locale} dict={dict} />
    </Suspense>
  );
}
