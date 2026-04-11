'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { CURRICULUM } from '@/lib/curriculum';
import AppNav from '@/components/AppNav';
import {
  ProgressView,
  Sidebar,
  computePathStatuses,
} from '@/components/DashboardPage';

const C = {
  appBg: '#0b1220',
};

export default function ProgressPageClient({ initialCompleted }: { initialCompleted: string[] }) {
  const router = useRouter();
  const completedIds = new Set(initialCompleted);
  const pathStatuses = computePathStatuses(completedIds);
  const [viewingPathId, setViewingPathId] = useState(CURRICULUM[0].id);

  const handleNavigateToPath = (pathId?: string) => {
    router.push('/dashboard');
  };

  const handleResumeBlock = () => {
    router.push('/dashboard');
  };

  const handleSelectPath = (id: string) => {
    if (pathStatuses[id] === 'locked') return;
    setViewingPathId(id);
  };

  return (
    <div className="min-h-screen" style={{ background: C.appBg }}>
      <AppNav activeTab="Progress" />
      <Sidebar
        pathStatuses={pathStatuses}
        viewingPathId={viewingPathId}
        completedIds={completedIds}
        onSelectPath={handleSelectPath}
      />
      <main
        style={{
          paddingLeft: 304,
          paddingTop: 48,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        className={cn('min-h-screen overflow-x-auto pb-24')}
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
