import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { getSupabaseUser } from '@/lib/supabase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leetlockin.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'LeetLockin',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      email: 'hello@leetlockin.com',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'LeetLockin',
      description:
        'Structured coding interview prep with AI tutoring, spaced repetition review, and a guided curriculum.',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'LeetLockin',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: siteUrl,
      description:
        'AI-guided LeetCode interview prep. Pattern-first curriculum, hint-driven tutoring, and spaced repetition review for coding interviews.',
      offers: {
        '@type': 'Offer',
        category: 'subscription',
      },
    },
  ],
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ home?: string }>;
}) {
  const { home } = await searchParams;
  const user = await getSupabaseUser();
  // Signed-in users normally bounce to /dashboard, but if they explicitly
  // navigated here via the nav logo (`/?home=1`), show them the landing page.
  if (user && home !== '1') {
    redirect('/dashboard');
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
