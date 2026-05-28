import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';
import { Footer } from '@/components/LandingPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leetlockin.com';

export const metadata: Metadata = {
  title: 'About | LeetLockin',
  description:
    'LeetLockin is an independent coding interview prep platform built by Toby Thurston. Pattern-first curriculum, Socratic AI tutoring, and spaced repetition — designed to teach the thinking behind coding interviews, not the answers.',
  alternates: { canonical: `${siteUrl}/about` },
  openGraph: {
    title: 'About | LeetLockin',
    description:
      'LeetLockin is an independent coding interview prep platform built by Toby Thurston.',
    url: `${siteUrl}/about`,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: `${siteUrl}/about`,
  name: 'About LeetLockin',
  about: { '@id': `${siteUrl}/#creator` },
  isPartOf: { '@id': `${siteUrl}/#website` },
};

const pageStyle = {
  color: 'var(--ll-ink)',
  backgroundColor: 'var(--ll-bg)',
  backgroundImage: [
    'radial-gradient(ellipse 55% 45% at 78% 8%, rgba(59,130,246,0.12), transparent 70%)',
    'radial-gradient(ellipse 50% 40% at 12% 18%, rgba(56,189,248,0.10), transparent 70%)',
    'radial-gradient(ellipse 70% 50% at 50% 95%, rgba(59,130,246,0.06), transparent 72%)',
  ].join(', '),
  backgroundAttachment: 'fixed, fixed, fixed',
};

export default function AboutPage() {
  return (
    <div className="theme-light min-h-screen relative" style={pageStyle}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavBar flush theme="light" />
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-32 pb-20">
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight"
          style={{
            color: 'var(--ll-ink)',
            fontFamily:
              'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          About LeetLockin
        </h1>
        <p
          className="text-[14px] mt-3"
          style={{ color: 'var(--ll-ink-subtle)' }}
        >
          An independent coding interview prep platform.
        </p>

        <section className="mt-10 space-y-5">
          <p className="text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            LeetLockin is built and operated by Toby Thurston, an independent
            developer. It is not a venture-backed company or a course factory —
            just one engineer trying to teach coding interviews the way they
            actually need to be learned: by the patterns underneath, not by
            memorizing solutions.
          </p>

          <p className="text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            {/* TODO: rewrite in your own voice — this is placeholder copy. */}
            The thing that frustrated me about every prep platform I tried was
            the same: they treated coding interviews as a problem bank to be
            ground through, instead of a small set of transferable patterns
            with a long tail of variations. A handful of patterns — Two
            Pointers, Sliding Window, Hashing, BFS, DFS, Backtracking, Heaps,
            Dynamic Programming — explain almost every interview problem you
            will see. So LeetLockin teaches the patterns first and groups
            problems under them, instead of leaving you to derive that
            structure yourself across 3,000 unsorted questions.
          </p>

          <p className="text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            The AI tutor is Socratic on purpose. When you get stuck, it gives
            you a nudge about which pattern applies. If you ask again, it
            points you at the specific technique inside that pattern. Only on
            a third ask does it walk through the mechanics. The goal is to
            close your knowledge gap, not to short-circuit your thinking.
          </p>
        </section>

        <section className="mt-12">
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--ll-ink)' }}
          >
            How LeetLockin is different
          </h2>
          <ul className="mt-4 space-y-3 text-[15px] leading-[1.7]" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>
              <strong style={{ color: 'var(--ll-ink)' }}>Curriculum, not catalog.</strong>{' '}
              Four learning paths, 37 blocks, 200+ Python problems unlocked
              progressively as you build the prerequisite intuition.
            </li>
            <li>
              <strong style={{ color: 'var(--ll-ink)' }}>Socratic AI tutoring.</strong>{' '}
              Hints are progressive. The tutor coaches you the way a strong
              interviewer would — through questions, not answers.
            </li>
            <li>
              <strong style={{ color: 'var(--ll-ink)' }}>Spaced repetition.</strong>{' '}
              Solved problems become flashcards on a forgetting-curve schedule
              so what you learn actually sticks beyond the first solve.
            </li>
            <li>
              <strong style={{ color: 'var(--ll-ink)' }}>Voice mock interviews.</strong>{' '}
              Talk through a problem out loud with an AI interviewer and get a
              post-session debrief on communication, structure, and pacing.
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--ll-ink)' }}
          >
            Contact
          </h2>
          <p className="mt-3 text-[15px] leading-[1.7]" style={{ color: 'var(--ll-ink-muted)' }}>
            Questions, bug reports, or feedback go to{' '}
            <a
              href="mailto:support@leetlockin.com"
              className="underline-offset-2 hover:underline"
              style={{ color: 'var(--ll-accent)' }}
            >
              support@leetlockin.com
            </a>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
