import "server-only";
import { io } from "next/cache";
import { addDays, toMinutes, yakutskNow, type ISODate } from "@/lib/calendar";
import { needsAttention } from "@/lib/brs";
import { ACTIVE_STATUSES, type RequestType } from "@/lib/requests";
import { getMyGrades, type DisciplineGrades } from "./grades";
import { getMyNotifications, getUnreadNotificationCount, type NotificationItem } from "./notifications";
import { getMyRequests, type RequestSummary } from "./requests";
import { getSchedule, getToday, type ScheduleItem } from "./schedule";
import { requireUser } from "./user";

export type TodayDeadline = {
  kind: "assessment" | "session" | "request";
  /** Subject / assessment title, or request type code when kind is «request». */
  title: string;
  requestType?: RequestType;
  date: ISODate;
  href: string;
};

export type TodayOverview =
  | {
      kind: "staff";
      firstName: string | null;
      today: ISODate;
      nextClass: ScheduleItem | null;
      groupCode: string | null;
      changes: { date: ISODate; label: "today" | "tomorrow"; items: ScheduleItem[] }[];
      unreadCount: number;
    }
  | {
      kind: "student";
      firstName: string | null;
      today: ISODate;
      groupCode: string;
      nextClass: ScheduleItem | null;
      nextClassWhen: "now" | "today" | "tomorrow" | null;
      changes: { date: ISODate; label: "today" | "tomorrow"; items: ScheduleItem[] }[];
      attention: DisciplineGrades[];
      activeRequests: RequestSummary[];
      unread: NotificationItem[];
      unreadCount: number;
      deadlines: TodayDeadline[];
    };

function isOnTimetable(item: ScheduleItem) {
  return item.status !== "cancelled" && item.status !== "movedAway";
}

function changed(item: ScheduleItem) {
  return item.status !== "regular";
}

function pickNextClass(
  todayItems: ScheduleItem[],
  tomorrowItems: ScheduleItem[],
  nowMinutes: number,
): { item: ScheduleItem; when: "now" | "today" | "tomorrow" } | null {
  const todayActive = todayItems.filter(isOnTimetable);
  const now = todayActive.find((i) => i.isNow);
  if (now) return { item: now, when: "now" };

  const later = todayActive.find((i) => toMinutes(i.start) > nowMinutes);
  if (later) return { item: later, when: "today" };

  const tomorrow = tomorrowItems.find(isOnTimetable);
  if (tomorrow) return { item: tomorrow, when: "tomorrow" };

  return null;
}

/**
 * Everything the «Today» home screen needs, assembled from existing DAL calls.
 * No userId from the client — each underlying function reads the session itself.
 */
export async function getTodayOverview(): Promise<TodayOverview> {
  const user = await requireUser();
  const firstName = user.fullName.split(" ")[1] ?? null;
  const today = await getToday();
  const tomorrow = addDays(today, 1);

  await io();
  const nowMinutes = yakutskNow(new Date()).minutes;

  if (user.role !== "student" || !user.group) {
    const schedule = await getSchedule({ from: today, days: 2 });
    const todayDay = schedule.days[0];
    const tomorrowDay = schedule.days[1];
    const next = pickNextClass(todayDay?.items ?? [], tomorrowDay?.items ?? [], nowMinutes);
    const changes = (
      [
        { date: today, label: "today" as const, items: (todayDay?.items ?? []).filter(changed) },
        { date: tomorrow, label: "tomorrow" as const, items: (tomorrowDay?.items ?? []).filter(changed) },
      ] as const
    ).filter((d) => d.items.length);
    return {
      kind: "staff",
      firstName,
      today,
      nextClass: next?.item ?? null,
      groupCode: schedule.group.code,
      changes: [...changes],
      unreadCount: await getUnreadNotificationCount(),
    };
  }

  const [schedule, grades, requests, unreadNotifications, unreadCount] = await Promise.all([
    getSchedule({ from: today, days: 2 }),
    getMyGrades(),
    getMyRequests(),
    getMyNotifications("all"),
    getUnreadNotificationCount(),
  ]);

  const todayDay = schedule.days[0];
  const tomorrowDay = schedule.days[1];
  const next = pickNextClass(todayDay?.items ?? [], tomorrowDay?.items ?? [], nowMinutes);

  const changes = (
    [
      { date: today, label: "today" as const, items: (todayDay?.items ?? []).filter(changed) },
      { date: tomorrow, label: "tomorrow" as const, items: (tomorrowDay?.items ?? []).filter(changed) },
    ] as const
  ).filter((d) => d.items.length);

  const attention =
    grades.kind === "student" ? grades.disciplines.filter((d) => needsAttention(d.assessment)).slice(0, 4) : [];

  const activeRequests = requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).slice(0, 4);
  const unread = unreadNotifications.filter((n) => !n.read).slice(0, 3);

  const horizon = addDays(today, 21);
  const deadlines: TodayDeadline[] = [];

  if (grades.kind === "student") {
    for (const d of grades.disciplines) {
      for (const item of d.items) {
        if (item.points === null && item.dueDate >= today && item.dueDate <= horizon) {
          deadlines.push({
            kind: "assessment",
            title: `${d.subject}: ${item.title}`,
            date: item.dueDate,
            href: `/grades#discipline-${d.id}`,
          });
        }
      }
      if (d.sessionDate && d.sessionDate >= today && d.sessionDate <= horizon) {
        deadlines.push({
          kind: "session",
          title: d.subject,
          date: d.sessionDate,
          href: `/grades`,
        });
      }
    }
  }

  for (const r of activeRequests) {
    if (r.dueDate >= today && r.dueDate <= horizon) {
      deadlines.push({
        kind: "request",
        title: r.type,
        requestType: r.type,
        date: r.dueDate,
        href: `/requests/${r.id}`,
      });
    }
  }

  deadlines.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));

  return {
    kind: "student",
    firstName,
    today,
    groupCode: user.group.code,
    nextClass: next?.item ?? null,
    nextClassWhen: next?.when ?? null,
    changes: [...changes],
    attention,
    activeRequests,
    unread,
    unreadCount,
    deadlines: deadlines.slice(0, 5),
  };
}
