-- Voice mock interview mode.
--
-- Adds a `mode` column to distinguish silent (existing 2-problem) interviews
-- from voice (new 1-problem with AI voice interviewer) interviews. Voice
-- sessions reuse problem1_slug / problem1_code / problem1_results; problem2_*
-- stay null (so problem2_slug must be nullable).
--
-- Also creates a per-call voice_usage table so the Pro monthly cap (10/mo)
-- can be enforced without touching ai_usage (which would skew solve/tutor
-- quotas).
--
-- Safe to re-run: uses `if not exists` and idempotent `alter column`.

alter table public.mock_interviews
  add column if not exists mode text not null default 'silent';

alter table public.mock_interviews
  add column if not exists voice_scorecard jsonb;

-- Voice sessions only use problem1_*. Allow problem2_slug to be null.
alter table public.mock_interviews
  alter column problem2_slug drop not null;

create index if not exists mock_interviews_user_mode_created_idx
  on public.mock_interviews (user_id, mode, created_at desc);

create table if not exists public.voice_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  session_id  uuid,
  created_at  timestamptz not null default now()
);

create index if not exists voice_usage_user_created_idx
  on public.voice_usage (user_id, created_at desc);

comment on column public.mock_interviews.mode is
  'Interview mode: "silent" (existing 2-problem) or "voice" (1-problem voice mock with AI interviewer).';
comment on column public.mock_interviews.voice_scorecard is
  'Voice-mode scorecard JSON: { scores:{correctness,communication,complexity,problemSolving}, summaryParagraph, quotes[], suggestedNextProblems[] }.';
comment on table public.voice_usage is
  'One row per started voice session. Drives the 10-per-month Pro cap in lib/voice-quota.ts.';
