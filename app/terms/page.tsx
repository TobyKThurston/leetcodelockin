import NavBar from '@/components/NavBar';
import { Footer } from '@/components/LandingPage';

export const metadata = {
  title: 'Terms of Service | LeetLockin',
  description: 'LeetLockin Terms of Service',
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

export default function TermsPage() {
  return (
    <div className="theme-light min-h-screen relative" style={pageStyle}>
      <NavBar flush theme="light" />
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-32 pb-20">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--ll-ink)', fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.02em' }}
        >
          Terms of Service
        </h1>
        <p className="text-[13px] mt-2" style={{ color: 'var(--ll-ink-subtle)' }}>Last updated: April 11, 2026</p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>1. Acceptance of Terms</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            By accessing or using LeetLockin (&quot;the Service&quot;), operated by LeetLockin (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>2. Description of Service</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            LeetLockin is an online platform that provides structured coding interview preparation, including a guided curriculum, AI-powered tutoring, code execution, and review tools. The Service may include both free and paid features.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>3. Account Terms</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must be at least 13 years of age to use the Service.</li>
            <li>One person or entity may not maintain more than one account.</li>
            <li>You are responsible for all activity that occurs under your account.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>4. Acceptable Use</h2>
          <p className="text-[14px] leading-relaxed mb-3" style={{ color: 'var(--ll-ink-muted)' }}>
            You agree not to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
            <li>Attempt to gain unauthorized access to the Service or its related systems.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Reproduce, redistribute, or resell any part of the Service without written permission.</li>
            <li>Use automated tools to scrape, crawl, or extract content from the Service.</li>
            <li>Share your account credentials with any third party.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>5. Intellectual Property</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            All content on the Service, including curriculum materials, problem descriptions, editorial content, and AI-generated explanations, is the property of LeetLockin or its licensors. You may not copy, modify, distribute, or create derivative works from any content on the Service without our prior written consent.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>6. Payment and Subscriptions</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Some features of the Service require a paid subscription (&quot;Pro&quot;).</li>
            <li>Payments are processed securely through Stripe. We do not store your payment card details.</li>
            <li>Subscriptions renew automatically unless cancelled before the end of the billing period.</li>
            <li>You may cancel your subscription at any time from the Settings page.</li>
            <li>Refunds are handled on a case-by-case basis. Contact us at <a href="mailto:tobykthurston@gmail.com" className="underline-offset-2 hover:underline" style={{ color: 'var(--ll-accent)' }}>tobykthurston@gmail.com</a> for refund requests.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>7. Disclaimers</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that any content is accurate or complete. LeetLockin is an educational tool and does not guarantee any specific outcomes, including job offers or interview success.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>8. Limitation of Liability</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            To the maximum extent permitted by law, LeetLockin shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>9. Termination</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            We may suspend or terminate your account at any time for conduct that we determine violates these Terms or is harmful to other users, us, or third parties. You may delete your account at any time by contacting us. Upon termination, your right to use the Service ceases immediately.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>10. Changes to Terms</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            We reserve the right to modify these Terms at any time. We will notify users of material changes by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the Service after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>11. Governing Law</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law provisions.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>12. Contact</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            If you have questions about these Terms, contact us at{' '}
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
