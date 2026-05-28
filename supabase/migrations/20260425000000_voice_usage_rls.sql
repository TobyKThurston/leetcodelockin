-- Lock down public.voice_usage from PostgREST.
--
-- voice_usage is a server-only quota log written/read exclusively by
-- lib/voice-quota.ts via the service-role client (lib/supabase.ts).
-- No browser/anon path touches it. Enabling RLS with no policies means
-- anon + authenticated get zero access via the API, while service role
-- (which bypasses RLS) keeps full access.
--
-- Resolves Supabase advisor: "RLS Disabled in Public" and
-- "Sensitive Columns Exposed (session_id)" on public.voice_usage.

alter table public.voice_usage enable row level security;
alter table public.voice_usage force  row level security;

revoke all on public.voice_usage from anon, authenticated;
