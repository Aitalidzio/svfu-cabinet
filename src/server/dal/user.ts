import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getLocale } from "@/i18n/dictionaries";
import { getSessionUserId } from "@/server/auth/session";
import { db } from "@/server/db";
import { institutes, studyGroups, users } from "@/server/db/schema";

/** What pages may know about the signed-in user. Never includes the password hash. */
export type CurrentUser = {
  id: string;
  login: string;
  role: "student" | "staff";
  fullName: string;
  recordBookNumber: string | null;
  institute: { code: string; name: string };
  group: { code: string; programCode: string; programName: string; course: number } | null;
};

/**
 * The single entry point for «who is asking». Reads the session cookie, checks the session
 * in the database and returns only the current user's own record. Cached per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const [row] = await (await db())
    .select({
      id: users.id,
      login: users.login,
      role: users.role,
      fullName: users.fullName,
      recordBookNumber: users.recordBookNumber,
      instituteCode: institutes.code,
      instituteName: institutes.name,
      groupCode: studyGroups.code,
      programCode: studyGroups.programCode,
      programName: studyGroups.programName,
      course: studyGroups.course,
    })
    .from(users)
    .innerJoin(institutes, eq(users.instituteId, institutes.id))
    .leftJoin(studyGroups, eq(users.groupId, studyGroups.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    login: row.login,
    role: row.role,
    fullName: row.fullName,
    recordBookNumber: row.recordBookNumber,
    institute: { code: row.instituteCode, name: row.instituteName },
    group:
      row.groupCode && row.programCode && row.programName && row.course !== null
        ? { code: row.groupCode, programCode: row.programCode, programName: row.programName, course: row.course }
        : null,
  };
});

/** For Server Components: the current user, or a redirect to the login page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/${await getLocale()}/login`);
  return user;
}
