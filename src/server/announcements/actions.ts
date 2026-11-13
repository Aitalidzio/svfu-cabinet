"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { validateAnnouncement, type AnnouncementFieldError } from "@/lib/announcements";
import { db } from "@/server/db";
import { announcements, studyGroups } from "@/server/db/schema";
import { resolveAnnouncementRecipients } from "@/server/dal/announcements";
import { getCurrentUser } from "@/server/dal/user";
import { createNotifications } from "@/server/notifications/create";

export type PublishAnnouncementState =
  | {
      errors?: Partial<Record<"title" | "body" | "audience" | "course" | "groupCode", AnnouncementFieldError>>;
      formError?: "forbidden" | "groupNotFound";
      values?: Record<string, string>;
    }
  | undefined;

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("lang") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

export async function publishAnnouncement(
  _previous: PublishAnnouncementState,
  formData: FormData,
): Promise<PublishAnnouncementState> {
  const locale = localeFrom(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "staff") return { formError: "forbidden" };

  const input = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const values = {
    title: input.title ?? "",
    body: input.body ?? "",
    audience: input.audience ?? "",
    course: input.course ?? "",
    groupCode: input.groupCode ?? "",
  };

  const result = validateAnnouncement(input);
  if (!result.ok) return { errors: result.errors, values };

  const database = await db();
  let groupId: number | null = null;
  if (result.audience === "group" && result.groupCode) {
    const [group] = await database
      .select({ id: studyGroups.id })
      .from(studyGroups)
      .where(and(eq(studyGroups.code, result.groupCode), eq(studyGroups.instituteId, user.institute.id)))
      .limit(1);
    if (!group) return { formError: "groupNotFound", values };
    groupId = group.id;
  }

  await database.insert(announcements).values({
    instituteId: user.institute.id,
    authorId: user.id,
    title: result.title,
    body: result.body,
    audience: result.audience,
    course: result.course,
    groupId,
  });

  const recipients = await resolveAnnouncementRecipients({
    audience: result.audience,
    course: result.course,
    groupId,
  });

  await createNotifications(
    recipients.map((userId) => ({
      userId,
      category: "deanery" as const,
      title: result.title,
      body: result.body,
      href: null,
    })),
  );

  redirect(`/${locale}/announcements?published=1`);
}
