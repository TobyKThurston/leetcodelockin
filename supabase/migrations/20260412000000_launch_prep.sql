-- Launch-prep migration. Run manually against Supabase before public launch.
--
-- 1. stripe_webhook_events  →  idempotency store for Stripe retries.
--
-- Safe to re-run: uses `if not exists`.

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Stripe webhook idempotency
-- ───────────────────────────────────────────────────────────────────────────
-- app/api/stripe/webhook/route.ts inserts event.id here before processing.
-- Unique-violation (SQLSTATE 23505) on duplicate event → short-circuit the
-- handler and return 200 so Stripe stops retrying.

create table if not exists public.stripe_webhook_events (
  id          text primary key,
  received_at timestamptz not null default now()
);

comment on table public.stripe_webhook_events is
  'Dedup store for Stripe webhook retries. Row existence = already processed.';
