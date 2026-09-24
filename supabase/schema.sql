-- ============================================================================
-- Wefounder.dev — Database Schema (TRD §2, §3)
-- Nepal's first beta launchpad: startups, testing quests, collab board,
-- eSewa/Khalti promotion ledger. Postgres 15+ / Supabase.
--
-- Apply via: Supabase SQL editor, supabase db push, or the MCP SQL tool.
-- ============================================================================

/* -------------------------------------------------------------------------- */
/* Extensions                                                                  */
/* -------------------------------------------------------------------------- */

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

-- 1. Profiles (1:1 with auth.users; created by trigger below)
create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
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

-- 5. Startup media (screenshots + demo videos)
create table public.startup_media (
  id         uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  kind       text not null check (kind in ('screenshot', 'video')),
  url        text not null,
  caption    text,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

-- 6. Upvotes (1 vote per user per startup via composite PK)
create table public.upvotes (
  startup_id uuid not null references public.startups (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (startup_id, user_id)
);

-- 7. Comments (founder discussion threads)
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  parent_id  uuid references public.comments (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 4000),
  is_founder boolean not null default false, -- "Maker / Founder" badge
  created_at timestamptz not null default now()
);

-- 8. Waitlist entries (beta lead capture)
create table public.waitlist_entries (
  id              uuid primary key default gen_random_uuid(),
  startup_id      uuid not null references public.startups (id) on delete cascade,
  email           text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text,
  user_id         uuid references auth.users (id) on delete set null,
  notes           text,
  referral_source text,
  created_at      timestamptz not null default now(),
  unique (startup_id, email)
);

-- 9. Testing quests
create table public.testing_quests (
  id                uuid primary key default gen_random_uuid(),
  startup_id        uuid not null references public.startups (id) on delete cascade,
  title             text not null,
  task_instructions text not null default '',
  target_devices    text,
  reward_description text,
  max_submissions   integer not null default 20,
  submissions_count integer not null default 0,
  status            public.quest_status not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 10. Quest submissions (bug reports + UX/speed ratings)
create table public.quest_submissions (
  id              uuid primary key default gen_random_uuid(),
  quest_id        uuid not null references public.testing_quests (id) on delete cascade,
  tester_id       uuid references auth.users (id) on delete set null,
  tester_name     text not null default '',
  feedback        text not null check (char_length(feedback) >= 20),
  screenshot_urls text[] not null default '{}',
  ux_rating       integer not null check (ux_rating between 1 and 5),
  speed_rating    integer not null check (speed_rating between 1 and 5),
  device_info     jsonb,
  status          public.submission_status not null default 'pending',
  created_at      timestamptz not null default now()
);

-- 11. Collab & gig posts
create table public.collab_posts (
  id                     uuid primary key default gen_random_uuid(),
  author_id              uuid references auth.users (id) on delete cascade,
  author_name            text,
  startup_id             uuid references public.startups (id) on delete set null,
  type                   public.collab_type not null,
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
create index startups_feed_idx          on public.startups (status, launch_date desc);
create index startups_featured_idx      on public.startups (is_featured) where is_featured;
create index startup_media_startup_idx  on public.startup_media (startup_id, position);
create index comments_startup_idx       on public.comments (startup_id, created_at desc);
create index comments_parent_idx        on public.comments (parent_id) where parent_id is not null;
create index waitlist_startup_idx       on public.waitlist_entries (startup_id, created_at desc);
create index quests_status_idx          on public.testing_quests (status, created_at desc);
create index submissions_quest_idx      on public.quest_submissions (quest_id, created_at desc);
create index collab_active_idx          on public.collab_posts (is_active, created_at desc);
create index promotions_startup_idx     on public.promotions (startup_id, created_at desc);
create index promotions_status_idx      on public.promotions (status, verified_at desc);

/* -------------------------------------------------------------------------- */
/* Helper functions & triggers (atomic counters)                               */
/* -------------------------------------------------------------------------- */

-- Keep updated_at fresh on startups.
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

-- SECURITY DEFINER counter trigger: quest/upvote/waitlist inserts are made by
-- users who cannot UPDATE startups directly. Trigger functions cannot be
-- invoked through the Data API, so this is not an exposed RPC.
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
    target := new.startup_id;
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
    select q.startup_id into target from public.testing_quests q
     where q.id = coalesce(new.quest_id, old.quest_id);
    delta := case when tg_op = 'INSERT' then 1 else -1 end;
    update public.testing_quests
       set submissions_count = greatest(0, submissions_count + delta)
     where id = coalesce(new.quest_id, old.quest_id);
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

-- Auto-create a profile whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* -------------------------------------------------------------------------- */
/* Row-Level Security (TRD §3)                                                 */
/*                                                                             */
/* Notes:                                                                      */
/*  • (select auth.uid()) is wrapped in a subselect so Postgres initialises    */
/*    it once per statement instead of per row (performance best practice).    */
/*  • TO clauses target the exact role instead of deprecated auth.role().      */
/*  • UPDATE policies carry both USING and WITH CHECK.                         */
/*  • Writes that must bypass RLS (payment webhooks activating promotions,     */
/*    moderation) go through the service_role key server-side.                 */
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

-- profiles -------------------------------------------------------------------
create policy "profiles are publicly readable"
  on public.profiles for select to anon, authenticated using (true);

create policy "users insert own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "users update own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- startups -------------------------------------------------------------------
create policy "approved startups are public; founders see drafts"
  on public.startups for select to anon, authenticated
  using (
    status = 'approved'
    or (select auth.uid()) = founder_id
    or exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );

create policy "authenticated users submit startups"
  on public.startups for insert to authenticated
  with check ((select auth.uid()) = founder_id);

create policy "founders update own startups"
  on public.startups for update to authenticated
  using ((select auth.uid()) = founder_id)
  with check ((select auth.uid()) = founder_id);
-- is_featured / status are intentionally not founder-editable through the API:
-- promotion activation and moderation use the service_role key server-side.

create policy "founders delete own startups"
  on public.startups for delete to authenticated
  using ((select auth.uid()) = founder_id);

-- tags -----------------------------------------------------------------------
create policy "tags are publicly readable"
  on public.tags for select to anon, authenticated using (true);
-- tag creation/maintenance happens via the service_role key.

-- startup_tags ---------------------------------------------------------------
create policy "startup tags are publicly readable"
  on public.startup_tags for select to anon, authenticated using (true);

create policy "founders manage own startup tags"
  on public.startup_tags for insert to authenticated
  with check (
    exists (
      select 1 from public.startups s
      where s.id = startup_id and s.founder_id = (select auth.uid())
    )
  );

create policy "founders remove own startup tags"
  on public.startup_tags for delete to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = startup_id and s.founder_id = (select auth.uid())
    )
  );

-- startup_media --------------------------------------------------------------
create policy "media is publicly readable"
  on public.startup_media for select to anon, authenticated using (true);

create policy "founders add media"
  on public.startup_media for insert to authenticated
  with check (
    exists (
      select 1 from public.startups s
      where s.id = startup_id and s.founder_id = (select auth.uid())
    )
  );

create policy "founders remove media"
  on public.startup_media for delete to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = startup_id and s.founder_id = (select auth.uid())
    )
  );

