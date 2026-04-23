import Link from 'next/link';
import { ChevronRight, BookOpen, Code2 } from 'lucide-react';
import { CURRICULUM, isLesson, isPractice } from '@/lib/curriculum';
import { getCompletedBlocks } from '@/lib/progress';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

export const metadata = {
  title: 'Lessons',
};

export default async function MobileLearnPage() {
  const completedList = await getCompletedBlocks();
  const completed = new Set(completedList);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="pt-1">
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-subtle)]">
          Curriculum
        </p>
        <h1 className="mt-1 text-[26px] font-bold text-[var(--ll-ink)] tracking-tight" style={SG}>
          Lessons
        </h1>
        <p className="mt-1.5 text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">
          Browse the curriculum on the go. Tap any block to preview what you&apos;ll learn.
        </p>
      </div>

      {/* Paths */}
      {CURRICULUM.map((path, pathIdx) => {
        const lessonBlocks = path.blocks.filter(isLesson);
        const pathDone = path.blocks.filter((b) => completed.has(b.id)).length;
        const pathTotal = path.blocks.length;

        return (
          <section key={path.id} className="space-y-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <h2
                className="text-[15px] font-bold text-[var(--ll-ink)] tracking-tight"
                style={SG}
              >
                <span className="text-[var(--ll-ink-subtle)] mr-2 font-semibold tabular-nums">
                  {String(pathIdx + 1).padStart(2, '0')}
                </span>
                {path.title}
              </h2>
              <span className="text-[11px] font-semibold text-[var(--ll-ink-muted)] tabular-nums shrink-0">
                {pathDone}/{pathTotal}
              </span>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'var(--ll-bg-elevated)',
                border: '1px solid var(--ll-border)',
              }}
            >
              {lessonBlocks.map((block, blockIdx) => {
                const isDone = completed.has(block.id);
                return (
                  <Link
                    key={block.id}
                    href={`/m/learn/${block.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 min-h-[60px] hover:bg-[var(--ll-bg-subtle)] active:bg-[var(--ll-bg-subtle)] transition-colors"
                    style={blockIdx > 0 ? { borderTop: '1px solid var(--ll-border)' } : undefined}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'ring-1'
                      }`}
                      style={
                        isDone
                          ? undefined
                          : {
                              backgroundColor: 'var(--ll-bg-subtle)',
                              boxShadow: 'inset 0 0 0 1px var(--ll-border)',
                            }
                      }
                    >
                      <BookOpen
                        size={14}
                        strokeWidth={2}
                        className={isDone ? 'text-emerald-600' : 'text-[var(--ll-ink-muted)]'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13.5px] font-semibold text-[var(--ll-ink)] leading-tight truncate"
                        style={SG}
                      >
                        {block.title}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-[var(--ll-ink-muted)] truncate">
                        {block.subtitle}
                      </p>
                    </div>
                    <ChevronRight size={15} strokeWidth={2.5} className="text-[var(--ll-ink-subtle)] shrink-0" />
                  </Link>
                );
              })}

              {/* Practice step count footer if there are practice blocks */}
              {(() => {
                const practiceCount = path.blocks.filter(isPractice).length;
                if (practiceCount === 0) return null;
                return (
                  <div
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{
                      backgroundColor: 'var(--ll-bg-subtle)',
                      borderTop: '1px solid var(--ll-border)',
                    }}
                  >
                    <Code2 size={12} strokeWidth={2} className="text-[var(--ll-ink-subtle)]" />
                    <p className="text-[11px] text-[var(--ll-ink-subtle)]">
                      {practiceCount} practice problem{practiceCount === 1 ? '' : 's'} — open on desktop to solve
                    </p>
                  </div>
                );
              })()}
            </div>
          </section>
        );
      })}
    </div>
  );
}
