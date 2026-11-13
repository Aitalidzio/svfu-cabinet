import Link from "next/link";
import { Bell } from "lucide-react";
import { fill } from "@/lib/format";
import { getUnreadNotificationCount } from "@/server/dal/notifications";

/** Phone header bell with an unread badge. Must sit inside <Suspense> (reads the session). */
export async function NotificationBell({
  locale,
  label,
  labelUnread,
}: {
  locale: string;
  label: string;
  labelUnread: string;
}) {
  const unread = await getUnreadNotificationCount();
  const aria = unread > 0 ? fill(labelUnread, { n: unread }) : label;

  return (
    <Link
      href={`/${locale}/notifications`}
      aria-label={aria}
      className="relative grid size-11 place-items-center rounded-full text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 ? (
        <span className="absolute right-1.5 top-1.5 grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-4 text-on-primary">
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
