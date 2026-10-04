-- Additive, repeatable migration for the connected platform. Server-only Neon access.
alter table profiles add column if not exists suspended_at timestamptz;
alter table profiles add column if not exists verified_at timestamptz;
alter table profiles add column if not exists location text not null default '';
alter table profiles add column if not exists skills text[] not null default '{}';
alter table profiles add column if not exists interests text[] not null default '{}';
alter table profiles add column if not exists member_roles text[] not null default '{}';
alter table profiles add column if not exists availability text not null default '';
alter table profiles add column if not exists onboarded_at timestamptz;
alter table profiles add column if not exists email_notifications boolean not null default true;
alter table profiles add column if not exists weekly_digest boolean not null default false;
alter table profiles add column if not exists referral_code uuid not null default gen_random_uuid();
create unique index if not exists profiles_referral_idx on profiles(referral_code);
alter table startups add column if not exists problem text not null default '';
alter table startups add column if not exists is_curated boolean not null default false;
alter table startups add column if not exists solution text not null default '';
alter table startups add column if not exists audience text not null default '';
alter table startups add column if not exists verified_at timestamptz;
alter table startups add column if not exists archived_at timestamptz;
alter table startups add column if not exists review_state text not null default 'submitted';
alter table startups add column if not exists moderation_notes text not null default '';
alter table startups add column if not exists logo_synced_at timestamptz;
alter table promotions add column if not exists duration_hours integer not null default 48 check(duration_hours between 1 and 720);
alter table promotions add column if not exists refund_requested_at timestamptz;
alter table promotions add column if not exists refund_note text;
alter table testing_quests add column if not exists approval_status text not null default 'approved' check(approval_status in ('pending','approved','rejected'));
alter table testing_quests add column if not exists karma_reward integer not null default 0 check(karma_reward between 0 and 500);
alter table testing_quests add column if not exists estimated_minutes integer not null default 15 check(estimated_minutes between 1 and 600);
alter table testing_quests add column if not exists deadline timestamptz;
alter table testing_quests add column if not exists required_skills text[] not null default '{}';
alter table quest_submissions add column if not exists review_state text not null default 'pending' check(review_state in ('pending','approved','needs_changes','rejected'));
alter table quest_submissions add column if not exists reviewed_by uuid references profiles(id);
alter table quest_submissions add column if not exists reviewed_at timestamptz;
alter table collab_posts add column if not exists approval_status text not null default 'approved' check(approval_status in ('pending','approved','rejected'));
alter table collab_posts add column if not exists category text not null default 'cofounder';
alter table collab_posts add column if not exists skills text[] not null default '{}';
alter table collab_posts add column if not exists location text not null default '';
alter table collab_posts add column if not exists is_remote boolean not null default true;
alter table collab_posts add column if not exists experience text not null default '';
alter table collab_posts add column if not exists is_featured boolean not null default false;
alter table waitlist_entries add column if not exists name text not null default '';
alter table waitlist_entries add column if not exists device text not null default '';
alter table waitlist_entries add column if not exists member_role text not null default '';
alter table waitlist_entries add column if not exists status text not null default 'waiting';
create unique index if not exists waitlist_email_case_idx on waitlist_entries(startup_id, lower(email));

-- `follows` is polymorphic (follower_id + target_type/target_id) — the same shape
-- db/schema.sql creates and every action queries. An older user_id/startup_id/
-- profile_id declaration here made the migration abort on the two indexes below.
create table if not exists follows (
 follower_id uuid not null references profiles(id) on delete cascade,
 target_type text not null check (target_type in ('startup','user')),
 target_id uuid not null,
 created_at timestamptz not null default now(),
 unique (follower_id, target_type, target_id)
);
create index if not exists follows_target_idx on follows(target_type,target_id);
create index if not exists follows_follower_idx on follows(follower_id);
create table if not exists bookmarks (
 user_id uuid not null references profiles(id) on delete cascade,
 startup_id uuid references startups(id) on delete cascade,
 quest_id uuid references testing_quests(id) on delete cascade,
 collab_id uuid references collab_posts(id) on delete cascade,
 created_at timestamptz not null default now(),
 check (num_nonnulls(startup_id,quest_id,collab_id)=1)
);
create unique index if not exists bookmarks_startup_idx on bookmarks(user_id,startup_id) where startup_id is not null;
create unique index if not exists bookmarks_quest_idx on bookmarks(user_id,quest_id) where quest_id is not null;
create unique index if not exists bookmarks_collab_idx on bookmarks(user_id,collab_id) where collab_id is not null;
create table if not exists quest_members (
 quest_id uuid not null references testing_quests(id) on delete cascade,
 tester_id uuid not null references profiles(id) on delete cascade,
 joined_at timestamptz not null default now(), primary key(quest_id,tester_id)
);
create table if not exists karma_transactions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id),
 amount integer not null check(amount <> 0), reason text not null,
 source_type text not null, source_id uuid not null,
 created_at timestamptz not null default now(), unique(user_id,source_type,source_id)
);
create table if not exists startup_updates (
 id uuid primary key default gen_random_uuid(), startup_id uuid not null references startups(id) on delete cascade,
 author_id uuid not null references profiles(id), title text not null, version text not null default '',
 description text not null, image_url text, link_url text, created_at timestamptz not null default now()
);
create table if not exists notifications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade,
 kind text not null, title text not null, href text not null, read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id,created_at desc);
