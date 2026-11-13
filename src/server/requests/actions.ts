"use server";

import { and, count, eq, gte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import { yakutskNow } from "@/lib/calendar";
import {
  addWorkingDays,
  isRequestType,
  MAX_REQUESTS_PER_DAY,
  REQUEST_CATALOG,
  requestStatusNotification,
  type RequestType,
  validateRequest,
  validateStatusChange,
  type FieldError,
  type StatusChangeError,
} from "@/lib/requests";
import { db } from "@/server/db";
import { requestEvents, requests, users } from "@/server/db/schema";
import { getCurrentUser } from "@/server/dal/user";
import { createNotifications } from "@/server/notifications/create";

/** Russian titles for event notifications (texts stay in the original language). */
const TYPE_TITLE_RU: Record<RequestType, string> = {
  study_certificate: "Справка об обучении",
  scholarship_certificate: "Справка о размере стипендии",
  financial_aid: "Заявление на материальную помощь",
  student_card: "Повторная выдача студенческого билета",
};

export type CreateRequestState =
  | {
      errors?: Record<string, FieldError>;
      formError?: "tooMany" | "forbidden";
      /** What the student entered, so the form keeps it after a validation error. */
      values?: Record<string, string>;
    }
  | undefined;

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("lang") ?? "");
  return hasLocale(value) ? value : defaultLocale;
}

export async function createRequest(_previous: CreateRequestState, formData: FormData): Promise<CreateRequestState> {
  const locale = localeFrom(formData);
  // Re-check who is asking inside the action: never trust that the form was shown to a signed-in student.
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "student") return { formError: "forbidden" };

  const type = String(formData.get("type") ?? "");
  if (!isRequestType(type)) return { formError: "forbidden" };

  const input = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, typeof v === "string" ? v : ""]));
  const result = validateRequest(type, input);
  if (!result.ok) {
    const values = Object.fromEntries(REQUEST_CATALOG[type].fields.map((f) => [f.name, input[f.name] ?? ""]));
    return { errors: result.errors, values };
  }

  const database = await db();
  const startOfToday = new Date(`${yakutskNow(new Date()).date}T00:00:00+09:00`);
  const [{ n: today }] = await database
    .select({ n: count() })
    .from(requests)
    .where(and(eq(requests.studentId, user.id), gte(requests.createdAt, startOfToday)));
  if (today >= MAX_REQUESTS_PER_DAY) return { formError: "tooMany" };

  const dueDate = addWorkingDays(yakutskNow(new Date()).date, REQUEST_CATALOG[type].workingDays);
  const id = await database.transaction(async (tx) => {
    const [created] = await tx
      .insert(requests)
      .values({ studentId: user.id, type, details: result.details, comment: result.comment, dueDate })
      .returning({ id: requests.id });
    await tx.insert(requestEvents).values({ requestId: created.id, status: "submitted", actorId: user.id });
    return created.id;
  });

  redirect(`/${locale}/requests/${id}?created=1`);
}

/** A student may withdraw a request while the dean's office has not started on it yet. */
export async function cancelRequest(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) redirect(`/${locale}/requests`);

  const database = await db();
  await database.transaction(async (tx) => {
    // Owner and status are part of the WHERE: someone else's id or an already processed request changes nothing.
    const [cancelled] = await tx
      .update(requests)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(and(eq(requests.id, id), eq(requests.studentId, user.id), eq(requests.status, "submitted")))
      .returning({ id: requests.id });
    if (cancelled) await tx.insert(requestEvents).values({ requestId: id, status: "cancelled", actorId: user.id });
  });

  redirect(`/${locale}/requests/${id}`);
}

export type UpdateStatusState =
  | {
      error?: StatusChangeError | "notFound";
      values?: { status: string; note: string };
    }
  | undefined;

/** Dean's office: change status of a request from a student of the same institute. */
export async function updateRequestStatus(
  _previous: UpdateStatusState,
  formData: FormData,
): Promise<UpdateStatusState> {
  const locale = localeFrom(formData);
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "staff") return { error: "forbidden" };

  const id = Number(formData.get("id"));
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "notFound" };

  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "");
  const values = { status, note };

  const database = await db();
  const [row] = await database
    .select({
      id: requests.id,
      status: requests.status,
      type: requests.type,
      studentId: requests.studentId,
      instituteId: users.instituteId,
    })
    .from(requests)
    .innerJoin(users, eq(requests.studentId, users.id))
    .where(eq(requests.id, id))
    .limit(1);

  if (!row || row.instituteId !== user.institute.id) return { error: "notFound" };

  const checked = validateStatusChange(row.status, status, {
    note,
    rejectionReason: note,
  });
  if (!checked.ok) return { error: checked.error, values };

  await database.transaction(async (tx) => {
    const [updated] = await tx
      .update(requests)
      .set({
        status: checked.status,
        rejectionReason: checked.rejectionReason,
        updatedAt: new Date(),
      })
      .where(and(eq(requests.id, id), eq(requests.status, row.status)))
      .returning({ id: requests.id });
    if (!updated) return;
    await tx.insert(requestEvents).values({
      requestId: id,
      status: checked.status,
      note: checked.note,
      actorId: user.id,
    });
  });

  const message = requestStatusNotification(TYPE_TITLE_RU[row.type], checked.status);
  if (message) {
    await createNotifications([
      {
        userId: row.studentId,
        category: "requests",
        title: message.title,
        body: message.body,
        href: `/requests/${id}`,
      },
    ]);
  }

  redirect(`/${locale}/requests/${id}?updated=1`);
}
