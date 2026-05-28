import NavBar from '@/components/NavBar';
import { Footer } from '@/components/LandingPage';

export const metadata = {
  title: 'Privacy Policy | LeetLockin',
  description: 'LeetLockin Privacy Policy',
};

const pageStyle = {
  color: 'var(--ll-ink)',
  backgroundColor: 'var(--ll-bg)',
  backgroundImage: [
    'radial-gradient(ellipse 55% 45% at 78% 8%, rgba(59,130,246,0.12), transparent 70%)',
    'radial-gradient(ellipse 50% 40% at 12% 18%, rgba(56,189,248,0.10), transparent 70%)',
    'radial-gradient(ellipse 70% 50% at 50% 95%, rgba(59,130,246,0.06), transparent 72%)',
  ].join(', '),
  backgroundAttachment: 'fixed, fixed, fixed',
};

export default function PrivacyPage() {
  return (
    <div className="theme-light min-h-screen relative" style={pageStyle}>
      <NavBar flush theme="light" />
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-32 pb-20">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--ll-ink)', fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.02em' }}
        >
          Privacy Policy
        </h1>
        <p className="text-[13px] mt-2" style={{ color: 'var(--ll-ink-subtle)' }}>Last updated: April 11, 2026</p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>1. Introduction</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            LeetLockin (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the LeetLockin platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>2. Information We Collect</h2>
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'var(--ll-ink-muted)' }}>
            We collect the following types of information:
          </p>
          <h3 className="text-[15px] font-medium mb-2" style={{ color: 'var(--ll-ink)' }}>Account Information</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] mb-4" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Name and email address (provided via Google OAuth sign-in)</li>
            <li>Profile avatar (from your Google account)</li>
          </ul>
          <h3 className="text-[15px] font-medium mb-2" style={{ color: 'var(--ll-ink)' }}>Usage Data</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] mb-4" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Problems attempted and completed</li>
            <li>Curriculum progress and completed blocks</li>
            <li>Code submissions (for providing AI-powered feedback)</li>
            <li>Activity streaks and review history</li>
          </ul>
          <h3 className="text-[15px] font-medium mb-2" style={{ color: 'var(--ll-ink)' }}>Technical Data</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>IP address</li>
            <li>Pages visited and time spent</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>To provide, maintain, and improve the Service</li>
            <li>To personalize your learning experience and track your progress</li>
            <li>To generate AI-powered hints, explanations, and feedback on your code</li>
            <li>To process payments and manage subscriptions</li>
            <li>To communicate with you about your account or the Service</li>
            <li>To detect and prevent fraud, abuse, or security incidents</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>4. Third-Party Services</h2>
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'var(--ll-ink-muted)' }}>
            We use the following third-party services to operate the platform:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li><strong style={{ color: 'var(--ll-ink)' }}>Supabase</strong> — Authentication (Google OAuth) and database hosting</li>
            <li><strong style={{ color: 'var(--ll-ink)' }}>OpenAI</strong> — AI-powered tutoring, hints, and code feedback (your code submissions may be sent to OpenAI for processing)</li>
            <li><strong style={{ color: 'var(--ll-ink)' }}>Stripe</strong> — Payment processing for Pro subscriptions</li>
            <li><strong style={{ color: 'var(--ll-ink)' }}>Vercel</strong> — Application hosting and deployment</li>
          </ul>
          <p className="text-[14px] leading-relaxed mt-3" style={{ color: 'var(--ll-ink-muted)' }}>
            Each of these services has its own privacy policy governing how they handle your data.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>5. Cookies and Local Storage</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            We use cookies for authentication and session management. Curriculum progress and account preferences are stored server-side in our Supabase database, tied to your account. We may use limited browser local storage for non-essential UI state (such as theme or last-viewed tab); clearing it will not affect your saved progress.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>6. Data Retention</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            We retain your account data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where we are required by law to retain it. Anonymized, aggregated data may be retained indefinitely for analytics purposes.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>7. Your Rights</h2>
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'var(--ll-ink-muted)' }}>
            Depending on your jurisdiction, you may have the following rights:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing of your data</li>
            <li>Request a portable copy of your data</li>
          </ul>
          <p className="text-[14px] leading-relaxed mt-3" style={{ color: 'var(--ll-ink-muted)' }}>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:tobykthurston@gmail.com" className="underline-offset-2 hover:underline" style={{ color: 'var(--ll-accent)' }}>
              tobykthurston@gmail.com
            </a>.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>8. Children&apos;s Privacy</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete that information promptly.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>9. Changes to This Policy</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            We may update this Privacy Policy from time to time. We will notify you of material changes by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>10. Contact</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            If you have questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:tobykthurston@gmail.com" className="underline-offset-2 hover:underline" style={{ color: 'var(--ll-accent)' }}>
              tobykthurston@gmail.com
            </a>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