create table if not exists audit_log (
 id uuid primary key default gen_random_uuid(), actor_id uuid references profiles(id), action text not null,
 target_type text not null, target_id text not null, details jsonb not null default '{}', created_at timestamptz not null default now()
);
create table if not exists reports (
 id uuid primary key default gen_random_uuid(), reporter_id uuid not null references profiles(id),
 target_type text not null check(target_type in ('startup','comment','profile','quest','collab')),
 target_id uuid not null, reason text not null, description text not null default '',
 status text not null default 'open' check(status in ('open','resolved','dismissed')),
 resolution text, resolved_by uuid references profiles(id), created_at timestamptz not null default now()
);
create unique index if not exists reports_open_idx on reports(reporter_id,target_type,target_id) where status='open';
create table if not exists startup_views (
 startup_id uuid not null references startups(id) on delete cascade, visitor_hash text not null,
 day date not null default current_date, source text not null default 'direct', device text not null default 'unknown',
 primary key(startup_id,visitor_hash,day)
);
create table if not exists platform_settings (
 key text primary key, value jsonb not null, updated_by uuid references profiles(id), updated_at timestamptz not null default now()
);
create table if not exists submission_drafts (
 user_id uuid primary key references profiles(id) on delete cascade, content jsonb not null default '{}', updated_at timestamptz not null default now()
);
create table if not exists comment_likes (
 comment_id uuid not null references comments(id) on delete cascade,
 user_id uuid not null references profiles(id) on delete cascade, primary key(comment_id,user_id)
);
create table if not exists collab_applications (
 id uuid primary key default gen_random_uuid(), collab_id uuid not null references collab_posts(id) on delete cascade,
 user_id uuid not null references profiles(id) on delete cascade, message text not null,
 status text not null default 'pending' check(status in ('pending','accepted','rejected')),
 created_at timestamptz not null default now(), unique(collab_id,user_id)
);
create table if not exists referrals (
 referred_id uuid primary key references profiles(id), referrer_id uuid not null references profiles(id),
 activated_at timestamptz, created_at timestamptz not null default now(), check(referred_id<>referrer_id)
);
create table if not exists rate_limits (
 key text primary key, window_start timestamptz not null, count integer not null
);

create table if not exists email_outbox (
 id uuid primary key default gen_random_uuid(), notification_id uuid not null unique references notifications(id),
 attempts integer not null default 0, delivered_at timestamptz, last_error text, locked_until timestamptz,
 created_at timestamptz not null default now()
);

create or replace function queue_notification_email() returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
 insert into email_outbox(notification_id) select new.id from profiles where id=new.user_id and email_notifications and suspended_at is null;
 return new;
end $$;
drop trigger if exists notification_email_queue on notifications;
create trigger notification_email_queue after insert on notifications for each row execute function queue_notification_email();

