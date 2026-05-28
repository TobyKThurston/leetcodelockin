import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leetlockin.com';

const aiCitationBots = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...aiCitationBots.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard',
          '/interview',
          '/onboarding',
          '/progress',
          '/review',
          '/settings',
          '/sign-in',
          '/solve',
        ],
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/dashboard',
          '/interview',
          '/onboarding',
          '/progress',
          '/review',
          '/settings',
          '/sign-in',
          '/solve',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
