'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import AppNav from '@/components/AppNav';
import {
  ProgressView,
  computePathStatuses,
} from '@/components/DashboardPage';

const C = {
  appBg:    '#0b1220',
  panelBg:  '#070c17',
  border:   'rgba(255,255,255,0.06)',
};

export default function ProgressPageClient({ initialCompleted }: { initialCompleted: string[] }) {
  const router = useRouter();
  const completedIds = new Set(initialCompleted);
  const pathStatuses = computePathStatuses(completedIds);

  const handleNavigateToPath = () => {
    router.push('/dashboard');
  };

  const handleResumeBlock = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen" style={{ background: C.appBg }}>
      <AppNav activeTab="Progress" />

      {/* Left panel — empty, matches sidebar shell from dashboard/library */}
      <aside
        className="fixed left-0 bottom-0"
        style={{
          top: 48,
          width: 304,
          background: C.panelBg,
          borderRight: `1px solid ${C.border}`,
        }}
      />

      {/* Right panel — empty, matches right rail shell from dashboard/library */}
      <aside
        className="hidden lg:block fixed right-0"
        style={{
          top: 48,
          bottom: 0,
          width: 304,
          background: C.panelBg,
          borderLeft: `1px solid ${C.border}`,
        }}
      />

      <main
        style={{
          paddingLeft: 304,
          paddingTop: 48,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        className={cn('min-h-screen overflow-x-auto pb-24', 'lg:pr-[304px]')}
      >
        <ProgressView
          pathStatuses={pathStatuses}
          completedIds={completedIds}
          onNavigateToPath={handleNavigateToPath}
          onResumeBlock={handleResumeBlock}
        />
      </main>
    </div>
  );
}
