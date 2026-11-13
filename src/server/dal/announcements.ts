import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { AnnouncementAudience } from "@/lib/announcements";
import { db } from "@/server/db";
import { announcements, studyGroups, users } from "@/server/db/schema";
import { requireUser } from "./user";

export type AnnouncementSummary = {
  id: number;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  course: number | null;
  groupCode: string | null;
  createdAt: Date;
};

export type InstituteGroupOption = { code: string; course: number };

/** Announcements of the staff member's institute, newest first. Students get an empty list. */
export async function getInstituteAnnouncements(): Promise<AnnouncementSummary[]> {
  const user = await requireUser();
  if (user.role !== "staff") return [];

  const rows = await (await db())
    .select({
      id: announcements.id,
      title: announcements.title,
      body: announcements.body,
      audience: announcements.audience,
      course: announcements.course,
      groupCode: studyGroups.code,
      createdAt: announcements.createdAt,
    })
    .from(announcements)
    .leftJoin(studyGroups, eq(announcements.groupId, studyGroups.id))
    .where(eq(announcements.instituteId, user.institute.id))
    .orderBy(desc(announcements.createdAt));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    audience: r.audience,
    course: r.course,
    groupCode: r.groupCode,
    createdAt: r.createdAt,
  }));
}

/** Groups of the staff member's institute — for the announce/change forms. */
export async function getStaffInstituteGroups(): Promise<InstituteGroupOption[]> {
  const user = await requireUser();
  if (user.role !== "staff") return [];

  return (await db())
    .select({ code: studyGroups.code, course: studyGroups.course })
    .from(studyGroups)
    .where(eq(studyGroups.instituteId, user.institute.id))
    .orderBy(asc(studyGroups.code));
}

/**
 * Student ids who should receive an announcement. Resolved only from the staff session
 * and validated audience — never from a client-supplied userId list.
 */
export async function resolveAnnouncementRecipients(options: {
  audience: AnnouncementAudience;
  course: number | null;
  groupId: number | null;
}): Promise<string[]> {
  const user = await requireUser();
  if (user.role !== "staff") return [];

  const database = await db();
  const conditions = [eq(users.instituteId, user.institute.id), eq(users.role, "student")];

  if (options.audience === "course" && options.course != null) {
    const groupIds = (
      await database
        .select({ id: studyGroups.id })
        .from(studyGroups)
        .where(and(eq(studyGroups.instituteId, user.institute.id), eq(studyGroups.course, options.course)))
    ).map((g) => g.id);
    if (!groupIds.length) return [];
    const rows = await database
      .select({ id: users.id })
      .from(users)
      .where(and(...conditions, inArray(users.groupId, groupIds)));
    return rows.map((r) => r.id);
  }

  if (options.audience === "group" && options.groupId != null) {
    const [group] = await database
      .select({ id: studyGroups.id })
      .from(studyGroups)
      .where(and(eq(studyGroups.id, options.groupId), eq(studyGroups.instituteId, user.institute.id)))
      .limit(1);
    if (!group) return [];
    const rows = await database
      .select({ id: users.id })
      .from(users)
      .where(and(...conditions, eq(users.groupId, group.id)));
    return rows.map((r) => r.id);
  }

  const rows = await database.select({ id: users.id }).from(users).where(and(...conditions));
  return rows.map((r) => r.id);
}
