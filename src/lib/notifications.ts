// Categories and URL helpers for the notifications feed. Pure: shared by DAL, page and tests.

export const NOTIFICATION_CATEGORIES = ["deanery", "schedule", "requests"] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export type NotificationFilter = "all" | NotificationCategory;

export function isNotificationCategory(value: string): value is NotificationCategory {
  return (NOTIFICATION_CATEGORIES as readonly string[]).includes(value);
}

export function parseNotificationFilter(value: string | undefined): NotificationFilter {
  if (value && isNotificationCategory(value)) return value;
  return "all";
}

/** Paths stored without the language prefix; the page prepends `/{locale}`. */
export function notificationHref(locale: string, path: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith("/")) return `/${locale}`;
  return `/${locale}${path}`;
}
