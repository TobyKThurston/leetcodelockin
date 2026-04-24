-- Enable RLS on public.voice_usage.
--
-- The table is only written/read via the service-role client
-- (lib/voice-quota.ts → getSupabase()), which bypasses RLS. There is no
-- legitimate path that accesses voice_usage with an anon or end-user JWT,
-- so enabling RLS with no policies fully locks it down for those roles
-- while leaving the quota logic intact.
--
-- Resolves Supabase advisors:
--   - 0013_rls_disabled_in_public  (public.voice_usage)
--   - 0023_sensitive_columns_exposed (session_id)

alter table public.voice_usage enable row level security;
