CREATE TYPE "public"."role" AS ENUM('student', 'staff');--> statement-breakpoint
CREATE TABLE "institutes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "institutes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"login" text NOT NULL,
	"ip" text NOT NULL,
	"success" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "study_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"institute_id" integer NOT NULL,
	"code" text NOT NULL,
	"program_code" text NOT NULL,
	"program_name" text NOT NULL,
	"course" integer NOT NULL,
	CONSTRAINT "study_groups_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"login" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"full_name" text NOT NULL,
	"institute_id" integer NOT NULL,
	"group_id" integer,
	"record_book_number" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_login_unique" UNIQUE("login")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_groups" ADD CONSTRAINT "study_groups_institute_id_institutes_id_fk" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_institute_id_institutes_id_fk" FOREIGN KEY ("institute_id") REFERENCES "public"."institutes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_group_id_study_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."study_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "login_attempts_login_idx" ON "login_attempts" USING btree ("login","created_at");--> statement-breakpoint
CREATE INDEX "login_attempts_ip_idx" ON "login_attempts" USING btree ("ip","created_at");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "study_groups_institute_idx" ON "study_groups" USING btree ("institute_id");--> statement-breakpoint
CREATE INDEX "users_group_idx" ON "users" USING btree ("group_id");