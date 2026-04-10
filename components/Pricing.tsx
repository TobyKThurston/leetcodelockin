import Link from 'next/link';

export default function Pricing() {
  return (
    <section id="pricing" className="px-4 sm:px-6 py-28">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600 mb-4">
            Pricing
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Simple, honest pricing.
          </h2>
          <p className="mt-3 text-slate-500 text-[15px]">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">

          {/* Free card */}
          <div
            className="rounded-2xl p-8 flex flex-col"
            style={{
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <div>
              <p
                className="text-4xl font-bold text-white"
                style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
              >
                Free
              </p>
              <p className="text-[13px] text-slate-600 mt-1">forever</p>
            </div>

            <ul className="mt-8 space-y-3 flex-1">
              {[
                'All core patterns',
                'Unlimited hint access',
                'Python curriculum',
                '150+ problems',
                'Pattern progress tracker',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <span className="text-blue-500 text-[10px] leading-none">•</span>
                  <span className="text-[13px] text-slate-400">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/solve"
              className="bg-white text-zinc-900 rounded-xl py-3 text-[13px] font-semibold hover:bg-zinc-100 transition-colors text-center block mt-8"
            >
              Start for Free
            </Link>
          </div>

          {/* Pro card */}
          <div
            className="rounded-2xl p-8 flex flex-col"
            style={{
              border: '1px solid rgba(59,130,246,0.2)',
              background: 'rgba(59,130,246,0.05)',
            }}
          >
            <div>
              <span className="text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-block mb-4">
                Coming Soon
              </span>
              <div className="flex items-baseline gap-1">
                <p
                  className="text-4xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  $12
                </p>
                <span className="text-xl text-slate-500">/mo</span>
              </div>
              <p className="text-[13px] text-slate-600 mt-1">or $99/year</p>
            </div>

            <ul className="mt-8 space-y-3 flex-1">
              {[
                'Everything in Free',
                'Company-specific tracks',
                'Google · Meta · Amazon sets',
                'Timed mock problems',
                'System design prep',
                'Behavioral coaching',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <span className="text-blue-500 text-[10px] leading-none">•</span>
                  <span className="text-[13px] text-slate-400">{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="mailto:hello@leetlockin.com"
              className="w-full py-3 rounded-xl text-[13px] font-semibold text-center block mt-8 transition-colors border border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              Join Waitlist
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
