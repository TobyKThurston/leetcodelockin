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
        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
          Curriculum
        </p>
        <h1 className="mt-1 text-[26px] font-bold text-white tracking-tight" style={SG}>
          Lessons
        </h1>
        <p className="mt-1.5 text-[13px] text-slate-500 leading-relaxed">
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
                className="text-[15px] font-bold text-white tracking-tight"
                style={SG}
              >
                <span className="text-slate-600 mr-2 font-semibold tabular-nums">
                  {String(pathIdx + 1).padStart(2, '0')}
                </span>
                {path.title}
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums shrink-0">
                {pathDone}/{pathTotal}
              </span>
            </div>

            <div className="bg-white/[0.02] ring-1 ring-white/[0.06] rounded-2xl divide-y divide-white/[0.04] overflow-hidden">
              {lessonBlocks.map((block) => {
                const isDone = completed.has(block.id);
                return (
                  <Link
                    key={block.id}
                    href={`/m/learn/${block.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 min-h-[60px] hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/10 ring-1 ring-emerald-500/25'
                          : 'bg-white/[0.03] ring-1 ring-white/[0.06]'
                      }`}
                    >
                      <BookOpen
                        size={14}
                        strokeWidth={2}
                        className={isDone ? 'text-emerald-300' : 'text-slate-400'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13.5px] font-semibold text-white leading-tight truncate"
                        style={SG}
                      >
                        {block.title}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-slate-500 truncate">
                        {block.subtitle}
                      </p>
                    </div>
                    <ChevronRight size={15} strokeWidth={2.5} className="text-slate-600 shrink-0" />
                  </Link>
                );
              })}

              {/* Practice step count footer if there are practice blocks */}
              {(() => {
                const practiceCount = path.blocks.filter(isPractice).length;
                if (practiceCount === 0) return null;
                return (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-black/[0.2]">
                    <Code2 size={12} strokeWidth={2} className="text-slate-600" />
                    <p className="text-[11px] text-slate-600">
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
