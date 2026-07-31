CREATE TABLE IF NOT EXISTS "demo_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"tracking_code" varchar(25) NOT NULL,
	"status" varchar(20) DEFAULT 'radicado' NOT NULL,
	"form_data" jsonb NOT NULL,
	"draft_data" jsonb,
	"filed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "demo_requests_tracking_code_unique" UNIQUE("tracking_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "demo_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"user_agent" varchar(512),
	"viewport" varchar(20),
	"referrer" varchar(512),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"tracking_code" varchar(25) NOT NULL,
	"ces_score" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"status" varchar(20) NOT NULL,
	"description" varchar(255),
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracking_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"step" varchar(50),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "demo_requests" ADD CONSTRAINT "demo_requests_session_id_demo_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."demo_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback" ADD CONSTRAINT "feedback_request_id_demo_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."demo_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "status_history" ADD CONSTRAINT "status_history_request_id_demo_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."demo_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_session_id_demo_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."demo_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_tracking_code" ON "demo_requests" USING btree ("tracking_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requests_session_id" ON "demo_requests" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sessions_started_at" ON "demo_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_request_id" ON "feedback" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_feedback_tracking_code" ON "feedback" USING btree ("tracking_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_status_history_request_id" ON "status_history" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_status_history_changed_at" ON "status_history" USING btree ("changed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_session_id" ON "tracking_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_type" ON "tracking_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_events_created_at" ON "tracking_events" USING btree ("created_at");