import DashboardPage from '@/components/DashboardPage';
import { getCompletedBlocks } from '@/lib/progress';

export default async function Page() {
  const initialCompleted = await getCompletedBlocks();
  return <DashboardPage initialCompleted={initialCompleted} />;
}
