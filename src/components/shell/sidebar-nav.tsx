import { Suspense } from "react";
import type { NavItem } from "@/components/shell/nav-items";
import { NavLink } from "@/components/shell/nav-link";
import { getUnreadNotificationCount } from "@/server/dal/notifications";

function NavSkeleton({ items }: { items: NavItem[] }) {
  return (
    <>
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
    </>
  );
}

async function NavWithBadges({ items }: { items: NavItem[] }) {
  const unread = await getUnreadNotificationCount();
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.key}
          variant="sidebar"
          href={item.href}
          exact={item.exact}
          label={item.label}
          icon={item.icon}
          badge={item.key === "notifications" ? unread : 0}
        />
      ))}
    </>
  );
}

/** Sidebar links; unread badge for notifications streams in behind Suspense. */
export function SidebarNav({ items }: { items: NavItem[] }) {
  return (
    <Suspense fallback={<NavSkeleton items={items} />}>
      <NavWithBadges items={items} />
    </Suspense>
  );
}
