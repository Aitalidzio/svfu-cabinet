import { Bell, CalendarDays, FileText, GraduationCap, Sun, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export type NavItem = {
  key: string;
  href: string;
  label: string;
  shortLabel: string;
  icon: ReactNode;
  exact?: boolean;
  inTabBar: boolean;
};

export function getNavItems(locale: Locale, dict: Dictionary): NavItem[] {
  const base = `/${locale}`;
  const icon = "size-5 shrink-0";

  return [
    { key: "today", href: base, exact: true, label: dict.nav.today, shortLabel: dict.nav.today, icon: <Sun className={icon} aria-hidden />, inTabBar: true },
    { key: "schedule", href: `${base}/schedule`, label: dict.nav.schedule, shortLabel: dict.nav.schedule, icon: <CalendarDays className={icon} aria-hidden />, inTabBar: true },
    { key: "grades", href: `${base}/grades`, label: dict.nav.grades, shortLabel: dict.nav.gradesShort, icon: <GraduationCap className={icon} aria-hidden />, inTabBar: true },
    { key: "requests", href: `${base}/requests`, label: dict.nav.requests, shortLabel: dict.nav.requestsShort, icon: <FileText className={icon} aria-hidden />, inTabBar: true },
    { key: "notifications", href: `${base}/notifications`, label: dict.nav.notifications, shortLabel: dict.nav.notifications, icon: <Bell className={icon} aria-hidden />, inTabBar: false },
    { key: "profile", href: `${base}/profile`, label: dict.nav.profile, shortLabel: dict.nav.profile, icon: <UserRound className={icon} aria-hidden />, inTabBar: true },
  ];
}
