import Link from 'next/link';

export default function FinalCTA() {
  return (
    <section className="relative px-4 sm:px-6 py-32 text-center overflow-hidden">

      {/* Radial glow — stronger and tighter */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 45% at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-2xl mx-auto">

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
            className="group inline-flex items-center gap-2.5 px-9 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[15px] font-semibold rounded-xl transition-all duration-150 active:scale-[0.97] shadow-[0_0_40px_rgba(59,130,246,0.3)]"
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
