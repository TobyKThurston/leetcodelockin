# LeetCode Lockin

Interview prep that runs Python in your browser, gives you AI hints when you're stuck, and turns every solved problem into spaced-repetition flashcards built from your own code.

Live at [leetlockin.com](https://leetlockin.com).

## What it does

**Practice.** 228 LeetCode-style problems with a Monaco editor and a Python runtime that lives entirely in the browser via Pyodide in a Web Worker. No server round-trip on `Run`/`Submit`, no container orchestration, no per-submission cost.

**Tutor.** When you're stuck, GPT-4o reads your code plus the problem and either points at the wrong line or gives a progressive hint. Output is a Zod-typed object (`{ hints, pattern, steps, code }`), so the UI never has to parse a chat blob.

**Review.** After an accepted submission, the model picks the 1–4 most critical lines of your solution, blanks them out, and writes pattern + complexity cards. They come back on a spaced-repetition schedule.

A voice mock-interview mode (OpenAI TTS, full session lifecycle, AI-generated scorecard) and a four-path, 37-block curriculum with derived unlock state round it out.

## Stack

Next.js 16 (App Router) on React 19 and TypeScript. Tailwind v4 with shadcn/ui and Framer Motion. Vercel AI SDK v6 against OpenAI `gpt-4o`, with structured output enforced by Zod schemas. Supabase for Postgres and Google OAuth (`@supabase/ssr`). Stripe for subscriptions, with webhooks and Customer Portal. Pyodide for client-side Python execution. PostHog plus Vercel Analytics and Speed Insights for telemetry. Deployed on Vercel.

## A few architecture choices worth pointing at

* **Pyodide in a Worker, hard 10s timeout.** Runs are serialized through a promise chain so a rapid Run/Submit double-tap can't cross wires. Runaway code gets `worker.terminate()`d and the next call rebuilds a fresh worker.
* **Structured LLM responses.** `/api/solve` and the flashcard generator both return Zod-validated objects, not free text. The UI renders deterministically and the API never has to handle a malformed reply.
* **Stripe webhook idempotency.** A `stripe_webhook_events` table keys on `event.id`. A unique-violation on retry short-circuits the handler and returns 200, so Stripe stops retrying. Stale customer ids self-heal on the success redirect.
* **Quotas at the route layer.** Free tier gets 5 AI requests per week, Pro gets 50 per day. Voice mocks have their own quota table.
* **Prompt-injection fencing.** All user-supplied code and problem text is wrapped in delimiter guards before it hits the model.
* **Unlock state is derived, not stored.** Path N unlocks when every block in path N-1 is complete. A single `progress` row drives the dashboard, the sidebar, and the right rail.

## Local development

Requires Node 20+ and a Supabase project.

```bash
npm install
cp .env.local.example .env.local   # fill in OpenAI, Supabase, and Stripe keys
npm run dev
```

Seed the problem catalog the first time:

```bash
npm run db:seed:problems
npm run db:verify:problems
```

Required env vars (see `.env.local.example`):

```
OPENAI_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_MONTHLY
STRIPE_PRICE_ID_YEARLY
NEXT_PUBLIC_SITE_URL
```

## Layout

```
app/                  routes + API handlers (solve, submit, tutor-chat, voice/*, review/*, stripe/*)
components/           dashboard, problem page, tutor, voice, pricing, landing
lib/                  curriculum, pyodide-runner, review (SRS), subscription, streaks
content/solutions/    reference Python solutions (228)
supabase/migrations/  SQL migrations (auth, subscriptions, hidden tests, voice mocks)
scripts/              problem seeding, hidden-test generation
proxy.ts              auth-gating middleware for /dashboard, /learn, /solve
```
