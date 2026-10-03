-- Supabase's project template grants anon/authenticated ALL table privileges by
-- default, so every table here is writable from a browser holding the anon key.
-- Today Row-Level Security blocks those writes because no write policy exists,
-- but that is a single layer: one future `for all using (true)` policy, or a new
-- table created without `enable row level security`, would expose them.
--
-- No application path writes with the anon key — every insert and update goes
-- through the service role behind a server-side owner check — so removing the
-- grants costs nothing and makes the RLS layer not the only line of defence.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public
  from anon, authenticated;

alter default privileges in schema public
  revoke insert, update, delete, truncate, references, trigger
  on tables
  from anon, authenticated;
