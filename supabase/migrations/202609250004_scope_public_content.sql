-- Hide media, quest instructions, and tag joins belonging to unapproved
-- startups. Quest instructions are visible only while the quest is active.
drop policy if exists "media is publicly readable" on public.startup_media;
create policy "media is publicly readable"
  on public.startup_media for select to anon, authenticated
  using (exists (
    select 1 from public.startups s
    where s.id = startup_media.startup_id and s.status = 'approved'
  ));

drop policy if exists "quests are publicly readable" on public.testing_quests;
create policy "quests are publicly readable"
  on public.testing_quests for select to anon, authenticated
  using (status = 'active' and exists (
    select 1 from public.startups s
    where s.id = testing_quests.startup_id and s.status = 'approved'
  ));

drop policy if exists "startup tags are publicly readable" on public.startup_tags;
create policy "startup tags are publicly readable"
  on public.startup_tags for select to anon, authenticated
  using (exists (
    select 1 from public.startups s
    where s.id = startup_tags.startup_id and s.status = 'approved'
  ));