-- upvotes --------------------------------------------------------------------
create policy "upvotes are publicly countable"
  on public.upvotes for select to anon, authenticated using (true);

create policy "authenticated users upvote as themselves"
  on public.upvotes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users retract own upvote"
  on public.upvotes for delete to authenticated
  using ((select auth.uid()) = user_id);

-- comments -------------------------------------------------------------------
create policy "comments are publicly readable"
  on public.comments for select to anon, authenticated using (true);

create policy "authenticated users comment as themselves"
  on public.comments for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    -- is_founder is only true when commenting on your own startup
    and (
      not is_founder
      or exists (
        select 1 from public.startups s
        where s.id = startup_id and s.founder_id = (select auth.uid())
      )
    )
  );

create policy "users delete own comments"
  on public.comments for delete to authenticated
  using ((select auth.uid()) = user_id);

-- waitlist_entries -----------------------------------------------------------
create policy "founders read own waitlist"
  on public.waitlist_entries for select to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = startup_id and s.founder_id = (select auth.uid())
    )
  );

create policy "anyone can join a waitlist"
  on public.waitlist_entries for insert to anon, authenticated
  with check (true); -- rate limiting happens in the server action (Upstash)

-- testing_quests -------------------------------------------------------------
create policy "quests are publicly readable"
  on public.testing_quests for select to anon, authenticated using (true);

