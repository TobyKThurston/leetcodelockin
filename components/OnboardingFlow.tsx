'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, ChevronRight } from 'lucide-react';

import posthog from 'posthog-js';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
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
      const onboardingAnswers = getOnboardingAnswers();
      await completeOnboarding(onboardingAnswers);
      posthog.capture('onboarding_completed', {
        python_level: onboardingAnswers.pythonLevel,
        ds_level: onboardingAnswers.dsLevel,
        pattern_level: onboardingAnswers.patternLevel,
      });
      go(5);
    });
  }, [getOnboardingAnswers, go]);

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
        <div className="fixed top-0 inset-x-0 h-0.5 bg-slate-100 z-50">
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
          className="fixed top-5 left-5 flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-900 transition-colors z-50"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      )}

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

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
        className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-slate-900 leading-tight"
        style={SG}
      >
        Let&apos;s build your plan
      </h1>
      <p className="mt-3 text-[15px] text-slate-600 leading-relaxed max-w-xs mx-auto">
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
      <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-slate-900 leading-snug" style={SG}>
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
                  : 'border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-900">{opt.label}</p>
                  <p className="mt-0.5 text-[12px] text-slate-500 leading-snug">{opt.subtitle}</p>
                </div>
                <div
                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors duration-150 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300 bg-transparent'
                  }`}
                >
                  {isSelected && <Check size={10} className="text-slate-900" strokeWidth={3} />}
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
      <h2 className="text-[22px] sm:text-[26px] font-semibold tracking-tight text-slate-900 leading-snug" style={SG}>
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
              className="rounded-lg border border-slate-200 bg-slate-50/40 px-4 py-3.5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-slate-900 truncate">{path.title}</p>
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

              <div className="mt-2.5 h-1 rounded-full bg-slate-100 overflow-hidden">
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
          className="text-[11px] text-slate-600 hover:text-slate-600 transition-colors"
        >
          Change answers
        </button>
      </div>
    </div>
  );
}

// ─── Pro ───────────────────────────────────────────────────────────────────────

type ProFeature = {
  key: string;
  eyebrow: string;
  headline: string;
};

const PRO_FEATURES: ProFeature[] = [
  {
    key: 'voice',
    eyebrow: 'Voice mock interview',
    headline: 'Practice out loud, not in your head.',
  },
  {
    key: 'srs',
    eyebrow: 'Spaced-repetition review',
    headline: "Don't lose what you learned.",
  },
  {
    key: 'tutor',
    eyebrow: 'Unlimited AI tutor',
    headline: 'Hints that guide, not solve.',
  },
];

function ProStep({
  onStartFree,
  stagger,
  fadeUp,
}: {
  onStartFree: () => void;
  stagger: Variants;
  fadeUp: Variants;
}) {
  return (
    <div>
      <motion.div
        className="flex flex-col gap-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {PRO_FEATURES.map((feat, i) => (
          <motion.div
            key={feat.key}
            variants={fadeUp}
            className="rounded-lg border border-slate-200 bg-slate-50/40 px-4 py-4"
          >
            <p className="text-[10px] font-mono font-semibold tracking-[0.18em] text-blue-400">
              {`0${i + 1}`}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-slate-900" style={SG}>
              {feat.eyebrow}
            </p>
            <p className="mt-1 text-[12px] text-slate-600 leading-snug">
              {feat.headline}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <Button
        onClick={onStartFree}
        className="mt-6 h-12 w-full text-[13px] font-semibold rounded-lg gap-2"
      >
        Go to dashboard
        <ArrowRight size={15} />
      </Button>
    </div>
  );
}
