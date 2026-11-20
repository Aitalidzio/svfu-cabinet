import "server-only";
import { cache } from "react";
import { and, count, eq, inArray } from "drizzle-orm";
import { io } from "next/cache";
import type { Level } from "@/lib/brs";
import { yakutskNow } from "@/lib/calendar";
import type { TaasSnapshot } from "@/lib/taas";
import { db } from "@/server/db";
import { requests, users } from "@/server/db/schema";
import { getMyGrades } from "./grades";
import { getUnreadNotificationCount } from "./notifications";
import { getCurrentUser } from "./user";

const levelRank: Record<Level, number> = { danger: 0, warning: 1, info: 2, success: 3 };

/** Compact cue inputs for the mascot. Cached once per request. */
export const getTaasSnapshot = cache(async (): Promise<TaasSnapshot | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  await io();
  const { minutes } = yakutskNow(new Date());
  const unreadCount = await getUnreadNotificationCount();

  if (user.role === "staff") {
    const database = await db();
    const [row] = await database
      .select({ n: count() })
      .from(requests)
      .innerJoin(users, eq(requests.studentId, users.id))
      .where(and(eq(users.instituteId, user.institute.id), inArray(requests.status, ["submitted", "in_progress"])));

    return {
      role: "staff",
      unreadCount,
      yakutskMinutes: minutes,
      gradeLevel: null,
      readyRequest: false,
      pendingQueue: Number(row?.n ?? 0),
    };
  }

  const grades = await getMyGrades();
  let gradeLevel: Level | null = null;
  if (grades.kind === "student" && grades.disciplines.length > 0) {
    gradeLevel = grades.disciplines.reduce<Level>((worst, d) => {
      return levelRank[d.assessment.level] < levelRank[worst] ? d.assessment.level : worst;
    }, "success");
  }

  const myRequests = await (await db())
    .select({ status: requests.status })
    .from(requests)
    .where(eq(requests.studentId, user.id));
  const readyRequest = myRequests.some((r) => r.status === "ready");

  return {
    role: "student",
    unreadCount,
    yakutskMinutes: minutes,
    gradeLevel,
    readyRequest,
    pendingQueue: 0,
  };
});
