-- Bind each Khalti pidx to exactly one promotion so a completed payment
-- cannot be replayed against a different pending promotion.
alter table public.promotions add column if not exists payment_intent_id text;
create unique index if not exists promotions_payment_intent_id_key
  on public.promotions (payment_intent_id)
  where payment_intent_id is not null;
