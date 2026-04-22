import type { Metadata } from 'next';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import {
  PRO_MONTHLY_USD,
  PRO_YEARLY_USD,
} from '@/lib/pricing';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leetlockin.com';

export const metadata: Metadata = {
  title: 'Pricing | LeetLockin',
  description: `Free curriculum forever. Pro at $${PRO_MONTHLY_USD}/mo or $${PRO_YEARLY_USD}/yr unlocks unlimited AI tutoring, mock interviews, and spaced-repetition review.`,
  alternates: { canonical: `${siteUrl}/pricing` },
  openGraph: {
    title: 'Pricing | LeetLockin',
    description: `Free curriculum forever. Pro at $${PRO_MONTHLY_USD}/mo or $${PRO_YEARLY_USD}/yr unlocks unlimited AI tutoring, mock interviews, and spaced-repetition review.`,
    url: `${siteUrl}/pricing`,
  },
};

export default function PricingPage() {
  return (
    <main className="theme-light min-h-dvh" style={{ background: 'var(--ll-bg)', color: 'var(--ll-ink)' }}>
      <Pricing />
      <FAQ />
    </main>
  );
}
