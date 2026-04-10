'use client';

import { useRouter } from 'next/navigation';
import AppNav from '@/components/AppNav';
import {
  ProgressView,
  computePathStatuses,
} from '@/components/DashboardPage';

const C = {
  appBg: '#0b1220',
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
      <main style={{ paddingTop: 48 }} className="min-h-screen">
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
