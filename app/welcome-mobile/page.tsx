import MobileHandoffScreen from '@/components/mobile/MobileHandoffScreen';

export const metadata = {
  title: 'Welcome | Open on Desktop',
};

export default function WelcomeMobilePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leetlockin.com';
  return <MobileHandoffScreen siteUrl={siteUrl} />;
}
