import React from 'react';

export default function WhyDifferent() {
  return (
    <section id="why-different" className="px-4 sm:px-6 py-28">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600 mb-4">
            The Difference
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            Grinding vs. growing.
          </h2>
          <p className="mt-3 text-slate-500 text-[15px]">
            Both take effort. Only one compounds.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Left card — The Grind Loop */}
          <div
            className="rounded-2xl p-7"
            style={{
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-600 mb-6">
              The Grind Loop
            </p>
            <ul className="space-y-4">
              {[
                'Pick a random problem',
                'Get stuck immediately',
                'Copy a solution',
                'Memorize the specific trick',
                'Freeze again next time',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="text-slate-700 text-[14px] leading-none select-none">×</span>
                  <span className="text-slate-600 text-[13px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right card — The Lock In Method */}
          <div
            className="rounded-2xl p-7"
            style={{
              border: '1px solid rgba(59,130,246,0.15)',
              background: 'rgba(59,130,246,0.04)',
            }}
          >
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-blue-400 mb-6">
              The Lock In Method
            </p>
            <ul className="space-y-4">
              {[
                'Start with the pattern',
                'Understand why it works',
                'Get hints that guide you',
                'Arrive at the answer yourself',
                'Build skills that compound',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="text-green-400 text-[14px] leading-none select-none">✓</span>
                  <span className="text-slate-300 text-[13px]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
