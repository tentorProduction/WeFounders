-- Limit public database access to public content. App server code uses the
-- service role for comments, votes, and safe profile fields; browser clients
-- have no reason to read these raw rows or stable user IDs.
drop policy if exists "profiles are publicly readable" on public.profiles;
drop policy if exists "comments are publicly readable" on public.comments;
drop policy if exists "upvotes are publicly readable" on public.upvotes;
revoke select on public.profiles, public.comments, public.upvotes from anon, authenticated;
