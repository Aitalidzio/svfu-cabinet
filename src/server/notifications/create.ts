import "server-only";
import type { NotificationCategory } from "@/lib/notifications";
import { db } from "@/server/db";
import { notifications } from "@/server/db/schema";

export type NewNotification = {
  userId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  href?: string | null;
  createdAt?: Date;
};

/**
 * Creates one or more notifications. Used by seed and by the dean's office
 * when a request status changes, a class is moved, or an announcement is published.
 * Never accepts a recipient id from the client: callers pass ids resolved on the server.
 */
export async function createNotifications(items: NewNotification[]): Promise<void> {
  if (!items.length) return;
  await (await db()).insert(notifications).values(
    items.map((item) => ({
      userId: item.userId,
      category: item.category,
      title: item.title,
      body: item.body,
      href: item.href ?? null,
      createdAt: item.createdAt,
    })),
  );
}
