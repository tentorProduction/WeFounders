-- Run once in the Supabase SQL Editor after the intended admin has signed in
-- to WeFounders at least once. Replace the email below before running.
do $$
declare
  updated_rows integer;
begin
  update public.profiles
     set role = 'admin', updated_at = now()
   where lower(email) = lower('REPLACE_WITH_ADMIN_EMAIL');

  get diagnostics updated_rows = row_count;
  if updated_rows <> 1 then
    raise exception 'Expected one matching profile, updated % rows. Confirm the email and that the user has signed in.', updated_rows;
  end if;
end;
$$;
