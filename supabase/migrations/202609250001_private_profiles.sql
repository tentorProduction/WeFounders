-- Apply in Supabase SQL Editor to close the legacy public profile read policy.
-- Firebase-backed profile identity fields must never be readable by anon users.
alter table public.profiles enable row level security;
drop policy if exists "profiles are publicly readable" on public.profiles;
