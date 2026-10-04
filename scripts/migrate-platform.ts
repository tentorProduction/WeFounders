import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = neon(url);

const statements = [
  `ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS roles text[] NOT NULL DEFAULT '{"user"}',
    ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS location text,
    ADD COLUMN IF NOT EXISTS availability text,
    ADD COLUMN IF NOT EXISTS portfolio_url text,
    ADD COLUMN IF NOT EXISTS followers_count integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0`,

  `ALTER TABLE public.startups
    ADD COLUMN IF NOT EXISTS followers_count integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false`,

  `DROP TABLE IF EXISTS public.follows CASCADE`,
  `CREATE TABLE public.follows (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    target_type text NOT NULL CHECK (target_type IN ('startup', 'user')),
    target_id   uuid NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (follower_id, target_type, target_id)
  )`,

  `CREATE TABLE IF NOT EXISTS public.saved_items (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    item_type  text NOT NULL CHECK (item_type IN ('startup', 'quest', 'collab')),
    item_id    uuid NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, item_type, item_id)
  )`,

  `CREATE TABLE IF NOT EXISTS public.project_updates (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id  uuid NOT NULL REFERENCES public.startups (id) ON DELETE CASCADE,
    author_id   uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    version     text NOT NULL DEFAULT 'v1.0',
    title       text NOT NULL,
    content     text NOT NULL,
    media_urls  text[] NOT NULL DEFAULT '{}',
    created_at  timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS public.karma_ledger (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    amount      integer NOT NULL,
    reason      text NOT NULL,
    source_type text NOT NULL,
    source_id   uuid,
    created_at  timestamptz NOT NULL DEFAULT now()
  )`,

  `DROP TABLE IF EXISTS public.notifications CASCADE`,
  `CREATE TABLE public.notifications (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    type       text NOT NULL,
    title      text NOT NULL,
    message    text NOT NULL,
    link       text,
    is_read    boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS public.reports (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    target_type text NOT NULL CHECK (target_type IN ('startup', 'comment', 'user', 'quest', 'collab')),
    target_id   uuid NOT NULL,
    reason      text NOT NULL,
    details     text,
    status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'actioned')),
    created_at  timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS public.audit_logs (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id    uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    action      text NOT NULL,
    target_type text NOT NULL,
    target_id   text NOT NULL,
    metadata    jsonb DEFAULT '{}'::jsonb,
    created_at  timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS public.platform_settings (
    key        text PRIMARY KEY,
    value      jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`,

  `CREATE INDEX IF NOT EXISTS follows_target_idx ON public.follows (target_type, target_id)`,
  `CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows (follower_id)`,
  `CREATE INDEX IF NOT EXISTS saved_items_user_idx ON public.saved_items (user_id, item_type)`,
  `CREATE INDEX IF NOT EXISTS project_updates_startup_idx ON public.project_updates (startup_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS karma_ledger_user_idx ON public.karma_ledger (user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications (user_id, is_read, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports (status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs (created_at DESC)`,

  // Ensure littlefault1@gmail.com is ADMIN
  `UPDATE public.profiles SET role = 'admin' WHERE email = 'littlefault1@gmail.com'`
];

async function run() {
  console.log("Running platform schema migration...");
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    await sql.query(stmt);
    console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
  }
  console.log("Platform schema migration completed successfully!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
