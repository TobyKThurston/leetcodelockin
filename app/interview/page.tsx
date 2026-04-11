import InterviewPage from '@/components/InterviewPage';
import { getInterviewHistory, checkInterviewAccess } from './actions';

export default async function Page() {
  const [history, { isPro }] = await Promise.all([
    getInterviewHistory(),
    checkInterviewAccess(),
  ]);

  return <InterviewPage initialHistory={history} isPro={isPro} />;
}