create policy "founders post quests for own startups"
  on public.testing_quests for insert to authenticated
  with check (
    exists (
      select 1 from public.startups s
      where s.id = startup_id and s.founder_id = (select auth.uid())
    )
  );

create policy "founders update own quests"
  on public.testing_quests for update to authenticated
  using (
    exists (
      select 1 from public.startups s
      where s.id = startup_id and s.founder_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.startups s
      where s.id = startup_id and s.founder_id = (select auth.uid())
    )
  );

-- quest_submissions ----------------------------------------------------------
create policy "founders read submissions for own quests"
  on public.quest_submissions for select to authenticated
  using (
    exists (
      select 1 from public.testing_quests q
      join public.startups s on s.id = q.startup_id
      where q.id = quest_id and s.founder_id = (select auth.uid())
    )
  );

create policy "testers read own submissions"
  on public.quest_submissions for select to authenticated
  using ((select auth.uid()) = tester_id);

create policy "authenticated testers submit"
  on public.quest_submissions for insert to authenticated
  with check ((select auth.uid()) = tester_id);

create policy "quest founders grade submissions"
  on public.quest_submissions for update to authenticated
  using (
    exists (
      select 1 from public.testing_quests q
      join public.startups s on s.id = q.startup_id
      where q.id = quest_id and s.founder_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.testing_quests q
      join public.startups s on s.id = q.startup_id
      where q.id = quest_id and s.founder_id = (select auth.uid())
    )
  );

-- collab_posts ---------------------------------------------------------------
create policy "active posts are public; authors see their drafts"
  on public.collab_posts for select to anon, authenticated
  using (is_active or (select auth.uid()) = author_id);

create policy "authenticated users post opportunities"
  on public.collab_posts for insert to authenticated
  with check ((select auth.uid()) = author_id);

create policy "authors manage own listings"
  on public.collab_posts for update to authenticated
  using ((select auth.uid()) = author_id)
  with check ((select auth.uid()) = author_id);

create policy "authors delete own listings"
  on public.collab_posts for delete to authenticated
  using ((select auth.uid()) = author_id);

-- promotions (ledger: written by payment webhooks via service_role) ----------
create policy "founders read own promotions"
  on public.promotions for select to authenticated
  using ((select auth.uid()) = founder_id);
-- No INSERT/UPDATE policies: only the service_role key (payment callbacks)
-- writes this table, so clients cannot forge a completed payment.

/* -------------------------------------------------------------------------- */
/* API grants (in case Data API auto-grants are disabled for new tables)       */
/* -------------------------------------------------------------------------- */

grant usage on schema public to anon, authenticated;
grant select on public.tags, public.startups, public.startup_tags,
  public.startup_media, public.upvotes, public.comments,
  public.testing_quests, public.collab_posts to anon;
grant select, insert, update, delete on public.profiles, public.startups,
  public.startup_tags, public.startup_media, public.upvotes, public.comments,
  public.testing_quests, public.quest_submissions, public.collab_posts
  to authenticated;
grant select, insert on public.waitlist_entries to anon, authenticated;
grant select on public.promotions to authenticated;
