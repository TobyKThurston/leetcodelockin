'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { completeOnboarding } from '@/lib/onboarding';
import { computeSkippedBlocks, type OnboardingAnswers } from '@/lib/onboarding-logic';
import { CURRICULUM } from '@/lib/curriculum';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const EASE = [0.22, 1, 0.36, 1] as const;
const TOTAL_STEPS = 6;

const QUESTIONS: {
  title: string;
  options: { label: string; subtitle: string }[];
}[] = [
  {
    title: 'How comfortable are you with Python?',
    options: [
      { label: 'Brand new', subtitle: 'Never written Python, or just getting started' },
      { label: 'Know the basics', subtitle: 'Variables, loops, functions, lists' },
      { label: 'Comfortable', subtitle: 'Functions, dicts, sets, simple problem solving' },
    ],
  },
  {
    title: 'Have you worked with data structures?',
    options: [
      { label: 'Not really', subtitle: 'Arrays are about it' },
      { label: 'Some exposure', subtitle: 'Seen stacks, linked lists, or trees before' },
      { label: 'Solid foundation', subtitle: 'Can implement stacks, trees, hash maps, graphs' },
    ],
  },
  {
    title: 'Do you know common algorithm patterns?',
    options: [
      { label: 'Not yet', subtitle: 'I solve problems from scratch each time' },
      { label: 'A few', subtitle: 'Two pointers, sliding window, maybe binary search' },
      { label: 'Most of them', subtitle: 'Two pointers, BFS/DFS, backtracking, DP' },
    ],
  },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const dur = prefersReducedMotion ? 0 : 0.25;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
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
    setTimeout(() => {
      setDirection(1);
      setStep(s => s + 1);
    }, 200);
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

  const handleCheckout = useCallback(async (plan: 'monthly' | 'yearly') => {
    setCheckoutLoading(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
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

  const stepVariants: Variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 20 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d * -20 }),
  };

  const stagger: Variants = {
    show: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.05 } },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: dur, ease: EASE } },
  };

  const progressPct = `${(step / (TOTAL_STEPS - 1)) * 100}%`;

  return (
    <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      {step > 0 && (
        <div className="fixed top-0 inset-x-0 h-0.5 bg-white/[0.06] z-50">
          <div
            className="h-full bg-blue-500"
            style={{
              width: progressPct,
              transition: `width 0.35s cubic-bezier(${EASE.join(',')})`,
            }}
          />
        </div>
      )}

      {step > 0 && step < 5 && (
        <button
          onClick={() => go(step - 1)}
          className="fixed top-5 left-5 flex items-center gap-1 text-[13px] text-slate-500 hover:text-white transition-colors z-50"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        {step === 0 && (
          <StepWrap key="welcome" direction={direction} variants={stepVariants} dur={dur}>
            <WelcomeStep onContinue={() => go(1)} />
          </StepWrap>
        )}

        {step >= 1 && step <= 3 && (
          <StepWrap key={`q-${step}`} direction={direction} variants={stepVariants} dur={dur}>
            <QuestionStep
              question={QUESTIONS[step - 1]}
              questionIndex={step}
              selected={answers[step - 1]}
              onSelect={(val) => selectAnswer(step - 1, val)}
              stagger={stagger}
              fadeUp={fadeUp}
            />
          </StepWrap>
        )}

        {step === 4 && (
          <StepWrap key="results" direction={direction} variants={stepVariants} dur={dur}>
            <ResultsStep
              answers={getOnboardingAnswers()}
              onContinue={handleContinueFromResults}
              onAdjust={() => go(1)}
              saving={saving}
              stagger={stagger}
              fadeUp={fadeUp}
            />
          </StepWrap>
        )}

        {step === 5 && (
          <StepWrap key="pro" direction={direction} variants={stepVariants} dur={dur}>
            <ProStep
              onStartFree={() => router.push('/dashboard')}
              onCheckout={handleCheckout}
              checkoutLoading={checkoutLoading}
              stagger={stagger}
              fadeUp={fadeUp}
            />
          </StepWrap>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step wrapper ──────────────────────────────────────────────────────────────

function StepWrap({
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
      className="w-full max-w-md"
    >
      {children}
    </motion.div>
  );
}

// ─── Welcome ───────────────────────────────────────────────────────────────────

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="text-center">
      <p
        className="text-[11px] font-semibold tracking-[0.2em] uppercase text-slate-500 mb-5"
        style={SG}
      >
        LeetLockin
      </p>
      <h1
        className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-white leading-tight"
        style={SG}
      >
        Let&apos;s build your plan
      </h1>
      <p className="mt-3 text-[15px] text-slate-400 leading-relaxed max-w-xs mx-auto">
        3 quick questions so we can skip what you already know.
      </p>
      <Button
        onClick={onContinue}
        className="mt-10 h-11 w-full max-w-[240px] text-[13px] font-semibold gap-2"
      >
        Get started
        <ArrowRight size={15} />
      </Button>
      <p className="mt-3 text-[11px] text-slate-600">Takes under 60 seconds</p>
    </div>
  );
}

// ─── Question ──────────────────────────────────────────────────────────────────

function QuestionStep({
  question,
  questionIndex,
  selected,
  onSelect,
  stagger,
  fadeUp,
}: {
  question: (typeof QUESTIONS)[number];
  questionIndex: number;
  selected: 0 | 1 | 2 | null;
  onSelect: (val: 0 | 1 | 2) => void;
  stagger: Variants;
  fadeUp: Variants;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-3" style={SG}>
        Question {questionIndex} of 3
      </p>
      <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-white leading-snug" style={SG}>
        {question.title}
      </h2>
      <motion.div
        className="mt-5 flex flex-col gap-2.5"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {question.options.map((opt, i) => {
          const val = i as 0 | 1 | 2;
          const isSelected = selected === val;
          return (
            <motion.button
              key={i}
              variants={fadeUp}
              onClick={() => onSelect(val)}
              className={`w-full rounded-lg border px-4 py-3.5 text-left transition-colors duration-150 ${
                isSelected
                  ? 'border-blue-500/60 bg-blue-500/[0.07]'
                  : 'border-white/[0.07] bg-white/[0.015] hover:border-white/[0.14] hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white">{opt.label}</p>
                  <p className="mt-0.5 text-[12px] text-slate-500 leading-snug">{opt.subtitle}</p>
                </div>
                <div
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-white/[0.15] bg-transparent'
                  }`}
                >
                  {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Results ───────────────────────────────────────────────────────────────────

function ResultsStep({
  answers,
  onContinue,
  onAdjust,
  saving,
  stagger,
  fadeUp,
}: {
  answers: OnboardingAnswers;
  onContinue: () => void;
  onAdjust: () => void;
  saving: boolean;
  stagger: Variants;
  fadeUp: Variants;
}) {
  const skippedIds = new Set(computeSkippedBlocks(answers));
  const totalSkipped = skippedIds.size;

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-3" style={SG}>
        Your plan
      </p>
      <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-white leading-snug" style={SG}>
        {totalSkipped > 0
          ? `Skipping ${totalSkipped} blocks you already know`
          : 'Starting from the beginning'}
      </h2>
      <p className="mt-2 text-[13px] text-slate-500">
        {totalSkipped > 0
          ? 'Your path is tailored to what you need to learn.'
          : "We'll build up your skills step by step."}
      </p>

      <motion.div
        className="mt-5 flex flex-col gap-2"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {CURRICULUM.map((path) => {
          const pathSkipped = path.blocks.filter(b => skippedIds.has(b.id)).length;
          const total = path.blocks.length;
          const pct = total > 0 ? (pathSkipped / total) * 100 : 0;
          const startBlock = path.blocks.find(b => !skippedIds.has(b.id));

          return (
            <motion.div
              key={path.id}
              variants={fadeUp}
              className="rounded-lg border border-white/[0.07] bg-white/[0.015] px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{path.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    {total} blocks{pathSkipped > 0 && (
                      <span className="text-emerald-500 ml-1.5">
                        {pathSkipped} skipped
                      </span>
                    )}
                  </p>
                </div>
                {pathSkipped > 0 && (
                  <span className="text-[11px] font-medium text-emerald-500 shrink-0">
                    {Math.round(pct)}%
                  </span>
                )}
              </div>

              <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500/60 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {startBlock && pathSkipped > 0 && (
                <p className="mt-2 flex items-center gap-1 text-[11px] text-blue-400">
                  <ChevronRight size={10} />
                  Starting at {startBlock.title}
                </p>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-8 flex flex-col items-center gap-2.5">
        <Button
          onClick={onContinue}
          disabled={saving}
          className="h-11 w-full text-[13px] font-semibold gap-2"
        >
          {saving ? 'Saving...' : 'Continue'}
          {!saving && <ArrowRight size={15} />}
        </Button>
        <button
          onClick={onAdjust}
          className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
        >
          Change answers
        </button>
      </div>
    </div>
  );
}

// ─── Pro ───────────────────────────────────────────────────────────────────────

const PRO_FEATURES = [
  {
    title: 'Unlimited AI tutor',
    desc: 'Get unstuck with guided hints, not answers. The tutor walks you through each problem step by step.',
  },
  {
    title: 'Unlimited follow-up questions',
    desc: 'Ask as many questions as you need. No daily caps on the conversation.',
  },
  {
    title: 'Priority access',
    desc: 'Your requests go first, even during peak hours.',
  },
];

function ProStep({
  onStartFree,
  onCheckout,
  checkoutLoading,
  stagger,
  fadeUp,
}: {
  onStartFree: () => void;
  onCheckout: (plan: 'monthly' | 'yearly') => void;
  checkoutLoading: string | null;
  stagger: Variants;
  fadeUp: Variants;
}) {

  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-3" style={SG}>
        One more thing
      </p>
      <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-white leading-snug" style={SG}>
        Learn faster with Pro
      </h2>
      <p className="mt-2 text-[13px] text-slate-500">
        Everything you just set up is free. Pro adds an AI tutor that actually helps you think.
      </p>

      {/* Pro card */}
      <motion.div
        className="mt-6 rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-500/[0.06] to-transparent overflow-hidden"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* Price header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white" style={SG}>$9</span>
            <span className="text-[13px] text-slate-500">/month</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            or $59/year (save $49)
          </p>
        </div>

        {/* Features */}
        <div className="px-5 py-4 space-y-3.5">
          {PRO_FEATURES.map((feat) => (
            <motion.div key={feat.title} variants={fadeUp}>
              <div className="flex items-start gap-2.5">
                <Check size={14} className="text-blue-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <p className="text-[13px] font-medium text-white">{feat.title}</p>
                  <p className="text-[12px] text-slate-500 leading-snug mt-0.5">{feat.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Free comparison */}
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/[0.06]">
          <p className="text-[11px] text-slate-600">
            Free includes 3 AI requests per day. All content and problems are free forever.
          </p>
        </div>
      </motion.div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-2.5">
        <Button
          onClick={() => onCheckout('yearly')}
          disabled={!!checkoutLoading}
          className="h-12 w-full text-[13px] font-semibold bg-white text-zinc-900 hover:bg-zinc-100 rounded-lg"
        >
          {checkoutLoading === 'yearly' ? 'Loading...' : 'Start Pro yearly ($59/year)'}
        </Button>
        <button
          onClick={() => onCheckout('monthly')}
          disabled={!!checkoutLoading}
          className="h-10 w-full rounded-lg border border-white/[0.1] bg-white/[0.02] text-[12px] font-medium text-slate-400 hover:text-white hover:border-white/[0.2] transition-colors"
        >
          {checkoutLoading === 'monthly' ? 'Loading...' : 'Start Pro monthly ($9/mo)'}
        </button>
        <button
          onClick={onStartFree}
          className="mt-1 text-[12px] text-slate-600 hover:text-slate-400 transition-colors py-1"
        >
          Continue with free plan
        </button>
      </div>
    </div>
  );
}
