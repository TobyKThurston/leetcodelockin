import InterviewPage from '@/components/InterviewPage';
import { getInterviewHistory, checkInterviewAccess, getVoiceQuota } from './actions';

export default async function Page() {
  const [history, { isPro }, voiceQuota] = await Promise.all([
    getInterviewHistory(),
    checkInterviewAccess(),
    getVoiceQuota(),
  ]);

  return <InterviewPage initialHistory={history} isPro={isPro} voiceQuota={voiceQuota} />;
}
