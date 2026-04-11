'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Zap,
  Check,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { completeOnboarding } from '@/lib/onboarding';
import { computeSkippedBlocks, type OnboardingAnswers } from '@/lib/onboarding-logic';
import { CURRICULUM } from '@/lib/curriculum';

// ─── Constants ─────────────────────────────────────────────────────────────────

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 6; // 0-5

const QUESTIONS: {
  title: string;
  options: { label: string; subtitle: string }[];
}[] = [
  {
    title: 'How comfortable are you with Python?',
    options: [
      { label: 'Brand new', subtitle: "I've never written Python or I'm just starting" },
      { label: 'I know the basics', subtitle: 'Variables, loops, functions, lists — I\'ve used them' },
      { label: 'Comfortable', subtitle: 'I can write functions, use dicts/sets, and solve simple problems' },
    ],
  },
  {
    title: 'Have you worked with data structures before?',
    options: [
      { label: 'Not really', subtitle: 'Arrays are about it' },
      { label: 'Some exposure', subtitle: "I've seen stacks, linked lists, or trees in a class or tutorial" },
      { label: 'Solid foundation', subtitle: 'I can implement and use stacks, trees, hash maps, and graphs' },
    ],
  },
  {
    title: 'Do you recognize common algorithm patterns?',
    options: [
      { label: 'What patterns?', subtitle: 'I solve problems from scratch each time' },
      { label: 'A few', subtitle: 'I know two pointers or sliding window but not many others' },
      { label: 'Most of them', subtitle: 'Two pointers, binary search, BFS/DFS, backtracking, DP — I\'ve used them' },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const dur = prefersReducedMotion ? 0 : 0.3;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [answers, setAnswers] = useState<(0 | 1 | 2 | null)[]>([null, null, null]);
  const [saving, startTransition] = useTransition();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const go = useCallback((to: number) => {
    setDirection(to > step ? 1 : -1);
    setStep(to);
  }, [step]);

  const selectAnswer = useCallback((questionIdx: number, value: 0 | 1 | 2) => {
    setAnswers(prev => {
      const next = [...prev];
      next[questionIdx] = value;
      return next;
    });
    // Auto-advance after a short delay
    setTimeout(() => {
      setDirection(1);
      setStep(s => s + 1);
    }, 250);
  }, []);

  const getOnboardingAnswers = useCallback((): OnboardingAnswers => ({
    pythonLevel: answers[0] ?? 0,
    dsLevel: answers[1] ?? 0,
    patternLevel: answers[2] ?? 0,
  }), [answers]);

  const handleContinueFromResults = useCallback(() => {
    startTransition(async () => {
      await completeOnboarding(getOnboardingAnswers());
      go(5);
    });
  }, [getOnboardingAnswers, go]);

  const handleCheckout = useCallback(async (priceId: string) => {
    setCheckoutLoading(priceId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url, error } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        console.error('Checkout error:', error);
        setCheckoutLoading(null);
      }
    } catch {
      setCheckoutLoading(null);
    }
  }, []);

  // ─── Animation variants ────────────────────────────────────────────────

  const stepVariants = {
    enter: (d: number) => ({ opacity: 0, x: d * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -24 }),
  };

  const staggerContainer = {
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.06 } },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: dur, ease: EASE } },
  };

  // ─── Progress bar ──────────────────────────────────────────────────────

  const progressPct = `${(step / (TOTAL_STEPS - 1)) * 100}%`;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {/* Progress bar */}
      {step > 0 && (
        <div className="fixed top-0 inset-x-0 h-1 bg-white/[0.06] z-50">
          <div
            className="h-full bg-blue-500 rounded-r-full"
            style={{
              width: progressPct,
              transition: `width 0.4s cubic-bezier(${EASE.join(',')})`,
            }}
          />
        </div>
      )}

      {/* Back button */}
      {step > 0 && step < 5 && (
        <button
          onClick={() => go(step - 1)}
          className="fixed top-6 left-6 flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors z-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        {step === 0 && (
          <Step key="welcome" direction={direction} variants={stepVariants} dur={dur}>
            <WelcomeStep onContinue={() => go(1)} />
          </Step>
        )}

        {step >= 1 && step <= 3 && (
          <Step key={`q-${step}`} direction={direction} variants={stepVariants} dur={dur}>
            <AssessmentStep
              question={QUESTIONS[step - 1]}
              selected={answers[step - 1]}
              onSelect={(val) => selectAnswer(step - 1, val)}
              staggerContainer={staggerContainer}
              staggerItem={staggerItem}
            />
          </Step>
        )}

        {step === 4 && (
          <Step key="results" direction={direction} variants={stepVariants} dur={dur}>
            <ResultsStep
              answers={getOnboardingAnswers()}
              onContinue={handleContinueFromResults}
              onAdjust={() => go(1)}
              saving={saving}
              staggerContainer={staggerContainer}
              staggerItem={staggerItem}
            />
          </Step>
        )}

        {step === 5 && (
          <Step key="upsell" direction={direction} variants={stepVariants} dur={dur}>
            <ProUpsellStep
              onStartFree={() => router.push('/dashboard')}
              onCheckout={handleCheckout}
              checkoutLoading={checkoutLoading}
              staggerContainer={staggerContainer}
              staggerItem={staggerItem}
            />
          </Step>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step wrapper ──────────────────────────────────────────────────────────────

function Step({
  children,
  direction,
  variants,
  dur,
}: {
  children: React.ReactNode;
  direction: number;
  variants: Variants;
  dur: number;
}) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: dur, ease: EASE }}
      className="w-full max-w-lg"
    >
      {children}
    </motion.div>
  );
}

