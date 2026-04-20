-- Adds hidden_tests column to the problems table for LeetCode-style Submit.
--
-- Shape matches default_tests: an array of { label, inputJson, expectedJson }.
-- Only queried server-side (getProblemHiddenTests) and returned to the client
-- through the auth-gated /api/hidden-tests/[slug] route during a Submit action
-- — never included in the ProblemContent serialized into the /solve/[slug]
-- server-component payload.
--
-- Safe to re-run: `if not exists`.

alter table public.problems
  add column if not exists hidden_tests jsonb not null default '[]'::jsonb;

comment on column public.problems.hidden_tests is
  'LeetCode-style hidden test cases. Never shipped to the client with the problem; fetched via /api/hidden-tests/[slug] on Submit. Shape: [{ label, inputJson, expectedJson }].';
