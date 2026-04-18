import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="px-4 sm:px-6 py-24 text-center">

      <div className="relative max-w-2xl mx-auto rounded-2xl border border-white/10 bg-white/[0.02] px-6 sm:px-10 py-16 sm:py-20">

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        {/* Eyebrow */}
        <p className="text-[11px] text-blue-400/60 tracking-[0.2em] uppercase font-medium mb-6">
          Ready to lock in?
        </p>

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          <span className="text-[#e2e8f0]">Stop memorizing.</span>
          <br />
          <span className="text-slate-500">Start understanding.</span>
        </h2>

        {/* Subtext */}
        <p className="mt-5 text-[15px] text-slate-500 leading-relaxed max-w-md mx-auto">
          You don&apos;t need more problems. You need a better system.
        </p>

        {/* CTA button */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/sign-in"
            className="group inline-flex items-center gap-2.5 px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-semibold rounded-xl ring-1 ring-inset ring-white/10 transition-all duration-150 active:scale-[0.97]"
          >
            Start Learning
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform duration-100">→</span>
          </Link>
          <p className="text-[12px] text-slate-700">
            Free to start · No credit card required
          </p>
        </div>

      </div>
    </section>
  );
}
