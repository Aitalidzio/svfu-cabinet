import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { DEANERY, type RequestStatus, type RequestType } from "@/lib/requests";
import type { ISODate } from "@/lib/calendar";
import { db } from "@/server/db";
import { requestEvents, requests, users } from "@/server/db/schema";
import { requireUser } from "./user";

export type RequestSummary = {
  id: number;
  type: RequestType;
  status: RequestStatus;
  dueDate: ISODate;
  createdAt: Date;
  updatedAt: Date;
};

export type RequestDetail = RequestSummary & {
  details: Record<string, string>;
  comment: string | null;
  rejectionReason: string | null;
  events: { status: RequestStatus; note: string | null; at: Date; byStaff: boolean }[];
};

export type Deanery = (typeof DEANERY)[string] | null;

/** Students file requests; dean's office staff process them in their own cabinet. */
export async function getRequestsAccess() {
  const user = await requireUser();
  return { user, isStudent: user.role === "student", deanery: DEANERY[user.institute.code] ?? null };
}

/** The signed-in student's own requests, newest first. */
export async function getMyRequests(): Promise<RequestSummary[]> {
  const user = await requireUser();
  if (user.role !== "student") return [];

  return (await db())
    .select({
      id: requests.id,
      type: requests.type,
      status: requests.status,
      dueDate: requests.dueDate,
      createdAt: requests.createdAt,
      updatedAt: requests.updatedAt,
    })
    .from(requests)
    .where(eq(requests.studentId, user.id))
    .orderBy(desc(requests.createdAt));
}

/**
 * One request — only if it belongs to the signed-in student. For anyone else's id the result is null
 * and the page answers 404, so it is impossible to tell whether such a request even exists.
 */
export async function getMyRequest(id: number): Promise<RequestDetail | null> {
  const user = await requireUser();
  if (user.role !== "student" || !Number.isSafeInteger(id) || id <= 0) return null;

  const database = await db();
  const [row] = await database
    .select()
    .from(requests)
    .where(and(eq(requests.id, id), eq(requests.studentId, user.id)))
    .limit(1);
  if (!row) return null;

  const history = await database
    .select({
      status: requestEvents.status,
      note: requestEvents.note,
      at: requestEvents.createdAt,
      actorId: requestEvents.actorId,
      actorRole: users.role,
    })
    .from(requestEvents)
    .leftJoin(users, eq(requestEvents.actorId, users.id))
    .where(eq(requestEvents.requestId, row.id))
    .orderBy(asc(requestEvents.createdAt), asc(requestEvents.id));

  return {
    id: row.id,
    type: row.type,
    status: row.status,
    dueDate: row.dueDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    details: row.details,
    comment: row.comment,
    rejectionReason: row.rejectionReason,
    events: history.map((e) => {
      // Seed data may leave actor_id empty when the institute has no demo staff account yet
      // (only ИМИ has one). Statuses the student never sets still count as the dean's office.
      const studentStatuses: RequestStatus[] = ["submitted", "cancelled"];
      const byStaff = e.actorRole === "staff" || (e.actorId == null && !studentStatuses.includes(e.status));
      return { status: e.status, note: e.note, at: e.at, byStaff };
    }),
  };
}