// ─── Step 0: Welcome ───────────────────────────────────────────────────────────

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20">
        <Sparkles size={24} className="text-blue-400" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl" style={SG}>
        Welcome to LeetLockin
      </h1>
      <p className="mt-3 text-base text-slate-400 leading-relaxed max-w-sm mx-auto">
        Let&apos;s personalize your path so you can skip what you already know and focus on what matters.
      </p>
      <p className="mt-1.5 text-xs text-slate-500">Takes about 60 seconds</p>
      <Button
        onClick={onContinue}
        className="mt-8 h-11 px-6 text-sm font-medium gap-2"
      >
        Let&apos;s go
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}

// ─── Steps 1-3: Assessment ─────────────────────────────────────────────────────

function AssessmentStep({
  question,
  selected,
  onSelect,
  staggerContainer,
  staggerItem,
}: {
  question: (typeof QUESTIONS)[number];
  selected: 0 | 1 | 2 | null;
  onSelect: (val: 0 | 1 | 2) => void;
  staggerContainer: Variants;
  staggerItem: Variants;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl" style={SG}>
        {question.title}
      </h2>
      <motion.div
        className="mt-6 flex flex-col gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {question.options.map((opt, i) => {
          const val = i as 0 | 1 | 2;
          const isSelected = selected === val;
          return (
            <motion.button
              key={i}
              variants={staggerItem}
              onClick={() => onSelect(val)}
              className={`group relative w-full rounded-xl border px-5 py-4 text-left transition-colors duration-150 ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/[0.08]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{opt.label}</p>
                  <p className="mt-0.5 text-sm text-slate-400 leading-snug">{opt.subtitle}</p>
                </div>
                {isSelected && (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Step 4: Results ───────────────────────────────────────────────────────────

function ResultsStep({
  answers,
  onContinue,
  onAdjust,
  saving,
  staggerContainer,
  staggerItem,
}: {
  answers: OnboardingAnswers;
  onContinue: () => void;
  onAdjust: () => void;
  saving: boolean;
  staggerContainer: Variants;
  staggerItem: Variants;
}) {
  const skippedIds = new Set(computeSkippedBlocks(answers));
  const totalSkipped = skippedIds.size;

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl" style={SG}>
        Your personalized plan
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {totalSkipped > 0
          ? `We'll skip ${totalSkipped} block${totalSkipped === 1 ? '' : 's'} you already know.`
          : "Starting from the beginning — we'll build up step by step."}
      </p>

      <motion.div
        className="mt-6 flex flex-col gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {CURRICULUM.map((path) => {
          const pathSkipped = path.blocks.filter(b => skippedIds.has(b.id)).length;
          const total = path.blocks.length;
          const pct = total > 0 ? (pathSkipped / total) * 100 : 0;
          // Find first non-skipped block
          const startBlock = path.blocks.find(b => !skippedIds.has(b.id));

          return (
            <motion.div
              key={path.id}
              variants={staggerItem}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{path.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {total} block{total === 1 ? '' : 's'}
                  </p>
                </div>
                {pathSkipped > 0 && (
                  <Badge
                    className="shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-medium"
                  >
                    {pathSkipped} skipped
                  </Badge>
                )}
              </div>

              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500/70 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Starting point */}
              {startBlock && pathSkipped > 0 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400">
                  <ChevronRight size={12} />
                  <span>Start at: {startBlock.title}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <Button
          onClick={onContinue}
          disabled={saving}
          className="h-11 px-8 text-sm font-medium gap-2"
        >
          {saving ? 'Saving...' : 'Continue'}
          {!saving && <ArrowRight size={16} />}
        </Button>
        <button
          onClick={onAdjust}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Adjust answers
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Pro Upsell ────────────────────────────────────────────────────────

const PRO_FEATURES = [
  {
    icon: Sparkles,
    title: 'Socratic AI Tutor',
    desc: 'Stuck on a problem? Get hints that teach, not spoilers.',
  },
  {
    icon: MessageCircle,
    title: 'Unlimited AI Chat',
    desc: 'Ask follow-up questions without daily limits.',
  },
  {
    icon: Zap,
    title: 'Priority Access',
    desc: 'Skip the queue when things get busy.',
  },
];

function ProUpsellStep({
  onStartFree,
  onCheckout,
  checkoutLoading,
  staggerContainer,
  staggerItem,
}: {
  onStartFree: () => void;
  onCheckout: (priceId: string) => void;
  checkoutLoading: string | null;
  staggerContainer: Variants;
  staggerItem: Variants;
}) {
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY ?? '';
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY ?? '';

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl" style={SG}>
        One more thing — meet your AI&nbsp;tutor
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Free users get 3 AI requests per day. Pro unlocks everything.
      </p>

      <motion.div
        className="mt-6 flex flex-col gap-3"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {PRO_FEATURES.map((feat) => (
          <motion.div
            key={feat.title}
            variants={staggerItem}
            className="flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20">
              <feat.icon size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{feat.title}</p>
              <p className="mt-0.5 text-sm text-slate-400 leading-snug">{feat.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => onCheckout(monthlyPriceId)}
            disabled={!!checkoutLoading}
            className="h-11 px-6 text-sm font-medium bg-white text-slate-900 hover:bg-slate-100"
          >
            {checkoutLoading === monthlyPriceId ? 'Loading...' : 'Try Pro — $9/mo'}
          </Button>
          <Button
            variant="ghost"
            onClick={onStartFree}
            className="h-11 px-6 text-sm font-medium text-slate-400 hover:text-white"
          >
            Start free
          </Button>
        </div>
        {yearlyPriceId && (
          <button
            onClick={() => onCheckout(yearlyPriceId)}
            disabled={!!checkoutLoading}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {checkoutLoading === yearlyPriceId ? 'Loading...' : 'or $90/year (save $18)'}
          </button>
        )}
      </div>
    </div>
  );
}
