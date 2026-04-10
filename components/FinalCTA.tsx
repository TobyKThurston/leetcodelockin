import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="relative px-4 sm:px-6 py-32 text-center overflow-hidden">

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-xl mx-auto">

        {/* Headline */}
        <h2
          className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          <span className="text-[#e2e8f0]">Stop memorizing.</span>
          <br />
          <span style={{ color: 'rgba(148,163,184,0.5)' }}>Start understanding.</span>
        </h2>

        {/* Subtext */}
        <p className="mt-4 text-[14px] text-slate-600 leading-relaxed">
          You don&apos;t need more problems. You need a better system.
        </p>

        {/* CTA button */}
        <div className="mt-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold rounded-xl transition-colors"
          >
            Start Learning
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Below button note */}
        <p className="mt-4 text-[11px] text-slate-700">
          Free to start · No account needed
        </p>

      </div>
    </section>
  );
}
