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
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      image: `${siteUrl}/logo.png`,
      email: 'tobykthurston@gmail.com',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'LeetLockin',
      description:
        'AI-guided LeetCode interview prep. Pattern-first curriculum, hint-driven tutoring, and spaced repetition review.',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: 'LeetLockin: AI Tutor for LeetCode Patterns & Interview Prep',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      description:
        'Master LeetCode the right way. LeetLockin teaches the patterns behind every problem with an AI tutor, a guided curriculum, and spaced repetition review.',
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      name: 'LeetLockin',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: siteUrl,
      image: `${siteUrl}/logo.png`,
      description:
        'AI-guided LeetCode interview prep. Pattern-first curriculum, hint-driven tutoring, and spaced repetition review for coding interviews.',
      offers: {
        '@type': 'Offer',
        category: 'subscription',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is LeetLockin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'LeetLockin is an AI-guided coding interview prep platform that teaches the patterns behind LeetCode problems. It pairs a structured curriculum with an AI tutor that gives hints instead of answers, plus spaced repetition review so concepts actually stick.',
          },
        },
        {
          '@type': 'Question',
          name: 'How is LeetLockin different from grinding LeetCode?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Grinding LeetCode trains you to memorize answers. LeetLockin trains you to recognize patterns — two pointers, sliding window, monotonic stack, and the rest — so you can solve new problems you have never seen before in real interviews.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which programming languages does LeetLockin support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'LeetLockin currently focuses on Python, the most common language for coding interviews. Problems run directly in your browser via a sandboxed Python runtime — no setup required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is LeetLockin good for FAANG interview prep?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The curriculum covers the pattern families that show up most in FAANG and top-tier technical interviews, and the AI tutor is designed to coach you the way a strong interviewer would — through questions and hints, not answers.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to install anything to use LeetLockin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. LeetLockin runs entirely in your browser. You sign in with Google and can start solving problems immediately — no IDE, no compiler, no setup.',
          },
        },
      ],
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
