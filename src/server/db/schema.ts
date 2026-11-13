import { boolean, date, index, integer, pgEnum, pgTable, serial, smallint, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

// Every value stored here is fictional (see CLAUDE.md, «Данные»).

export const roleEnum = pgEnum("role", ["student", "staff"]);

export const institutes = pgTable("institutes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
});

export const studyGroups = pgTable(
  "study_groups",
  {
    id: serial("id").primaryKey(),
    instituteId: integer("institute_id")
      .notNull()
      .references(() => institutes.id),
    code: text("code").notNull().unique(),
    programCode: text("program_code").notNull(),
    programName: text("program_name").notNull(),
    course: integer("course").notNull(),
  },
  (t) => [index("study_groups_institute_idx").on(t.instituteId)],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    login: text("login").notNull().unique(),
    // scrypt hash with a per-user salt, never the password itself (src/server/auth/password.ts)
    passwordHash: text("password_hash").notNull(),
    role: roleEnum("role").notNull(),
    fullName: text("full_name").notNull(),
    instituteId: integer("institute_id")
      .notNull()
      .references(() => institutes.id),
    // students only
    groupId: integer("group_id").references(() => studyGroups.id),
    recordBookNumber: text("record_book_number"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("users_group_idx").on(t.groupId)],
);

export const sessions = pgTable(
  "sessions",
  {
    // SHA-256 of the random session token. The token itself lives only in the user's httpOnly cookie.
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

// Used to throttle password guessing: failed attempts per login and per IP in a time window.
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    login: text("login").notNull(),
    ip: text("ip").notNull(),
    success: boolean("success").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("login_attempts_login_idx").on(t.login, t.createdAt),
    index("login_attempts_ip_idx").on(t.ip, t.createdAt),
  ],
);

// ─── Schedule ───────────────────────────────────────────────────────────────
// Regular weekly classes live in `lessons`; one-off changes for a specific date live in `lesson_changes`.
// The page builds a day as «regular classes for this weekday» + «changes for this date» → «было → стало».

export const lessonKindEnum = pgEnum("lesson_kind", ["lecture", "practice", "lab"]);
// Many Russian universities alternate odd/even weeks («числитель / знаменатель»).
export const weekParityEnum = pgEnum("week_parity", ["every", "odd", "even"]);
export const changeKindEnum = pgEnum("change_kind", ["cancelled", "moved", "modified"]);

export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(), // fictional
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    groupId: integer("group_id")
      .notNull()
      .references(() => studyGroups.id),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id),
    teacherId: integer("teacher_id")
      .notNull()
      .references(() => teachers.id),
    kind: lessonKindEnum("kind").notNull(),
    dayOfWeek: smallint("day_of_week").notNull(), // 1 = Monday … 7 = Sunday
    pairNumber: smallint("pair_number").notNull(), // 1…7, times in src/server/schedule/calendar.ts
    weekParity: weekParityEnum("week_parity").notNull().default("every"),
    room: text("room").notNull(),
  },
  (t) => [index("lessons_group_day_idx").on(t.groupId, t.dayOfWeek)],
);

export const lessonChanges = pgTable(
  "lesson_changes",
  {
    id: serial("id").primaryKey(),
    lessonId: integer("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    // The date of the regular class that is changed.
    date: date("date").notNull(),
    kind: changeKindEnum("kind").notNull(),
    // «moved»: where the class goes. «modified»: same slot, other room / teacher.
    newDate: date("new_date"),
    newPairNumber: smallint("new_pair_number"),
    newRoom: text("new_room"),
    newTeacherId: integer("new_teacher_id").references(() => teachers.id),
    reason: text("reason"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("lesson_changes_lesson_date_uq").on(t.lessonId, t.date),
    index("lesson_changes_date_idx").on(t.date),
    index("lesson_changes_new_date_idx").on(t.newDate),
  ],
);
