// Audience rules for dean's office announcements. Pure: shared by form, action and tests.

export const ANNOUNCEMENT_AUDIENCES = ["institute", "course", "group"] as const;
export type AnnouncementAudience = (typeof ANNOUNCEMENT_AUDIENCES)[number];

export const TITLE_MAX = 120;
export const BODY_MAX = 2000;

export function isAnnouncementAudience(value: string): value is AnnouncementAudience {
  return (ANNOUNCEMENT_AUDIENCES as readonly string[]).includes(value);
}

export type AnnouncementFieldError = "required" | "tooLong" | "invalid";

export type AnnouncementInput = {
  title?: string;
  body?: string;
  audience?: string;
  course?: string;
  groupCode?: string;
};

export type AnnouncementValidation =
  | {
      ok: true;
      title: string;
      body: string;
      audience: AnnouncementAudience;
      course: number | null;
      groupCode: string | null;
    }
  | { ok: false; errors: Partial<Record<"title" | "body" | "audience" | "course" | "groupCode", AnnouncementFieldError>> };

/**
 * Checks the announce form. Audience decides which extra field is required:
 * institute — none; course — course number 1…6; group — group code (resolved later in DAL).
 */
export function validateAnnouncement(input: AnnouncementInput): AnnouncementValidation {
  const errors: Partial<Record<"title" | "body" | "audience" | "course" | "groupCode", AnnouncementFieldError>> = {};
  const title = (input.title ?? "").trim();
  const body = (input.body ?? "").trim();
  const audienceRaw = (input.audience ?? "").trim();

  if (!title) errors.title = "required";
  else if (title.length > TITLE_MAX) errors.title = "tooLong";

  if (!body) errors.body = "required";
  else if (body.length > BODY_MAX) errors.body = "tooLong";

  if (!isAnnouncementAudience(audienceRaw)) errors.audience = "invalid";

  let course: number | null = null;
  let groupCode: string | null = null;

  if (audienceRaw === "course") {
    const n = Number(input.course);
    if (!Number.isInteger(n) || n < 1 || n > 6) errors.course = "invalid";
    else course = n;
  } else if (audienceRaw === "group") {
    const code = (input.groupCode ?? "").trim();
    if (!code) errors.groupCode = "required";
    else groupCode = code;
  }

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    title,
    body,
    audience: audienceRaw as AnnouncementAudience,
    course,
    groupCode,
  };
}
