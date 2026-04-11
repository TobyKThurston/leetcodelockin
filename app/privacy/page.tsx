import NavBar from '@/components/NavBar';
import { Footer } from '@/components/LandingPage';

export const metadata = {
  title: 'Privacy Policy — LeetLockin',
  description: 'LeetLockin Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-foreground">
      <NavBar flush />
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-32 pb-20">
        <h1
          className="text-3xl font-bold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          Privacy Policy
        </h1>
        <p className="text-[13px] text-slate-500 mt-2">Last updated: April 11, 2026</p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            LeetLockin LLC (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the LeetLockin platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed mb-3">
            We collect the following types of information:
          </p>
          <h3 className="text-[15px] font-medium text-slate-300 mb-2">Account Information</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400 mb-4">
            <li>Name and email address (provided via Google OAuth sign-in)</li>
            <li>Profile avatar (from your Google account)</li>
          </ul>
          <h3 className="text-[15px] font-medium text-slate-300 mb-2">Usage Data</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400 mb-4">
            <li>Problems attempted and completed</li>
            <li>Curriculum progress and completed blocks</li>
            <li>Code submissions (for providing AI-powered feedback)</li>
            <li>Activity streaks and review history</li>
          </ul>
          <h3 className="text-[15px] font-medium text-slate-300 mb-2">Technical Data</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li>Browser type and version</li>
            <li>Device information</li>
            <li>IP address</li>
            <li>Pages visited and time spent</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li>To provide, maintain, and improve the Service</li>
            <li>To personalize your learning experience and track your progress</li>
            <li>To generate AI-powered hints, explanations, and feedback on your code</li>
            <li>To process payments and manage subscriptions</li>
            <li>To communicate with you about your account or the Service</li>
            <li>To detect and prevent fraud, abuse, or security incidents</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">4. Third-Party Services</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed mb-3">
            We use the following third-party services to operate the platform:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li><strong className="text-slate-300">Supabase</strong> — Authentication (Google OAuth) and database hosting</li>
            <li><strong className="text-slate-300">OpenAI</strong> — AI-powered tutoring, hints, and code feedback (your code submissions may be sent to OpenAI for processing)</li>
            <li><strong className="text-slate-300">Stripe</strong> — Payment processing for Pro subscriptions</li>
            <li><strong className="text-slate-300">Vercel</strong> — Application hosting and deployment</li>
          </ul>
          <p className="text-[14px] text-slate-400 leading-relaxed mt-3">
            Each of these services has its own privacy policy governing how they handle your data.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">5. Cookies and Local Storage</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            We use cookies for authentication and session management. We also use browser local storage to save your curriculum progress and preferences. You can clear local storage through your browser settings, though this will reset your locally-stored progress.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">6. Data Retention</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            We retain your account data for as long as your account is active. If you request account deletion, we will remove your personal data within 30 days, except where we are required by law to retain it. Anonymized, aggregated data may be retained indefinitely for analytics purposes.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed mb-3">
            Depending on your jurisdiction, you may have the following rights:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing of your data</li>
            <li>Request a portable copy of your data</li>
          </ul>
          <p className="text-[14px] text-slate-400 leading-relaxed mt-3">
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:hello@leetlockin.com" className="text-blue-400 hover:text-blue-300">
              hello@leetlockin.com
            </a>.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">8. Children&apos;s Privacy</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            The Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete that information promptly.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">9. Changes to This Policy</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of material changes by updating the &quot;Last updated&quot; date at the top of this page. Your continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">10. Contact</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            If you have questions about this Privacy Policy, contact us at{' '}
            <a href="mailto:hello@leetlockin.com" className="text-blue-400 hover:text-blue-300">
              hello@leetlockin.com
            </a>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
