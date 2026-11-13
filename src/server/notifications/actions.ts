"use server";

import { and, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { notificationHref } from "@/lib/notifications";
import { db } from "@/server/db";
import { notifications } from "@/server/db/schema";
import { getCurrentUser } from "@/server/dal/user";

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("lang") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

function safeAppPath(raw: string, locale: Locale, fallback: string): string {
  // Only same-app relative paths — never an open redirect.
  if (raw.startsWith(`/${locale}`) && !raw.includes("//")) return raw;
  return fallback;
}

function returnTo(formData: FormData, locale: Locale): string {
  return safeAppPath(String(formData.get("returnTo") ?? ""), locale, `/${locale}/notifications`);
}

async function markOwnRead(userId: string, id: number): Promise<string | null> {
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const [row] = await (await db())
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning({ href: notifications.href });
  return row?.href ?? null;
}

/** Marks one of the current user's notifications as read. Someone else's id is a no-op. */
export async function markNotificationRead(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  await markOwnRead(user.id, Number(formData.get("id")));
  redirect(returnTo(formData, locale));
}

/**
 * Marks as read and opens the linked page (request, schedule, …).
 * If there is no link, stays on the notifications list.
 */
export async function openNotification(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const href = await markOwnRead(user.id, Number(formData.get("id")));
  const target = notificationHref(locale, href);
  redirect(target ?? returnTo(formData, locale));
}

/** Marks every unread notification of the current user as read. */
export async function markAllNotificationsRead(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  await (await db())
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));

  redirect(returnTo(formData, locale));
}
