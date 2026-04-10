import Image from 'next/image';
import Link from 'next/link';
import HeroSection from './HeroSection';
import NavBar from './NavBar';
import ProductDemo from './ProductDemo';
import Roadmap from './Roadmap';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import FinalCTA from './FinalCTA';

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: '#070c17', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">

          {/* Brand column */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5">
                <Image src="/logo.png" alt="" width={20} height={20} className="rounded-[4px]" />
                <span
                  className="text-base font-bold text-white tracking-tight"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif', letterSpacing: '-0.02em' }}
                >
                  LeetLockin
                </span>
              </div>
              <span className="ml-2 text-[11px] font-mono text-slate-700 tracking-widest uppercase">
                LLC
              </span>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed max-w-[220px]">
              Interview prep for engineers who take it seriously. Pattern-first. Hint-guided. Built to compound.
            </p>
            <a
              href="mailto:hello@leetlockin.com"
              className="block text-[12px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              hello@leetlockin.com
            </a>
          </div>

          {/* Product column */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-slate-700 tracking-[0.18em] uppercase">
              Product
            </p>
            <nav className="flex flex-col gap-3">
              <Link href="/dashboard" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
                Start Learning
              </Link>
              <a href="#curriculum" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
                Curriculum
              </a>
              <a href="#demo" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
                How It Works
              </a>
            </nav>
          </div>

          {/* Company column */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-slate-700 tracking-[0.18em] uppercase">
              Company
            </p>
            <nav className="flex flex-col gap-3">
              <a
                href="mailto:hello@leetlockin.com"
                className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Contact
              </a>
              <a
                href="mailto:press@leetlockin.com"
                className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Press
              </a>
              <a
                href="mailto:careers@leetlockin.com"
                className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                Careers
              </a>
            </nav>
          </div>

          {/* Legal column */}
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-slate-700 tracking-[0.18em] uppercase">
              Legal
            </p>
            <nav className="flex flex-col gap-3">
              <Link href="/terms" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/security" className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">
                Security
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-14 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
        >
          <span className="text-[11px] text-slate-800">
            &copy; {year} LeetLockin LLC. All rights reserved.
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-800">Lock In</span>
            <span className="text-slate-800 text-[10px]">&middot;</span>
            <span className="text-[11px] text-slate-800">A product of LeetLockin LLC</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-foreground">
      <NavBar />
      <main>
        <HeroSection />
        <ProductDemo />
        <Roadmap />
        <HowItWorks />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
