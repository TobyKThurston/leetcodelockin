import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, BookOpen, Code2 } from 'lucide-react';
import { CURRICULUM, isLesson, type LessonBlockDef } from '@/lib/curriculum';
import { getCompletedBlocks } from '@/lib/progress';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };

function findBlock(blockId: string): { block: LessonBlockDef; pathTitle: string } | null {
  for (const path of CURRICULUM) {
    for (const block of path.blocks) {
      if (block.id === blockId && isLesson(block)) {
        return { block, pathTitle: path.title };
      }
    }
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;
  const found = findBlock(blockId);
  if (!found) return { title: 'Lesson' };
  return { title: found.block.title };
}

export default async function MobileLessonPage({
  params,
}: {
  params: Promise<{ blockId: string }>;
}) {
  const { blockId } = await params;
  const found = findBlock(blockId);
  if (!found) notFound();

  const { block, pathTitle } = found;
  const completedList = await getCompletedBlocks();
  const isDone = completedList.includes(blockId);

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Back link */}
      <Link
        href="/m/learn"
        className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ll-ink-muted)] hover:text-[var(--ll-ink)] transition-colors"
      >
        <ArrowLeft size={13} strokeWidth={2.5} />
        All lessons
      </Link>

      {/* Header card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--ll-bg-elevated)',
          border: '1px solid var(--ll-border)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(59,130,246,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-subtle)]">
              {pathTitle}
            </p>
            {isDone && (
              <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-700">
                <Check size={10} strokeWidth={3} />
                Done
              </span>
            )}
          </div>

          <h1 className="mt-2 text-[22px] font-bold text-[var(--ll-ink)] tracking-tight leading-tight" style={SG}>
            {block.title}
          </h1>
          <p className="mt-1.5 text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">{block.subtitle}</p>

          {/* Meta row */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} strokeWidth={2} className="text-[var(--ll-ink-subtle)]" />
              <span className="text-[11px] font-semibold text-[var(--ll-ink-muted)] tabular-nums">
                {block.lessonCount} lesson{block.lessonCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Code2 size={12} strokeWidth={2} className="text-[var(--ll-ink-subtle)]" />
              <span className="text-[11px] font-semibold text-[var(--ll-ink-muted)] tabular-nums">
                {block.problemCount} problem{block.problemCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-subtle)] mb-2.5">
          About this block
        </p>
        <p className="text-[14.5px] text-[var(--ll-ink-muted)] leading-relaxed">{block.description}</p>
      </section>

      {/* Skills list */}
      {block.skills.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--ll-ink-subtle)] mb-2.5">
            What you&apos;ll learn
          </p>
          <ul
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--ll-bg-elevated)',
              border: '1px solid var(--ll-border)',
            }}
          >
            {block.skills.map((skill, i) => (
              <li
                key={skill}
                className="flex items-start gap-3 px-4 py-3"
                style={i > 0 ? { borderTop: '1px solid var(--ll-border)' } : undefined}
              >
                <div className="shrink-0 mt-0.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500/10 ring-1 ring-blue-500/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  </div>
                </div>
                <span className="text-[13.5px] text-[var(--ll-ink-muted)] leading-snug">{skill}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Desktop CTA */}
      <div
        className="bg-gradient-to-b from-blue-100/60 to-sky-50/30 ring-1 ring-blue-500/25 rounded-2xl p-5"
        style={{
          backgroundColor: 'var(--ll-bg-elevated)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 10px 30px -20px rgba(59,130,246,0.35)',
        }}
      >
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-blue-700">
          Ready to practice?
        </p>
        <h3 className="mt-1.5 text-[15px] font-bold text-[var(--ll-ink)]" style={SG}>
          Open this block on your laptop
        </h3>
        <p className="mt-1.5 text-[13px] text-[var(--ll-ink-muted)] leading-relaxed">
          The full lesson, interactive code, and AI tutor walk-throughs live in the desktop editor.
        </p>
        <a
          href={`/dashboard?block=${block.id}`}
          className="mt-4 h-12 px-5 rounded-xl text-[14px] font-semibold text-white w-full inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ backgroundColor: 'var(--ll-accent)' }}
        >
          Open in desktop editor
          <ArrowRight size={16} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}
