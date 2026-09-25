-- ============================================================================
-- WeFounders.dev — Database Schema (TRD §2, §3)
-- Nepal's startup launch & beta platform: startups, testing quests, collab
-- board, eSewa/Khalti promotion ledger. Postgres 15+ / Supabase.
--
-- Apply via: Supabase SQL editor, the Management API, or `supabase db push`.
--
-- ── Identity model ──────────────────────────────────────────────────────────
-- Google sign-in is handled by Firebase. The browser exchanges a verified
-- Firebase ID token for a signed session cookie (see lib/auth/session.ts), and
-- the server provisions the `profiles` row from the verified identity. So
-- `profiles.id` is a plain uuid (derived from the Firebase uid) and does NOT
-- reference `auth.users` — Supabase Auth is not in the sign-in path.
--
-- ── Write model ─────────────────────────────────────────────────────────────
-- Public content is read with the anon key under RLS. Every write goes through
-- the service-role key on the server, after an explicit authorization check in
-- the calling action/route. That is why these tables deliberately have SELECT
-- policies and no INSERT/UPDATE/DELETE policies: RLS is the read guardrail, and
-- a client cannot write directly even if it holds the anon key.
-- ============================================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

/* -------------------------------------------------------------------------- */
/* Enums (TRD §2)                                                              */
/* -------------------------------------------------------------------------- */

create type public.user_role         as enum ('user', 'founder', 'moderator', 'admin');
create type public.startup_stage     as enum ('concept', 'closed_alpha', 'public_beta', 'launched');
create type public.target_market     as enum ('nepal_domestic', 'global_export', 'hybrid');
create type public.startup_status    as enum ('draft', 'pending_approval', 'approved', 'rejected');
create type public.quest_status      as enum ('active', 'paused', 'completed');
create type public.submission_status as enum ('pending', 'accepted', 'rejected');
create type public.collab_type       as enum ('cofounder', 'founding_engineer', 'designer', 'beta_tester', 'intern');
create type public.payment_provider  as enum ('khalti', 'esewa', 'stripe');
create type public.payment_status    as enum ('pending', 'completed', 'failed', 'refunded');

/* -------------------------------------------------------------------------- */
/* Tables                                                                      */
/* -------------------------------------------------------------------------- */

