import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { DEANERY, isRequestStatus, STAFF_TRANSITIONS, type RequestStatus, type RequestType } from "@/lib/requests";
import type { ISODate } from "@/lib/calendar";
import { db } from "@/server/db";
import { requestEvents, requests, studyGroups, users } from "@/server/db/schema";
import { requireUser, type CurrentUser } from "./user";

export type RequestSummary = {
  id: number;
  type: RequestType;
  status: RequestStatus;
  dueDate: ISODate;
  createdAt: Date;
  updatedAt: Date;
};

export type StaffRequestSummary = RequestSummary & {
  studentName: string;
  groupCode: string | null;
};

export type RequestDetail = RequestSummary & {
  details: Record<string, string>;
  comment: string | null;
  rejectionReason: string | null;
  studentName: string;
  groupCode: string | null;
  studentId: string;
  events: { status: RequestStatus; note: string | null; at: Date; byStaff: boolean }[];
  /** Next statuses the current staff user may set; empty for students. */
  nextStatuses: RequestStatus[];
};

export type Deanery = (typeof DEANERY)[string] | null;

/** Students file requests; dean's office staff process them in their own cabinet. */
export async function getRequestsAccess() {
  const user = await requireUser();
  return {
    user,
    isStudent: user.role === "student",
    isStaff: user.role === "staff",
    deanery: DEANERY[user.institute.code] ?? null,
  };
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
 * Queue of requests from students of the staff member's institute.
 * Optional status filter comes from the address (`?status=`); unknown values are ignored.
 */
export async function getInstituteRequests(statusFilter?: string): Promise<StaffRequestSummary[]> {
  const user = await requireUser();
  if (user.role !== "staff") return [];

  const status = statusFilter && isRequestStatus(statusFilter) ? statusFilter : null;
  const database = await db();
  const rows = await database
    .select({
      id: requests.id,
      type: requests.type,
      status: requests.status,
      dueDate: requests.dueDate,
      createdAt: requests.createdAt,
      updatedAt: requests.updatedAt,
      studentName: users.fullName,
      groupCode: studyGroups.code,
    })
    .from(requests)
    .innerJoin(users, eq(requests.studentId, users.id))
    .leftJoin(studyGroups, eq(users.groupId, studyGroups.id))
    .where(
      status
        ? and(eq(users.instituteId, user.institute.id), eq(requests.status, status))
        : eq(users.instituteId, user.institute.id),
    )
    .orderBy(desc(requests.updatedAt), desc(requests.createdAt));

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    status: r.status,
    dueDate: r.dueDate,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    studentName: r.studentName,
    groupCode: r.groupCode,
  }));
}

/**
 * One request for the current viewer: the student owner, or staff of the same institute.
 * Anyone else's id → null → page 404 (does not reveal that the request exists).
 */
export async function getRequestForViewer(id: number): Promise<RequestDetail | null> {
  const user = await requireUser();
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const database = await db();
  const [row] = await database
    .select({
      id: requests.id,
      type: requests.type,
      status: requests.status,
      dueDate: requests.dueDate,
      createdAt: requests.createdAt,
      updatedAt: requests.updatedAt,
      details: requests.details,
      comment: requests.comment,
      rejectionReason: requests.rejectionReason,
      studentId: requests.studentId,
      studentName: users.fullName,
      studentInstituteId: users.instituteId,
      groupCode: studyGroups.code,
    })
    .from(requests)
    .innerJoin(users, eq(requests.studentId, users.id))
    .leftJoin(studyGroups, eq(users.groupId, studyGroups.id))
    .where(eq(requests.id, id))
    .limit(1);

  if (!row) return null;
  if (!canViewRequest(user, row.studentId, row.studentInstituteId)) return null;

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
    studentId: row.studentId,
    studentName: row.studentName,
    groupCode: row.groupCode,
    nextStatuses: user.role === "staff" ? [...STAFF_TRANSITIONS[row.status]] : [],
    events: history.map((e) => {
      // Seed data may leave actor_id empty when the institute has no demo staff account yet
      // (only ИМИ has one). Statuses the student never sets still count as the dean's office.
      const studentStatuses: RequestStatus[] = ["submitted", "cancelled"];
      const byStaff = e.actorRole === "staff" || (e.actorId == null && !studentStatuses.includes(e.status));
      return { status: e.status, note: e.note, at: e.at, byStaff };
    }),
  };
}

/** @deprecated Prefer getRequestForViewer — kept name for student pages that still call it. */
export async function getMyRequest(id: number): Promise<RequestDetail | null> {
  const detail = await getRequestForViewer(id);
  if (!detail) return null;
  const user = await requireUser();
  if (user.role !== "student") return null;
  return detail;
}

function canViewRequest(user: CurrentUser, studentId: string, studentInstituteId: number): boolean {
  if (user.role === "student") return user.id === studentId;
  if (user.role === "staff") return user.institute.id === studentInstituteId;
  return false;
}
