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
        className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft size={13} strokeWidth={2.5} />
        All lessons
      </Link>

      {/* Header card */}
      <div className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl p-5 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(59,130,246,0.06) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-slate-500">
              {pathTitle}
            </p>
            {isDone && (
              <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-semibold text-emerald-300">
                <Check size={10} strokeWidth={3} />
                Done
              </span>
            )}
          </div>

          <h1 className="mt-2 text-[22px] font-bold text-slate-900 tracking-tight leading-tight" style={SG}>
            {block.title}
          </h1>
          <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">{block.subtitle}</p>

          {/* Meta row */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <BookOpen size={12} strokeWidth={2} className="text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                {block.lessonCount} lesson{block.lessonCount === 1 ? '' : 's'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Code2 size={12} strokeWidth={2} className="text-slate-500" />
              <span className="text-[11px] font-semibold text-slate-600 tabular-nums">
                {block.problemCount} problem{block.problemCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section>
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-2.5">
          About this block
        </p>
        <p className="text-[14.5px] text-slate-700 leading-relaxed">{block.description}</p>
      </section>

      {/* Skills list */}
      {block.skills.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-2.5">
            What you&apos;ll learn
          </p>
          <ul className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl divide-y divide-white/[0.04] overflow-hidden">
            {block.skills.map((skill) => (
              <li key={skill} className="flex items-start gap-3 px-4 py-3">
                <div className="shrink-0 mt-0.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500/10 ring-1 ring-blue-500/25 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  </div>
                </div>
                <span className="text-[13.5px] text-slate-700 leading-snug">{skill}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Desktop CTA */}
      <div className="bg-gradient-to-b from-blue-500/[0.05] to-blue-500/[0.01] ring-1 ring-blue-500/20 rounded-2xl p-5 shadow-[0_0_40px_-15px_rgba(59,130,246,0.2)]">
        <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-blue-300/90">
          Ready to practice?
        </p>
        <h3 className="mt-1.5 text-[15px] font-bold text-slate-900" style={SG}>
          Open this block on your laptop
        </h3>
        <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
          The full lesson, interactive code, and AI tutor walk-throughs live in the desktop editor.
        </p>
        <a
          href={`/dashboard?block=${block.id}`}
          className="mt-4 h-12 px-5 rounded-xl bg-white text-slate-200 text-[14px] font-semibold w-full inline-flex items-center justify-center gap-2 hover:bg-zinc-100 active:scale-[0.98] transition-all"
        >
          Open in desktop editor
          <ArrowRight size={16} strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
}