create or replace function notify_platform_event() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare owner_id uuid; slug_value text; title_value text; recipient uuid;
begin
 if tg_table_name='follows' then
  if new.target_type='user' then recipient:=new.target_id; else select founder_id,slug into recipient,slug_value from startups where id=new.target_id; end if;
  if recipient is not null and recipient<>new.follower_id then insert into notifications(user_id,kind,title,href) values(recipient,'follower','You have a new follower','/following'); end if;
 elsif tg_table_name='startup_updates' then
  select slug into slug_value from startups where id=new.startup_id;
  insert into notifications(user_id,kind,title,href) select follower_id,'update',new.title,'/startups/'||slug_value from follows where target_type='startup' and target_id=new.startup_id and follower_id<>new.author_id;
 elsif tg_table_name='comments' then
  select founder_id,slug into owner_id,slug_value from startups where id=new.startup_id;
  if new.parent_id is not null then select user_id into recipient from comments where id=new.parent_id; end if;
  insert into notifications(user_id,kind,title,href) select id,'comment','New discussion on your launch','/startups/'||slug_value from profiles where id in(owner_id,recipient) and id<>new.user_id;
 elsif tg_table_name='quest_submissions' then
  select s.founder_id,s.slug,q.title into owner_id,slug_value,title_value from testing_quests q join startups s on s.id=q.startup_id where q.id=new.quest_id;
  if tg_op='INSERT' then insert into notifications(user_id,kind,title,href) values(owner_id,'submission','A tester submitted feedback','/dashboard/founder');
  elsif new.status is distinct from old.status or new.review_state is distinct from old.review_state then insert into notifications(user_id,kind,title,href) values(new.tester_id,'review','Your report for '||title_value||' was reviewed','/dashboard/tester'); end if;
 elsif tg_table_name='startups' then
  if new.status is distinct from old.status or new.review_state is distinct from old.review_state then
   insert into notifications(user_id,kind,title,href) values(new.founder_id,'moderation','Your startup review: '||new.status,'/dashboard/founder');
  end if;
 elsif tg_table_name='testing_quests' then
  if new.approval_status='approved' and old.approval_status<>'approved' then
   insert into notifications(user_id,kind,title,href) select follower_id,'quest',new.title,'/quests/'||new.id from follows where target_type='startup' and target_id=new.startup_id;
  end if;
 elsif tg_table_name='collab_applications' then
  if tg_op='INSERT' then select author_id into recipient from collab_posts where id=new.collab_id; insert into notifications(user_id,kind,title,href) values(recipient,'application','New collaboration application','/dashboard/founder');
  elsif old.status<>new.status then insert into notifications(user_id,kind,title,href) values(new.user_id,'application','Your application was reviewed','/dashboard'); end if;
 elsif tg_table_name='promotions' then
  if new.status is distinct from old.status then insert into notifications(user_id,kind,title,href) values(new.founder_id,'payment','Payment status: '||new.status,'/dashboard/founder'); end if;
 end if;
 return new;
end $$;
do $$ declare t text; begin
 foreach t in array array['follows','startup_updates','comments','quest_submissions','collab_applications'] loop
  execute format('drop trigger if exists platform_notify on %I',t);
  execute format('create trigger platform_notify after insert or update on %I for each row execute function notify_platform_event()',t);
 end loop;
 foreach t in array array['startups','testing_quests','promotions'] loop
  execute format('drop trigger if exists platform_notify on %I',t);
  execute format('create trigger platform_notify after update on %I for each row execute function notify_platform_event()',t);
 end loop;
end $$;

-- Retest eligibility requires actual participation; referral rewards await real activation.
create or replace function activate_referral_on_quest() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare referred uuid; referrer uuid;
begin
 if new.status='accepted' and old.status<>'accepted' then
  update referrals set activated_at=now() where referred_id=new.tester_id and activated_at is null returning referred_id,referrer_id into referred,referrer;
  if referrer is not null then insert into karma_transactions(user_id,amount,reason,source_type,source_id) values(referrer,5,'Referral completed a verified quest','referral',referred) on conflict do nothing; end if;
 end if;
 return new;
end $$;
drop trigger if exists referral_activate on quest_submissions;
create trigger referral_activate after update on quest_submissions for each row execute function activate_referral_on_quest();

-- Constraint-level protections apply to all write paths, including legacy actions.
create or replace function guard_upvote() returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
 if not exists(select 1 from startups where id=new.startup_id and status='approved' and archived_at is null and launch_date<=now() and founder_id<>new.user_id) then
  raise exception 'Cannot vote on your own or unavailable launch';
 end if;
 return new;
end $$;
drop trigger if exists upvotes_guard on upvotes;
create trigger upvotes_guard before insert on upvotes for each row execute function guard_upvote();

create or replace function guard_quest_submission() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare q testing_quests; owner_id uuid;
begin
 select * into q from testing_quests where id=new.quest_id for update;
 select founder_id into owner_id from startups where id=q.startup_id and status='approved' and archived_at is null;
 if q.status<>'active' or q.approval_status<>'approved' or owner_id is null or owner_id=new.tester_id or new.tester_id is null or (q.deadline is not null and q.deadline<now()) then
  raise exception 'Quest is unavailable for this tester';
 end if;
 if exists(select 1 from quest_submissions where quest_id=new.quest_id and tester_id=new.tester_id) then raise exception 'Report already submitted'; end if;
 if q.submissions_count>=q.max_submissions then raise exception 'Quest is full'; end if;
 insert into quest_members(quest_id,tester_id) values(new.quest_id,new.tester_id) on conflict do nothing;
 return new;
