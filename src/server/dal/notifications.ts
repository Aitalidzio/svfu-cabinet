import "server-only";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import type { NotificationCategory, NotificationFilter } from "@/lib/notifications";
import { db } from "@/server/db";
import { notifications } from "@/server/db/schema";
import { getCurrentUser, requireUser } from "./user";

export type NotificationItem = {
  id: number;
  category: NotificationCategory;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: Date;
};

/** Unread count for the bell. 0 if nobody is signed in (should not happen inside the cabinet). */
export async function getUnreadNotificationCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  const [{ n }] = await (await db())
    .select({ n: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, user.id), isNull(notifications.readAt)));
  return n;
}

/** The signed-in user's feed, newest first. Optional category filter from the URL. */
export async function getMyNotifications(filter: NotificationFilter = "all"): Promise<NotificationItem[]> {
  const user = await requireUser();

  const where =
    filter === "all"
      ? eq(notifications.userId, user.id)
      : and(eq(notifications.userId, user.id), eq(notifications.category, filter));

  const rows = await (await db())
    .select({
      id: notifications.id,
      category: notifications.category,
      title: notifications.title,
      body: notifications.body,
      href: notifications.href,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt), desc(notifications.id));

  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    body: r.body,
    href: r.href,
    read: r.readAt !== null,
    createdAt: r.createdAt,
  }));
}
