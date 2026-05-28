import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';
import { getSupabaseUser } from '@/lib/supabase';
import { FAQS } from '@/lib/faqs';
import { PRO_MONTHLY_USD, PRO_YEARLY_USD } from '@/lib/pricing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leetlockin.com';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#creator`,
      name: 'Toby Thurston',
      url: `${siteUrl}/about`,
      email: 'support@leetlockin.com',
      image: `${siteUrl}/logo.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'LeetLockin',
      description:
        'AI-guided LeetCode interview prep. Pattern-first curriculum, hint-driven tutoring, and spaced repetition review.',
      publisher: { '@id': `${siteUrl}/#creator` },
      inLanguage: 'en-US',
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: `${siteUrl}/`,
      name: 'LeetLockin: AI Tutor for LeetCode Patterns & Interview Prep',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#creator` },
      description:
        'Master LeetCode the right way. LeetLockin teaches the patterns behind every problem with an AI tutor, a guided curriculum, and spaced repetition review.',
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#app`,
      name: 'LeetLockin',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: siteUrl,
      image: `${siteUrl}/logo.png`,
      description:
        'AI-guided LeetCode interview prep. Pattern-first curriculum, hint-driven tutoring, and spaced repetition review for coding interviews.',
      author: { '@id': `${siteUrl}/#creator` },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '0',
        highPrice: String(PRO_MONTHLY_USD),
        offerCount: 3,
        offers: [
          {
            '@type': 'Offer',
            name: 'Free',
            price: '0',
            priceCurrency: 'USD',
            url: `${siteUrl}/sign-in`,
            availability: 'https://schema.org/InStock',
            description:
              'Full curriculum, 200+ problems, in-browser Python execution, and 5 AI tutor hints per week.',
          },
          {
            '@type': 'Offer',
            name: 'Pro Monthly',
            price: String(PRO_MONTHLY_USD),
            priceCurrency: 'USD',
            url: `${siteUrl}/pricing`,
            availability: 'https://schema.org/InStock',
            description:
              'Unlimited AI tutoring, voice mock interviews, spaced repetition, and streak freezes — billed monthly.',
          },
          {
            '@type': 'Offer',
            name: 'Pro Yearly',
            price: String(PRO_YEARLY_USD),
            priceCurrency: 'USD',
            url: `${siteUrl}/pricing`,
            availability: 'https://schema.org/InStock',
            description:
              'Unlimited AI tutoring, voice mock interviews, spaced repetition, and streak freezes — billed annually.',
          },
        ],
      },
    },
    {
      '@type': 'Course',
      '@id': `${siteUrl}/#course`,
      name: 'LeetCode Interview Prep — Pattern-First Curriculum',
      description:
        'A structured 4-path curriculum teaching the patterns behind every LeetCode problem: Python Foundations, Core Data Structures, Pattern Library, and Interview Ready.',
      url: siteUrl,
      provider: { '@id': `${siteUrl}/#creator` },
      inLanguage: 'en-US',
      educationalLevel: 'Beginner to Advanced',
      teaches: [
        'Two Pointers',
        'Sliding Window',
        'Prefix Sum',
        'Binary Search',
        'Hashing Patterns',
        'Stack Patterns',
        'BFS',
        'DFS and Backtracking',
        'Tree Patterns',
        'Heap Patterns',
        'Dynamic Programming',
      ],
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: 'PT40H',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: FAQS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: a,
        },
      })),
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