end $$;
drop trigger if exists quest_submission_guard on quest_submissions;
create trigger quest_submission_guard before insert on quest_submissions for each row execute function guard_quest_submission();

-- Immutable, idempotent reward credit when a real submission is accepted.
create or replace function credit_quest_karma() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare points integer;
begin
 if new.status='accepted' and old.status<>'accepted' and new.tester_id is not null then
  select karma_reward into points from testing_quests where id=new.quest_id;
  if points>0 then
   insert into karma_transactions(user_id,amount,reason,source_type,source_id)
   values(new.tester_id,points,'Accepted testing report','quest',new.id) on conflict do nothing;
  end if;
 end if;
 return new;
end $$;
drop trigger if exists quest_karma_credit on quest_submissions;
create trigger quest_karma_credit after update on quest_submissions for each row execute function credit_quest_karma();
create or replace function karma_balance() returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin
 update profiles set karma_score=karma_score+new.amount where id=new.user_id;
 return new;
end $$;
drop trigger if exists karma_balance_credit on karma_transactions;
create trigger karma_balance_credit after insert on karma_transactions for each row execute function karma_balance();

-- Audit existing and future mutation paths in the same transaction.
create or replace function audit_platform_change() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare row_data jsonb; actor uuid;
begin
 row_data:=coalesce(to_jsonb(new),to_jsonb(old));
 actor:=nullif(current_setting('wf.actor',true),'')::uuid;
 if tg_table_name='profiles' and tg_op='UPDATE' then
  if new.role=old.role and new.suspended_at is not distinct from old.suspended_at and new.verified_at is not distinct from old.verified_at then return new; end if;
 end if;
 insert into audit_log(actor_id,action,target_type,target_id,details)
 values(actor,lower(tg_op),tg_table_name,coalesce(row_data->>'id',row_data->>'key'),
 jsonb_build_object('changed_fields',case when tg_op='UPDATE' then (select coalesce(jsonb_agg(key),'[]') from jsonb_each(to_jsonb(new)) where value is distinct from to_jsonb(old)->key) else '[]'::jsonb end));
 return coalesce(new,old);
end $$;
do $$ declare t text; begin
 foreach t in array array['profiles','startups','testing_quests','quest_submissions','collab_posts','comments','promotions','platform_settings','reports'] loop
  execute format('drop trigger if exists platform_audit on %I',t);
  execute format('create trigger platform_audit after update or delete on %I for each row execute function audit_platform_change()',t);
 end loop;
end $$;

-- Joining reserves a slot under the same quest lock used for report submission.
create or replace function guard_quest_member() returns trigger language plpgsql set search_path=pg_catalog,public as $$
declare q testing_quests; owner_id uuid;
begin
 select * into q from testing_quests where id=new.quest_id for update;
 if exists(select 1 from quest_members where quest_id=new.quest_id and tester_id=new.tester_id) then return new; end if;
 select founder_id into owner_id from startups where id=q.startup_id and status='approved' and archived_at is null and launch_date<=now();
 if q.id is null or q.status<>'active' or q.approval_status<>'approved' or owner_id is null or owner_id=new.tester_id or (q.deadline is not null and q.deadline<=now()) then raise exception 'Quest unavailable'; end if;
 if (select count(*) from quest_members where quest_id=q.id)>=q.max_submissions then raise exception 'Quest is full'; end if;
 return new;
end $$;
drop trigger if exists quest_member_guard on quest_members;
create trigger quest_member_guard before insert on quest_members for each row execute function guard_quest_member();
alter table startups add column if not exists beta_notes text not null default '';
alter table collab_posts add column if not exists company_name text not null default '';
-- Reputation corrections use compensating transactions, never rewritten credits.
create or replace function guard_karma_history() returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin raise exception 'Karma history is append-only'; end $$;
drop trigger if exists karma_history_guard on karma_transactions;
create trigger karma_history_guard before update or delete on karma_transactions for each row execute function guard_karma_history();

create or replace function welcome_member() returns trigger language plpgsql set search_path=pg_catalog,public as $$
begin insert into notifications(user_id,kind,title,href) values(new.id,'system','Welcome to WeFounders. Complete your builder profile.','/onboarding'); return new; end $$;
drop trigger if exists member_welcome on profiles;
create trigger member_welcome after insert on profiles for each row execute function welcome_member();
create table if not exists weekly_digest_receipts (
 user_id uuid not null references profiles(id) on delete cascade, week date not null, primary key(user_id,week)
);
