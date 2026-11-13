"use server";

import { redirect } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { validateLessonChange, type ChangeFieldError } from "@/lib/schedule-changes";
import { createLessonChangeForStaff } from "@/server/dal/schedule-changes";
import { getCurrentUser } from "@/server/dal/user";
import { createNotifications } from "@/server/notifications/create";

export type CreateChangeState =
  | {
      errors?: Partial<Record<"lessonId" | "date" | "kind" | "newDate" | "newPairNumber" | "newRoom" | "reason", ChangeFieldError>>;
      formError?: "forbidden" | "notFound";
      values?: Record<string, string>;
    }
  | undefined;

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("lang") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

function changeNotification(
  kind: "cancelled" | "moved" | "modified",
  groupCode: string,
  subject: string,
): { title: string; body: string } {
  if (kind === "cancelled") {
    return {
      title: "Пара отменена",
      body: `У группы ${groupCode} отменена пара «${subject}». Откройте расписание, чтобы увидеть детали.`,
    };
  }
  if (kind === "moved") {
    return {
      title: "Пара перенесена",
      body: `У группы ${groupCode} перенесена пара «${subject}». Откройте расписание — там видно «было → стало».`,
    };
  }
  return {
    title: "Изменение в расписании",
    body: `У группы ${groupCode} изменена пара «${subject}». Откройте расписание, чтобы увидеть «было → стало».`,
  };
}

export async function createScheduleChange(
  _previous: CreateChangeState,
  formData: FormData,
): Promise<CreateChangeState> {
  const locale = localeFrom(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "staff") return { formError: "forbidden" };

  const input = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const values = {
    groupCode: input.groupCode ?? "",
    date: input.date ?? "",
    lessonId: input.lessonId ?? "",
    kind: input.kind ?? "",
    newDate: input.newDate ?? "",
    newPairNumber: input.newPairNumber ?? "",
    newRoom: input.newRoom ?? "",
    newTeacherId: input.newTeacherId ?? "",
    reason: input.reason ?? "",
  };

  const result = validateLessonChange(input);
  if (!result.ok) return { errors: result.errors, values };

  const created = await createLessonChangeForStaff(result);
  if (!created) return { formError: "notFound", values };

  const message = changeNotification(result.kind, created.groupCode, created.subject);
  await createNotifications(
    created.studentIds.map((userId) => ({
      userId,
      category: "schedule" as const,
      title: message.title,
      body: message.body,
      href: "/schedule?view=week",
    })),
  );

  redirect(`/${locale}/schedule/changes?saved=1`);
}
