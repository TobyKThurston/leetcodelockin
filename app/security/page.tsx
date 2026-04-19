import NavBar from '@/components/NavBar';
import { Footer } from '@/components/LandingPage';

export const metadata = {
  title: 'Security | LeetLockin',
  description: 'LeetLockin Security Practices',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-foreground">
      <NavBar flush />
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-32 pb-20">
        <h1
          className="text-3xl font-bold text-white tracking-tight"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          Security
        </h1>
        <p className="text-[13px] text-slate-500 mt-2">Last updated: April 11, 2026</p>

        <p className="text-[14px] text-slate-400 leading-relaxed mt-8">
          At LeetLockin, we take the security of your data seriously. This page outlines the measures we have in place to protect your information and ensure a safe learning experience.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">Infrastructure</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li>Our application is hosted on <strong className="text-slate-300">Vercel</strong>, which provides enterprise-grade infrastructure with automatic SSL/TLS encryption for all traffic.</li>
            <li>Our database and authentication services run on <strong className="text-slate-300">Supabase</strong>, which provides row-level security, encrypted connections, and regular security audits.</li>
            <li>All data in transit is encrypted via HTTPS (TLS 1.2+).</li>
            <li>All data at rest is encrypted using AES-256 encryption.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">Authentication</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li>We use <strong className="text-slate-300">Google OAuth</strong> via Supabase Auth for sign-in. We never store your Google password.</li>
            <li>Session tokens are managed securely using HTTP-only cookies.</li>
            <li>Authentication state is validated on both the client and server side.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">Payment Security</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li>All payments are processed through <strong className="text-slate-300">Stripe</strong>, a PCI DSS Level 1 certified payment processor.</li>
            <li>We never store, process, or have access to your full credit card number.</li>
            <li>Stripe handles all sensitive payment data in their secure environment.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">Code Execution</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li>Code you write in the editor runs <strong className="text-slate-300">entirely in your browser</strong> using Pyodide (a WebAssembly-based Python runtime).</li>
            <li>Your code is never sent to our servers for execution.</li>
            <li>Code execution is sandboxed within a Web Worker, isolated from the main page and other browser tabs.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">AI and Data Processing</h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[14px] text-slate-400">
            <li>When you use AI-powered features (hints, explanations, code feedback), your code and prompts are sent to <strong className="text-slate-300">OpenAI</strong> for processing.</li>
            <li>We use OpenAI&apos;s API, which does not use your data to train their models.</li>
            <li>AI interactions are not stored long-term beyond what is needed to provide the feature.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">Responsible Disclosure</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            If you discover a security vulnerability in LeetLockin, we appreciate your help in disclosing it responsibly. Please email us at{' '}
            <a href="mailto:hello@leetlockin.com" className="text-blue-400 hover:text-blue-300">
              hello@leetlockin.com
            </a>{' '}
            with details of the vulnerability. We will acknowledge your report within 48 hours and work to resolve the issue promptly.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-3">Questions</h2>
          <p className="text-[14px] text-slate-400 leading-relaxed">
            If you have questions about our security practices, contact us at{' '}
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
