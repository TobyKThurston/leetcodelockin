import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import RefTracker from '@/components/RefTracker';
import PostHogUserIdentifier from '@/components/PostHogUserIdentifier';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leetlockin.com';
const siteName = 'LeetLockin';
const siteTitle = 'LeetLockin: AI Tutor for LeetCode Patterns & Interview Prep';
const siteDescription =
  'Master LeetCode the right way. LeetLockin teaches the patterns behind every problem with an AI tutor, a guided curriculum, and spaced repetition review.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | LeetLockin',
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    'LeetCode',
    'LeetCode patterns',
    'LeetCode AI tutor',
    'coding interview prep',
    'coding interview questions',
    'algorithms',
    'data structures',
    'Python interview',
    'technical interview',
    'FAANG interview prep',
    'spaced repetition coding',
    'DSA practice',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    locale: 'en_US',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/opengraph-image'],
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '512x512' }],
    shortcut: ['/icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: '#fafbfc',
  width: 'device-width',
  initialScale: 1,
};

// Inline pre-hydration script: reads the persisted theme and applies the right
// class to <body> / <html> before React renders, preventing a flash of wrong
// theme. Safe for SSR — runs synchronously on the client only.
const themeInitScript = `(() => {
  try {
    var m = localStorage.getItem('ll-theme');
    if (m !== 'dark' && m !== 'light') m = 'light';
    document.body.classList.add(m === 'dark' ? 'theme-dark' : 'theme-light');
    if (m === 'dark') document.documentElement.classList.add('dark');
  } catch (e) {
    document.body.classList.add('theme-light');
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased ll-surface" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <RefTracker />
        <PostHogUserIdentifier />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
