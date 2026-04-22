import NavBar from '@/components/NavBar';
import { Footer } from '@/components/LandingPage';

export const metadata = {
  title: 'Security | LeetLockin',
  description: 'LeetLockin Security Practices',
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

export default function SecurityPage() {
  return (
    <div className="theme-light min-h-screen relative" style={pageStyle}>
      <NavBar flush theme="light" />
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-32 pb-20">
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: 'var(--ll-ink)', fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.02em' }}
        >
          Security
        </h1>
        <p className="text-[13px] mt-2" style={{ color: 'var(--ll-ink-subtle)' }}>Last updated: April 11, 2026</p>

        <p className="text-[14px] leading-relaxed mt-8" style={{ color: 'var(--ll-ink-muted)' }}>
          At LeetLockin, we take the security of your data seriously. This page outlines the measures we have in place to protect your information and ensure a safe learning experience.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>Infrastructure</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Our application is hosted on <strong style={{ color: 'var(--ll-ink)' }}>Vercel</strong>, which provides enterprise-grade infrastructure with automatic SSL/TLS encryption for all traffic.</li>
            <li>Our database and authentication services run on <strong style={{ color: 'var(--ll-ink)' }}>Supabase</strong>, which provides row-level security, encrypted connections, and regular security audits.</li>
            <li>All data in transit is encrypted via HTTPS (TLS 1.2+).</li>
            <li>All data at rest is encrypted using AES-256 encryption.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>Authentication</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>We use <strong style={{ color: 'var(--ll-ink)' }}>Google OAuth</strong> via Supabase Auth for sign-in. We never store your Google password.</li>
            <li>Session tokens are managed securely using HTTP-only cookies.</li>
            <li>Authentication state is validated on both the client and server side.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>Payment Security</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>All payments are processed through <strong style={{ color: 'var(--ll-ink)' }}>Stripe</strong>, a PCI DSS Level 1 certified payment processor.</li>
            <li>We never store, process, or have access to your full credit card number.</li>
            <li>Stripe handles all sensitive payment data in their secure environment.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>Code Execution</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Code you write in the editor runs <strong style={{ color: 'var(--ll-ink)' }}>entirely in your browser</strong> using Pyodide (a WebAssembly-based Python runtime).</li>
            <li>Your code is never sent to our servers for execution.</li>
            <li>Code execution is sandboxed within a Web Worker, isolated from the main page and other browser tabs.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>AI and Data Processing</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>When you use AI-powered features (hints, explanations, code feedback), your code and prompts are sent to <strong style={{ color: 'var(--ll-ink)' }}>OpenAI</strong> for processing.</li>
            <li>We use OpenAI&apos;s API, which does not use your data to train their models.</li>
            <li>AI interactions are not stored long-term beyond what is needed to provide the feature.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>Responsible Disclosure</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            If you discover a security vulnerability in LeetLockin, we appreciate your help in disclosing it responsibly. Please email us at{' '}
            <a href="mailto:tobykthurston@gmail.com" className="underline-offset-2 hover:underline" style={{ color: 'var(--ll-accent)' }}>
              tobykthurston@gmail.com
            </a>{' '}
            with details of the vulnerability. We will acknowledge your report within 48 hours and work to resolve the issue promptly.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--ll-ink)' }}>Questions</h2>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--ll-ink-muted)' }}>
            If you have questions about our security practices, contact us at{' '}
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