-- 1. Profiles (one per Firebase user, provisioned by the server)
create table public.profiles (
  id                uuid primary key,
  firebase_uid      text not null unique,
  email             text not null unique,
  full_name         text not null default '',
  username          text not null unique,
  avatar_url        text,
  bio               text,
  website_url       text,
  github_handle     text,
  twitter_handle    text,
  phone_number      text,
  is_phone_verified boolean not null default false,
  karma_score       integer not null default 0,
  role              public.user_role not null default 'user',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 2. Startups
create table public.startups (
  id             uuid primary key default gen_random_uuid(),
  founder_id     uuid not null references public.profiles (id) on delete cascade,
  slug           text not null unique,
  name           text not null,
  tagline        text not null,
  description    text not null default '', -- Markdown
  website_url    text not null default '',
  demo_video_url text,
  logo_url       text not null default '',
  banner_url     text,
  stage          public.startup_stage not null default 'concept',
  target_market  public.target_market not null default 'nepal_domestic',
  status         public.startup_status not null default 'pending_approval',
  launch_date    timestamptz not null default now(),
  upvotes_count    integer not null default 0,
  comments_count   integer not null default 0,
  waitlist_count   integer not null default 0,
  is_featured      boolean not null default false,
  featured_until   timestamptz,
  search_vector    tsvector generated always as (
                     to_tsvector('english',
                       coalesce(name, '') || ' ' ||
                       coalesce(tagline, '') || ' ' ||
                       coalesce(description, ''))
                   ) stored,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 3. Tags
create table public.tags (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  name      text not null,
  category  text
);

-- 4. Startup ↔ tag joins
create table public.startup_tags (
  startup_id uuid not null references public.startups (id) on delete cascade,
  tag_id     uuid not null references public.tags (id) on delete cascade,
  primary key (startup_id, tag_id)
);

-- 5. Startup media (screenshots + demo videos, backed by Storage)
create table public.startup_media (
  id            uuid primary key default gen_random_uuid(),
  startup_id    uuid not null references public.startups (id) on delete cascade,
  media_url     text not null,
  media_type    text not null default 'image' check (media_type in ('image', 'video')),
  caption       text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- 6. Upvotes (one vote per user per startup)
create table public.upvotes (
  id         uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (startup_id, user_id)
);

-- 7. Comments (founder discussion threads)
create table public.comments (
  id               uuid primary key default gen_random_uuid(),
  startup_id       uuid not null references public.startups (id) on delete cascade,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  parent_id        uuid references public.comments (id) on delete cascade,
  content          text not null check (char_length(content) between 1 and 4000),
  is_founder_reply boolean not null default false, -- "Maker / Founder" badge
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 8. Waitlist entries (beta lead capture)
create table public.waitlist_entries (
  id              uuid primary key default gen_random_uuid(),
  startup_id      uuid not null references public.startups (id) on delete cascade,
  email           text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text,
  user_id         uuid references public.profiles (id) on delete set null,
  notes           text,
  referral_source text,
  created_at      timestamptz not null default now(),
  unique (startup_id, email)
);

-- 9. Testing quests
create table public.testing_quests (
  id                 uuid primary key default gen_random_uuid(),
  startup_id         uuid not null references public.startups (id) on delete cascade,
  title              text not null,
  task_instructions  text not null default '',
  target_devices     text,
  reward_description text,
  max_submissions    integer not null default 20,
  submissions_count  integer not null default 0,
  status             public.quest_status not null default 'active',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- 10. Quest submissions (bug reports + UX/speed ratings)
create table public.quest_submissions (
  id                uuid primary key default gen_random_uuid(),
  quest_id          uuid not null references public.testing_quests (id) on delete cascade,
  tester_id         uuid references public.profiles (id) on delete set null,
  tester_name       text not null default '',
  feedback_text     text not null check (char_length(feedback_text) >= 20),
  proof_screenshots text[] not null default '{}',
  rating_ux         integer not null check (rating_ux between 1 and 5),
  rating_speed      integer not null check (rating_speed between 1 and 5),
  device_info       jsonb,
  founder_feedback  text,
  status            public.submission_status not null default 'pending',
  created_at        timestamptz not null default now()
);

-- 11. Collab & gig posts
create table public.collab_posts (
  id                     uuid primary key default gen_random_uuid(),
  author_id              uuid references public.profiles (id) on delete cascade,
  author_name            text,
  startup_id             uuid references public.startups (id) on delete set null,
  role_type              public.collab_type not null,
  title                  text not null,
  description            text not null default '',
  equity_or_compensation text,
  contact_channel        text not null, -- mailto:, wa.me, or t.me link
  is_active              boolean not null default true,
  created_at             timestamptz not null default now()
);

-- 12. Promotions & payments (eSewa / Khalti ledger, TRD §4)
create table public.promotions (
  id             uuid primary key default gen_random_uuid(),
  startup_id     uuid not null references public.startups (id) on delete cascade,
  founder_id     uuid not null references public.profiles (id) on delete cascade,
  amount_npr     numeric(10, 2) not null check (amount_npr >= 0),
  provider       public.payment_provider not null,
  transaction_id text unique,
  reference_id   text not null unique,
  plan_tier      text not null check (plan_tier in ('featured_48h', 'weekly_7d')),
  status         public.payment_status not null default 'pending',
  verified_at    timestamptz,
  created_at     timestamptz not null default now()
);

/* -------------------------------------------------------------------------- */
/* Indexes                                                                     */
/* -------------------------------------------------------------------------- */

create index startups_search_vector_idx on public.startups using gin (search_vector);
create index startups_feed_idx          on public.startups (status, upvotes_count desc);
create index startups_launch_idx        on public.startups (status, launch_date desc);
create index startups_featured_idx      on public.startups (is_featured) where is_featured;
create index startup_media_startup_idx  on public.startup_media (startup_id, display_order);
create index comments_startup_idx       on public.comments (startup_id, created_at desc);
create index comments_parent_idx        on public.comments (parent_id) where parent_id is not null;
create index waitlist_startup_idx       on public.waitlist_entries (startup_id, created_at desc);
create index quests_status_idx          on public.testing_quests (status, created_at desc);
create index submissions_quest_idx      on public.quest_submissions (quest_id, created_at desc);
create index collab_active_idx          on public.collab_posts (is_active, created_at desc);
create index promotions_startup_idx     on public.promotions (startup_id, created_at desc);
create index promotions_status_idx      on public.promotions (status, verified_at desc);

/* -------------------------------------------------------------------------- */
/* Triggers                                                                    */
/* -------------------------------------------------------------------------- */

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger startups_touch_updated_at
  before update on public.startups
  for each row execute function public.touch_updated_at();

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger comments_touch_updated_at
  before update on public.comments
  for each row execute function public.touch_updated_at();

create trigger quests_touch_updated_at
  before update on public.testing_quests
  for each row execute function public.touch_updated_at();

-- Atomic engagement counters. SECURITY DEFINER so the counter write succeeds
-- regardless of the caller's rights; trigger functions cannot be invoked
-- through the Data API, so this is not an exposed RPC.
create or replace function public.bump_startup_counter()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
  delta  integer;
begin
  if tg_table_name = 'upvotes' then
    target := coalesce(new.startup_id, old.startup_id);
    delta  := case when tg_op = 'INSERT' then 1 else -1 end;
    update public.startups
       set upvotes_count = greatest(0, upvotes_count + delta)
     where id = target;
  elsif tg_table_name = 'waitlist_entries' then
    target := coalesce(new.startup_id, old.startup_id);
    delta  := case when tg_op = 'INSERT' then 1 else -1 end;
    update public.startups
       set waitlist_count = greatest(0, waitlist_count + delta)
     where id = target;
  elsif tg_table_name = 'comments' then
    target := coalesce(new.startup_id, old.startup_id);
    delta  := case when tg_op = 'INSERT' then 1 else -1 end;
    update public.startups
       set comments_count = greatest(0, comments_count + delta)
     where id = target;
  elsif tg_table_name = 'quest_submissions' then
    target := coalesce(new.quest_id, old.quest_id);
    delta  := case when tg_op = 'INSERT' then 1 else -1 end;
    update public.testing_quests
       set submissions_count = greatest(0, submissions_count + delta)
     where id = target;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger upvotes_counter
  after insert or delete on public.upvotes
  for each row execute function public.bump_startup_counter();

create trigger waitlist_counter
  after insert or delete on public.waitlist_entries
  for each row execute function public.bump_startup_counter();

create trigger comments_counter
  after insert or delete on public.comments
  for each row execute function public.bump_startup_counter();

create trigger quest_submissions_counter
  after insert or delete on public.quest_submissions
  for each row execute function public.bump_startup_counter();

/* -------------------------------------------------------------------------- */
/* Row-Level Security                                                          */
/*                                                                             */
/* Read guardrails only — see the write-model note at the top of this file.    */
/* -------------------------------------------------------------------------- */

alter table public.profiles          enable row level security;
alter table public.startups          enable row level security;
alter table public.tags              enable row level security;
alter table public.startup_tags      enable row level security;
alter table public.startup_media     enable row level security;
alter table public.upvotes           enable row level security;
alter table public.comments          enable row level security;
alter table public.waitlist_entries  enable row level security;
alter table public.testing_quests    enable row level security;
alter table public.quest_submissions enable row level security;
alter table public.collab_posts      enable row level security;
alter table public.promotions        enable row level security;

-- Public read: profiles, tags, media, comments, quests
create policy "profiles are publicly readable"
  on public.profiles for select to anon, authenticated using (true);

create policy "tags are publicly readable"
  on public.tags for select to anon, authenticated using (true);

create policy "media is publicly readable"
  on public.startup_media for select to anon, authenticated using (true);

create policy "comments are publicly readable"
  on public.comments for select to anon, authenticated using (true);

create policy "quests are publicly readable"
  on public.testing_quests for select to anon, authenticated using (true);

-- Startups: only approved launches are public.
create policy "approved startups are public"
  on public.startups for select to anon, authenticated
  using (status = 'approved');

create policy "startup tags are publicly readable"
  on public.startup_tags for select to anon, authenticated using (true);

-- Collab board: active listings only.
create policy "active collab posts are public"
  on public.collab_posts for select to anon, authenticated
  using (is_active);

-- Upvote rows are readable so counts can be reconciled client-side.
create policy "upvotes are publicly readable"
  on public.upvotes for select to anon, authenticated using (true);

-- Private tables (waitlist_entries, quest_submissions, promotions) intentionally
-- have no anon policy: they are reachable only through the service role after a
-- server-side owner check.

/* -------------------------------------------------------------------------- */
/* API grants                                                                  */
/* -------------------------------------------------------------------------- */

grant usage on schema public to anon, authenticated;

grant select on
  public.profiles,
  public.tags,
  public.startups,
  public.startup_tags,
  public.startup_media,
  public.upvotes,
  public.comments,
  public.testing_quests,
  public.collab_posts
  to anon, authenticated;

/* -------------------------------------------------------------------------- */
/* Storage buckets                                                             */
/*                                                                             */
/* `startup-media` and `avatars` are public (CDN-served). `quest-proof` stays  */
/* private because bug-report screenshots can contain personal data.           */
/* Uploads run through the service role on the server, so no storage.objects   */
/* INSERT policy is defined — only the public read path.                       */
/* -------------------------------------------------------------------------- */

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('startup-media', 'startup-media', true, 5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml', 'video/mp4']),
  ('avatars', 'avatars', true, 2097152,
    array['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
  ('quest-proof', 'quest-proof', false, 10485760,
    array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "startup media is publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'startup-media');

create policy "avatars are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'avatars');

/* -------------------------------------------------------------------------- */
/* Reference data — the ecosystem taxonomy used by the filter UI               */
/* (not sample content: no startups, users or posts are created here)          */
/* -------------------------------------------------------------------------- */

insert into public.tags (slug, name, category) values
  ('fintech',        'Fintech',          'industry'),
  ('agritech',       'Agritech',         'industry'),
  ('climate',        'Climate',          'industry'),
  ('legaltech',      'Legaltech',        'industry'),
  ('logistics',      'Logistics',        'industry'),
  ('retail',         'Retail',           'industry'),
  ('education',      'Education',        'industry'),
  ('healthtech',     'Healthtech',       'industry'),
  ('ai-ml',          'AI/ML',            'stack'),
  ('devtools',       'DevTools',         'stack'),
  ('next-js',        'Next.js',          'stack'),
  ('supabase',       'Supabase',         'stack'),
  ('firebase',       'Firebase',         'stack'),
  ('flutter',        'Flutter',          'stack'),
  ('react-native',   'React Native',     'stack'),
  ('esewa',          'eSewa',            'payment'),
  ('khalti',         'Khalti',           'payment'),
  ('fonepay',        'Fonepay',          'payment'),
  ('sparrow-sms',    'Sparrow SMS',      'telecom'),
  ('ntc-ncell',      'NTC/Ncell Ready',  'telecom'),
  ('devanagari-ui',  'Devanagari UI',    'industry'),
  ('offline-first',  'Offline First',    'industry')
on conflict (slug) do nothing;
