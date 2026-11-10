-- ═══════════════════════════════════════════════════════════════════════════
-- Ahem Corporation — Neon database sync script
-- Generated: 2026-11-10 · Run manually in the Neon SQL Editor against your app DB
-- ═══════════════════════════════════════════════════════════════════════════
--
-- WHAT THIS SCRIPT DOES
--   1. SCHEMA   — creates any missing tables   (CREATE TABLE IF NOT EXISTS)
--   2. FOREIGN KEYS — adds any missing FK constraints (guarded via pg_constraint)
--   3. INDEXES  — creates any missing indexes   (CREATE INDEX IF NOT EXISTS)
--   4. VERIFY   — SELECT queries whose expected results are noted beside them
--
-- WILL THIS CHANGE ANYTHING ON MY CURRENT DATABASE?
--   Almost certainly not — it is a no-op on an up-to-date database.
--   Verification performed before generating this file (2026-11-10):
--     • git diff 8488f0d..ecf5307 (Neon seeded state → merged redesign PR #5):
--       ZERO changes to src/db/schema.ts, drizzle/*, seed.ts, seed-data.ts
--     • drizzle-kit drift check: schema.ts matches migration 0000 exactly
--     • The merged redesign (PR #5) is CSS/components/fonts only — no DB changes
--     • Neon was already migrated + seeded at deploy of PR #1/#2 and verified
--       over HTTP (sitemap: 14 services / 9 projects / 6 tenders / 4 careers /
--       5 news / 4 legal pages)
--     • Site settings are code defaults merged with DB rows (src/lib/settings.ts
--       getSettings) — missing keys fall back automatically; no rows required
--
-- HOW TO RUN
--   Neon Dashboard → your project → SQL Editor → paste this file → Run.
--   Run it against the same database/branch as the DATABASE_URL configured in
--   Vercel (Project → Settings → Environment Variables → Production).
--   Safe to re-run any number of times. Tested twice against a fresh
--   PostgreSQL engine: applies cleanly and re-runs without errors.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 · TABLES (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"job_id" integer,
	"job_title" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"current_role" text DEFAULT '' NOT NULL,
	"experience_years" text DEFAULT '' NOT NULL,
	"cover_letter" text DEFAULT '' NOT NULL,
	"resume" jsonb,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "applications_reference_unique" UNIQUE("reference")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"actor" text DEFAULT 'System' NOT NULL,
	"action" text NOT NULL,
	"entity" text DEFAULT '' NOT NULL,
	"entity_id" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"ip" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'other' NOT NULL,
	"issuer" text,
	"number" text,
	"issued_on" date,
	"valid_until" date,
	"description" text DEFAULT '' NOT NULL,
	"file" jsonb,
	"visibility" text DEFAULT 'on_request' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'private' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"logo" text,
	"website" text,
	"authorized" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient" text NOT NULL,
	"subject" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"status" text NOT NULL,
	"error" text DEFAULT '' NOT NULL,
	"reference" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "file_blobs" (
	"file_id" text PRIMARY KEY NOT NULL,
	"data" "bytea" NOT NULL
);

CREATE TABLE IF NOT EXISTS "files" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"kind" text DEFAULT 'media' NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"uploaded_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"department" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"employment_type" text DEFAULT 'Full-time' NOT NULL,
	"experience" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"responsibilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"closing_date" date,
	"published" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "lead_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"user_id" integer,
	"actor" text DEFAULT 'System' NOT NULL,
	"action" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"reference" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"name" text NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"designation" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"sector" text DEFAULT '' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"assigned_to" integer,
	"source" text DEFAULT '' NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_reference_unique" UNIQUE("reference")
);

CREATE TABLE IF NOT EXISTS "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'announcement' NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"cover_image" text,
	"author" text DEFAULT 'Ahem Corporation' NOT NULL,
	"published_on" date,
	"published" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"link" text DEFAULT '' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"visitor_hash" text NOT NULL,
	"day" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"client_name" text,
	"client_public" boolean DEFAULT false NOT NULL,
	"city" text,
	"province" text,
	"value" text,
	"value_public" boolean DEFAULT false NOT NULL,
	"start_date" date,
	"end_date" date,
	"status" text DEFAULT 'ongoing' NOT NULL,
	"cover_image" text,
	"gallery" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video_url" text,
	"featured" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "rate_limits" (
	"key" text NOT NULL,
	"window_start" integer NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_window_start_pk" PRIMARY KEY("key","window_start")
);

CREATE TABLE IF NOT EXISTS "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"image" text,
	"icon" text DEFAULT 'building' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"user_id" integer NOT NULL,
	"ip" text,
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_hash_unique" UNIQUE("token_hash")
);

CREATE TABLE IF NOT EXISTS "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "tenders" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"reference" text NOT NULL,
	"title" text NOT NULL,
	"sector" text DEFAULT 'government' NOT NULL,
	"issuer" text NOT NULL,
	"category" text NOT NULL,
	"province" text,
	"city" text,
	"published_on" date,
	"deadline" date,
	"estimated_value" text,
	"description" text DEFAULT '' NOT NULL,
	"eligibility" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"required_docs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"instructions" text DEFAULT '' NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenders_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote" text NOT NULL,
	"author" text NOT NULL,
	"role" text DEFAULT '' NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"authorized" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'content_editor' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 · FOREIGN KEYS (only added when missing)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'applications_job_id_jobs_id_fk'
      AND conrelid = 'applications'::regclass
  ) THEN
    ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'file_blobs_file_id_files_id_fk'
      AND conrelid = 'file_blobs'::regclass
  ) THEN
    ALTER TABLE "file_blobs" ADD CONSTRAINT "file_blobs_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'files_uploaded_by_users_id_fk'
      AND conrelid = 'files'::regclass
  ) THEN
    ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lead_activities_lead_id_leads_id_fk'
      AND conrelid = 'lead_activities'::regclass
  ) THEN
    ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'lead_activities_user_id_users_id_fk'
      AND conrelid = 'lead_activities'::regclass
  ) THEN
    ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'leads_assigned_to_users_id_fk'
      AND conrelid = 'leads'::regclass
  ) THEN
    ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'sessions_user_id_users_id_fk'
      AND conrelid = 'sessions'::regclass
  ) THEN
    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 · INDEXES (idempotent)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "audit_created_idx" ON "audit_logs" USING btree ("created_at");

CREATE INDEX IF NOT EXISTS "lead_activities_lead_idx" ON "lead_activities" USING btree ("lead_id");

CREATE INDEX IF NOT EXISTS "leads_type_idx" ON "leads" USING btree ("type");

CREATE INDEX IF NOT EXISTS "leads_status_idx" ON "leads" USING btree ("status");

CREATE INDEX IF NOT EXISTS "page_views_day_idx" ON "page_views" USING btree ("day");

CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" USING btree ("user_id");

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4 · VERIFICATION — expected results from the verified seeded database
-- ─────────────────────────────────────────────────────────────────────────────

-- Content counts (expected: 14 / 9 / 6 / 4 / 5 / 4)
SELECT
  (SELECT count(*) FROM services)       AS services,        -- expect 14
  (SELECT count(*) FROM projects)       AS projects,        -- expect 9
  (SELECT count(*) FROM tenders)        AS tenders,         -- expect 6
  (SELECT count(*) FROM jobs)           AS careers,         -- expect 4
  (SELECT count(*) FROM news)           AS news,            -- expect 5
  (SELECT count(*) FROM pages)          AS legal_pages;     -- expect 4

-- CMS records (expected: 8 / 3 / 8) and admin user (expect >= 1)
SELECT
  (SELECT count(*) FROM certifications) AS certifications,  -- expect 8
  (SELECT count(*) FROM testimonials)   AS testimonials,    -- expect 3
  (SELECT count(*) FROM clients)        AS clients,         -- expect 8
  (SELECT count(*) FROM users)          AS admin_users;     -- expect >= 1

-- Redesign-critical column: service photos are read from services.image
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'services' AND column_name = 'image';   -- expect 1 row (text)

-- All 22 tables present? Expect 22 rows.
SELECT c.relname AS table_name
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

-- Settings rows (0 rows is OK: defaults live in code and are merged at read time.
-- Any rows here are admin edits made through the dashboard.)
SELECT key, updated_at FROM settings ORDER BY key;

-- Drizzle migration bookkeeping — expect 1 row with 'drizzle.__drizzle_migrations'
-- (a non-null value means the migrator has recorded its state; null on a fresh DB).
SELECT to_regclass('drizzle.__drizzle_migrations') AS migration_bookkeeping;

-- If the row above is not null, run this to count applied migrations (expect 1):
-- SELECT count(*) FROM drizzle.__drizzle_migrations;
