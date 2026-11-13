CREATE TYPE "public"."assessment_kind" AS ENUM('current', 'midterm', 'exam');--> statement-breakpoint
CREATE TYPE "public"."control_type" AS ENUM('credit', 'graded_credit', 'exam');--> statement-breakpoint
CREATE TABLE "assessment_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"student_id" uuid NOT NULL,
	"points" smallint NOT NULL,
	"graded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"discipline_id" integer NOT NULL,
	"title" text NOT NULL,
	"kind" "assessment_kind" NOT NULL,
	"max_points" smallint NOT NULL,
	"due_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disciplines" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"subject_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	"semester" smallint NOT NULL,
	"control_type" "control_type" NOT NULL,
	"session_date" date,
	"session_room" text
);
--> statement-breakpoint
CREATE TABLE "record_book" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" uuid NOT NULL,
	"subject_id" integer NOT NULL,
	"semester" smallint NOT NULL,
	"control_type" "control_type" NOT NULL,
	"points" smallint NOT NULL,
	"mark" smallint,
	"passed" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_results" ADD CONSTRAINT "assessment_results_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_discipline_id_disciplines_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."disciplines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_group_id_study_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disciplines" ADD CONSTRAINT "disciplines_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_book" ADD CONSTRAINT "record_book_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "record_book" ADD CONSTRAINT "record_book_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_results_assessment_student_uq" ON "assessment_results" USING btree ("assessment_id","student_id");--> statement-breakpoint
CREATE INDEX "assessment_results_student_idx" ON "assessment_results" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "assessments_discipline_idx" ON "assessments" USING btree ("discipline_id");--> statement-breakpoint
CREATE UNIQUE INDEX "disciplines_group_subject_semester_uq" ON "disciplines" USING btree ("group_id","subject_id","semester");--> statement-breakpoint
CREATE UNIQUE INDEX "record_book_student_subject_semester_uq" ON "record_book" USING btree ("student_id","subject_id","semester");