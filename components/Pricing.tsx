import Link from 'next/link';
import { Check } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SHIPPED_FEATURES = [
  'AI Socratic tutor — guides you, never hands you the answer',
  '4 learning paths, 37 skill blocks',
  'Python Foundations lessons from variables to functions',
  'Core Data Structures: arrays, hashmaps, trees, graphs, heaps',
  'Pattern Library covering every interview pattern',
  'Interview Ready track for the final mile',
  'Progress tracking across paths and blocks',
  'Pattern recognition tracker so you see what you know',
];

export default function Pricing() {
  return (
    <section id="pricing" className="px-4 sm:px-6 py-28">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-600 mb-4">
            Pricing
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
            style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
          >
            One price. Everything unlocked.
          </h2>
          <p className="mt-3 text-slate-500 text-[15px]">
            Pay monthly, or pay once and own it forever.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12 items-stretch">
          {/* Monthly */}
          <Card className="bg-white/[0.02] ring-white/[0.06] rounded-2xl py-0 gap-0">
            <CardHeader className="px-8 pt-8 pb-0">
              <div className="flex items-center justify-between">
                <span
                  className="text-[13px] font-semibold tracking-wider uppercase text-slate-400"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  Monthly
                </span>
              </div>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span
                  className="text-5xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  $12
                </span>
                <span className="text-lg text-slate-500">/month</span>
              </div>
              <p className="text-[13px] text-slate-600 mt-1.5">Cancel anytime</p>
            </CardHeader>

            <CardContent className="px-8 pt-8 flex-1">
              <FeatureList />
            </CardContent>

            <CardFooter className="px-8 pb-8 pt-8 bg-transparent border-0">
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'w-full h-12 rounded-xl text-[13px] font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white',
                )}
              >
                Start monthly
              </Link>
            </CardFooter>
          </Card>

          {/* Lifetime — highlighted */}
          <Card className="relative bg-gradient-to-b from-blue-500/[0.08] to-blue-500/[0.02] ring-blue-500/25 rounded-2xl py-0 gap-0 shadow-[0_0_60px_-15px_rgba(59,130,246,0.35)]">
            <CardHeader className="px-8 pt-8 pb-0">
              <div className="flex items-center justify-between">
                <span
                  className="text-[13px] font-semibold tracking-wider uppercase text-blue-400"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  Lifetime
                </span>
              </div>
              <div className="mt-6 flex items-baseline gap-1.5">
                <span
                  className="text-5xl font-bold text-white"
                  style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
                >
                  $149
                </span>
                <span className="text-lg text-slate-500">once</span>
              </div>
              <p className="text-[13px] text-slate-500 mt-1.5">
                Pays for itself in <span className="text-slate-300">13 months</span>
              </p>
            </CardHeader>

            <CardContent className="px-8 pt-8 flex-1">
              <FeatureList highlight />
            </CardContent>

            <CardFooter className="px-8 pb-8 pt-8 bg-transparent border-0">
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants(),
                  'w-full h-12 rounded-xl text-[13px] font-semibold bg-white text-zinc-900 hover:bg-zinc-100',
                )}
              >
                Get lifetime access
              </Link>
            </CardFooter>
          </Card>
        </div>

        <p className="text-center text-[12px] text-slate-600 mt-8">
          Same features in both plans. No upsells, no tiers.
        </p>
      </div>
    </section>
  );
}

function FeatureList({ highlight = false }: { highlight?: boolean }) {
  return (
    <ul className="space-y-3.5">
      {SHIPPED_FEATURES.map((feature) => (
        <li key={feature} className="flex items-start gap-3">
          <Check
            className={cn(
              'size-4 shrink-0 mt-0.5',
              highlight ? 'text-blue-400' : 'text-slate-500',
            )}
            strokeWidth={2.5}
          />
          <span className="text-[13px] text-slate-300 leading-relaxed">{feature}</span>
        </li>
      ))}
    </ul>
  );
}
