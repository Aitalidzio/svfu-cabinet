import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
