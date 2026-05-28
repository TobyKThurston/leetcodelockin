import InterviewPage from '@/components/InterviewPage';
import { getInterviewHistory, checkInterviewAccess } from './actions';

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function Page() {
  const [history, { isPro }] = await Promise.all([
    getInterviewHistory(),
    checkInterviewAccess(),
  ]);

  return <InterviewPage initialHistory={history} isPro={isPro} />;
}
