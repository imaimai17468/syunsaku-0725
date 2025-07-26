CREATE TABLE "rate_limits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"attempt_count" integer DEFAULT 1,
	"window_start" timestamp with time zone DEFAULT NOW(),
	"created_at" timestamp with time zone DEFAULT NOW(),
	CONSTRAINT "rate_limits_user_id_action_type_window_start_unique" UNIQUE("user_id","action_type","window_start")
);
