import Image from 'next/image';
import Link from 'next/link';
import HeroSection from './HeroSection';
import NavBar from './NavBar';
import ProductDemo from './ProductDemo';
import UsageShowcase from './UsageShowcase';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import FinalCTA from './FinalCTA';
import FAQ from './FAQ';

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      className="relative"
      style={{
        background: 'var(--ll-bg)',
        borderTop: '1px solid var(--ll-border)',
      }}
    >
      {/* Subtle top fade so the footer feels like a natural conclusion, not a different block */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(241,245,249,0.6), transparent)',
        }}
      />
      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
              <span
                className="text-base font-bold tracking-tight"
                style={{ color: 'var(--ll-ink)', fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif', letterSpacing: '-0.02em' }}
              >
                LeetLockin
              </span>
            </div>
            <p className="text-[13px] leading-relaxed max-w-[220px]" style={{ color: 'var(--ll-ink-muted)' }}>
              Interview prep for engineers who take it seriously. Pattern-first. Hint-guided. Built to compound.
            </p>
            <a
              href="mailto:tobykthurston@gmail.com"
              className="block text-[12px] transition-colors hover:text-[var(--ll-ink)]"
              style={{ color: 'var(--ll-ink-muted)' }}
            >
              tobykthurston@gmail.com
            </a>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--ll-ink-subtle)' }}>Product</p>
            <nav className="flex flex-col gap-3">
              <Link href="/sign-in" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>Start Learning</Link>
              <a href="#curriculum" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>Curriculum</a>
              <a href="#how-it-works" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>How It Works</a>
            </nav>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--ll-ink-subtle)' }}>Company</p>
            <nav className="flex flex-col gap-3">
              <a href="mailto:tobykthurston@gmail.com" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>Contact</a>
              <a href="mailto:press@leetlockin.com" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>Press</a>
              <a href="mailto:careers@leetlockin.com" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>Careers</a>
            </nav>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase" style={{ color: 'var(--ll-ink-subtle)' }}>Legal</p>
            <nav className="flex flex-col gap-3">
              <Link href="/terms" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>Terms of Service</Link>
              <Link href="/privacy" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>Privacy Policy</Link>
              <Link href="/security" className="text-[13px] transition-colors hover:text-[var(--ll-ink)]" style={{ color: 'var(--ll-ink-muted)' }}>Security</Link>
            </nav>
          </div>
        </div>

        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--ll-border)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--ll-ink-subtle)' }}>
            &copy; {year} LeetLockin. All rights reserved.
          </span>
          <span className="text-[11px]" style={{ color: 'var(--ll-ink-subtle)' }}>Lock In</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div
      className="theme-light min-h-screen relative"
      style={{
        color: 'var(--ll-ink)',
        backgroundColor: 'var(--ll-bg)',
        backgroundImage: [
          // Stripe-style soft gradient mesh — blue + sky tints, low opacity
          'radial-gradient(ellipse 55% 45% at 78% 8%, rgba(59,130,246,0.12), transparent 70%)',
          'radial-gradient(ellipse 50% 40% at 12% 18%, rgba(56,189,248,0.10), transparent 70%)',
          'radial-gradient(ellipse 70% 50% at 50% 95%, rgba(59,130,246,0.06), transparent 72%)',
        ].join(', '),
        backgroundSize: 'auto, auto, auto',
        backgroundAttachment: 'fixed, fixed, fixed, fixed',
      }}
    >
      <NavBar theme="light" />
      <main>
        <HeroSection />
        <ProductDemo />
        <UsageShowcase />
        <HowItWorks />
        <Pricing />
        <FinalCTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
