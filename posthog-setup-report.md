<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into LeetLockin. This includes client-side initialization via `instrumentation-client.ts`, a server-side Node client in `lib/posthog-server.ts`, a reverse proxy through `/ingest` (configured in `next.config.ts`), automatic user identification on sign-in/sign-out via a `PostHogUserIdentifier` component, 12 custom events across 9 files, exception capture in the error boundary, and a pre-built PostHog dashboard with 5 insights.

## Events instrumented

| Event | Description | File |
|---|---|---|
| `user_signed_in` | Server: OAuth callback completes; captures user ID, email, and platform | `app/auth/callback/route.ts` |
| `checkout_initiated` | Server: authenticated user is redirected to Stripe checkout | `app/checkout/route.ts` |
| `checkout_started` | User clicks a checkout CTA on the pricing page or onboarding upsell | `components/Pricing.tsx`, `components/OnboardingFlow.tsx` |
| `onboarding_completed` | User finishes the onboarding questionnaire and saves their curriculum plan | `components/OnboardingFlow.tsx` |
| `subscription_activated` | Server: Stripe `checkout.session.completed` — user subscribed | `app/api/stripe/webhook/route.ts` |
| `subscription_canceled` | Server: Stripe `customer.subscription.deleted` — subscription ended | `app/api/stripe/webhook/route.ts` |
| `problem_submitted` | Server: user submits a solution; captures slug, status, and test pass counts | `app/api/submit/route.ts` |
| `tutor_message_sent` | Server: AI tutor message successfully processed | `app/api/tutor-chat/route.ts` |
| `block_completed` | User marks a curriculum block as complete from the dashboard | `components/DashboardPage.tsx` |
| `interview_started` | User starts a new mock interview session | `components/InterviewPage.tsx` |
| `interview_submitted` | User submits their mock interview with code and test results | `components/interview/ActiveInterview.tsx` |
| *(exception capture)* | Unhandled route errors captured via `posthog.captureException()` | `app/error.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/389937/dashboard/1488956
- **Upgrade conversion funnel**: https://us.posthog.com/project/389937/insights/oqM2mwG3
- **Problem submissions (accepted vs failed)**: https://us.posthog.com/project/389937/insights/5l0M1iPL
- **Active learners (daily)**: https://us.posthog.com/project/389937/insights/qEo1TOXW
- **Subscription churn**: https://us.posthog.com/project/389937/insights/F85CFoZq
- **AI tutor usage**: https://us.posthog.com/project/389937/insights/9I2HceHE

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
