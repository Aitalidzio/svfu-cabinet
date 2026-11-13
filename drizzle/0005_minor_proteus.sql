CREATE TYPE "public"."announcement_audience" AS ENUM('institute', 'course', 'group');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"institute_id" integer NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"audience" "announcement_audience" NOT NULL,
	"course" smallint,
	"group_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_institute_id_institutes_id_fk" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_group_id_study_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_institute_idx" ON "announcements" USING btree ("institute_id","created_at");