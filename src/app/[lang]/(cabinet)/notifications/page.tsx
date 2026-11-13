import { Suspense } from "react";
import Link from "next/link";
import { Bell, Building2, CalendarDays, CheckCheck, FileText, Megaphone } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { sectionMetadata } from "@/components/section-placeholder";
import { getDictionary, getLocale, type Dictionary } from "@/i18n/dictionaries";
import { formatDateTime } from "@/lib/format";
import {
  NOTIFICATION_CATEGORIES,
  notificationHref,
  parseNotificationFilter,
  type NotificationCategory,
  type NotificationFilter,
} from "@/lib/notifications";
import { getMyNotifications, type NotificationItem } from "@/server/dal/notifications";
import { requireUser } from "@/server/dal/user";
import { markAllNotificationsRead, markNotificationRead, openNotification } from "@/server/notifications/actions";

export const generateMetadata = () => sectionMetadata("notifications");

const categoryIcon: Record<NotificationCategory, typeof Bell> = {
  deanery: Megaphone,
  schedule: CalendarDays,
  requests: FileText,
};

export default async function NotificationsPage({ searchParams }: PageProps<"/[lang]/notifications">) {
  const dict = await getDictionary();
  return (
    <>
      <PageHeader title={dict.nav.notifications} lead={dict.notifications.lead} />
      <Suspense fallback={<ListSkeleton />}>
        <NotificationsFeed searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

async function NotificationsFeed({
  searchParams,
}: {
  searchParams: PageProps<"/[lang]/notifications">["searchParams"];
}) {
  const [query, user, dict, locale] = await Promise.all([searchParams, requireUser(), getDictionary(), getLocale()]);
  const t = dict.notifications;
  const filter = parseNotificationFilter(param(query.category));
  const list = await getMyNotifications(filter);
  const base = `/${locale}/notifications`;
  const returnTo = filter === "all" ? base : `${base}?category=${filter}`;

  if (user.role !== "student") {
    return <EmptyState icon={<Building2 className="size-7" aria-hidden />} title={dict.nav.notifications} text={t.staffEmpty} />;
  }

  const unreadHere = list.filter((n) => !n.read).length;

  return (
    <div className="space-y-5">
      <FilterTabs locale={locale} filter={filter} t={t} />

      {list.length > 0 && unreadHere > 0 ? (
        <form action={markAllNotificationsRead}>
          <input type="hidden" name="lang" value={locale} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
          >
            <CheckCheck className="size-4" aria-hidden />
            {t.markAllRead}
          </button>
        </form>
      ) : null}

      {!list.length ? (
        <EmptyState
          icon={<Bell className="size-7" aria-hidden />}
          title={filter === "all" ? t.emptyTitle : t.emptyFilterTitle}
          text={filter === "all" ? t.emptyText : t.emptyFilterText}
        />
      ) : (
        <ul className="space-y-2.5">
          {list.map((n) => (
            <NotificationRow key={n.id} n={n} t={t} locale={locale} returnTo={returnTo} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterTabs({ locale, filter, t }: { locale: string; filter: NotificationFilter; t: Dictionary["notifications"] }) {
  const base = `/${locale}/notifications`;
  const tabs: { key: NotificationFilter; href: string; label: string }[] = [
    { key: "all", href: base, label: t.filters.all },
    ...NOTIFICATION_CATEGORIES.map((key) => ({
      key,
      href: `${base}?category=${key}`,
      label: t.filters[key],
    })),
  ];

  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label={t.lead}>
      {tabs.map((tab) => {
        const active = tab.key === filter;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors ${
              active ? "bg-primary text-on-primary" : "bg-surface-2 text-fg-muted hover:text-fg"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

function NotificationRow({
  n,
  t,
  locale,
  returnTo,
}: {
  n: NotificationItem;
  t: Dictionary["notifications"];
  locale: string;
  returnTo: string;
}) {
  const Icon = categoryIcon[n.category];
  const deepLink = notificationHref(locale, n.href);

  return (
    <li
      className={`rounded-2xl border p-4 transition-colors ${
        n.read ? "border-line bg-surface" : "border-primary/25 bg-primary-soft/40"
      }`}
    >
      <div className="flex gap-3">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-xl ${
            n.read ? "bg-surface-2 text-fg-muted" : "bg-primary-soft text-primary"
          }`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={`text-xs font-semibold ${n.read ? "text-fg-muted" : "text-primary"}`}>
              {t.filters[n.category]}
            </span>
            {!n.read ? (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-primary">
                {t.unread}
              </span>
            ) : null}
          </div>
          <p className={`mt-1 font-semibold leading-snug ${n.read ? "text-fg" : "text-fg"}`}>{n.title}</p>
          <p className="mt-1 text-sm text-fg-muted">{n.body}</p>
          <p className="mt-2 text-xs text-fg-muted">{formatDateTime(n.createdAt, locale)}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {deepLink ? (
              <form action={openNotification}>
                <input type="hidden" name="lang" value={locale} />
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary transition hover:opacity-90"
                >
                  {t.open}
                </button>
              </form>
            ) : null}
            {!n.read ? (
              <form action={markNotificationRead}>
                <input type="hidden" name="lang" value={locale} />
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-fg-muted ring-1 ring-line transition hover:bg-surface-2 hover:text-fg"
                >
                  {t.markRead}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-11 w-24 animate-pulse rounded-full bg-surface-2" />
        ))}
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-surface-2" />
      ))}
    </div>
  );
}
