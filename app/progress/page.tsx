import ProgressPageClient from '@/components/ProgressPageClient';
import { getCompletedBlocks } from '@/lib/progress';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function Page() {
  const initialCompleted = await getCompletedBlocks();
  return <ProgressPageClient initialCompleted={initialCompleted} />;
}
