CREATE TYPE "public"."change_kind" AS ENUM('cancelled', 'moved', 'modified');--> statement-breakpoint
CREATE TYPE "public"."lesson_kind" AS ENUM('lecture', 'practice', 'lab');--> statement-breakpoint
CREATE TYPE "public"."week_parity" AS ENUM('every', 'odd', 'even');--> statement-breakpoint
CREATE TABLE "lesson_changes" (
	"id" serial PRIMARY KEY NOT NULL,
	"lesson_id" integer NOT NULL,
	"date" date NOT NULL,
	"kind" "change_kind" NOT NULL,
	"new_date" date,
	"new_pair_number" smallint,
	"new_room" text,
	"new_teacher_id" integer,
	"reason" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"kind" "lesson_kind" NOT NULL,
	"day_of_week" smallint NOT NULL,
	"pair_number" smallint NOT NULL,
	"week_parity" "week_parity" DEFAULT 'every' NOT NULL,
	"room" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "subjects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_changes" ADD CONSTRAINT "lesson_changes_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_changes" ADD CONSTRAINT "lesson_changes_new_teacher_id_teachers_id_fk" FOREIGN KEY ("new_teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_changes" ADD CONSTRAINT "lesson_changes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_group_id_study_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "lesson_changes_lesson_date_uq" ON "lesson_changes" USING btree ("lesson_id","date");--> statement-breakpoint
CREATE INDEX "lesson_changes_date_idx" ON "lesson_changes" USING btree ("date");--> statement-breakpoint
CREATE INDEX "lesson_changes_new_date_idx" ON "lesson_changes" USING btree ("new_date");--> statement-breakpoint
CREATE INDEX "lessons_group_day_idx" ON "lessons" USING btree ("group_id","day_of_week");