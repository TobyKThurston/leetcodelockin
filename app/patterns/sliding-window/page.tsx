import type { Metadata } from 'next';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { Footer } from '@/components/LandingPage';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://leetlockin.com';

export const metadata: Metadata = {
  title: 'Sliding Window Pattern: When to Use It and How It Works | LeetLockin',
  description:
    'The sliding window pattern solves problems that ask for the longest, shortest, or best contiguous subarray or substring. Learn when it applies, the two variants (fixed and dynamic), and the template that solves them.',
  alternates: { canonical: `${siteUrl}/patterns/sliding-window` },
  openGraph: {
    title: 'Sliding Window Pattern — When to Use It and How It Works',
    description:
      'When the sliding window pattern applies, the two variants, and the Python template that solves them.',
    url: `${siteUrl}/patterns/sliding-window`,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'LeetLockin', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Patterns', item: `${siteUrl}/patterns/sliding-window` },
        { '@type': 'ListItem', position: 3, name: 'Sliding Window', item: `${siteUrl}/patterns/sliding-window` },
      ],
    },
    {
      '@type': 'TechArticle',
      headline: 'Sliding Window Pattern: When to Use It and How It Works',
      url: `${siteUrl}/patterns/sliding-window`,
      author: { '@id': `${siteUrl}/#creator` },
      publisher: { '@id': `${siteUrl}/#creator` },
      inLanguage: 'en-US',
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: 'Sliding Window algorithm pattern for coding interviews',
      keywords:
        'sliding window, two pointers, substring, subarray, coding interview, algorithm pattern, leetcode',
    },
  ],
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

const SANS: React.CSSProperties = {
  fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
};
const MONO: React.CSSProperties = {
  fontFamily: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
};

export default function SlidingWindowPatternPage() {
  return (
    <div className="theme-light min-h-screen relative" style={pageStyle}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavBar flush theme="light" />
      <main className="max-w-3xl mx-auto px-6 sm:px-10 pt-32 pb-20">
        <p
          className="text-[12px] tracking-[0.18em] uppercase font-semibold"
          style={{ color: 'var(--ll-accent)' }}
        >
          Pattern Library
        </p>
        <h1
          className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ ...SANS, color: 'var(--ll-ink)', letterSpacing: '-0.02em' }}
        >
          Sliding Window: when to use it and how it works
        </h1>
        <p
          className="mt-5 text-[16px] leading-[1.7]"
          style={{ color: 'var(--ll-ink-muted)' }}
        >
          The sliding window pattern applies whenever a problem asks for the
          longest, shortest, or best contiguous subarray or substring that
          satisfies some condition. It turns an O(n²) brute-force search over
          every range into a single O(n) pass by maintaining a moving range
          (the window) over the input and updating the answer as the window
          grows and shrinks.
        </p>

        <section className="mt-12">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ll-ink)' }}>
            When this pattern applies
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            Sliding window is the right tool when three conditions hold:
          </p>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.7] list-disc pl-5" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>The input is an array, string, or stream of elements with a fixed order.</li>
            <li>The answer is some property of a contiguous range — a length, sum, count, or extremum.</li>
            <li>
              The condition you are tracking has a monotonic relationship with
              the window — adding an element either strictly worsens the
              condition or strictly improves it, but never flips both ways.
            </li>
          </ul>
          <p className="mt-4 text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            If those three hold, sliding window collapses the problem from O(n²)
            to O(n). If the third does not hold — if adding an element can
            sometimes help and sometimes hurt — you usually need a different
            pattern (prefix sums, monotonic deque, or a heap) instead.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ll-ink)' }}>
            The two variants
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            Every sliding window problem is one of two shapes. Recognizing
            which shape you are looking at is half the work.
          </p>

          <h3 className="mt-7 text-[16px] font-semibold" style={{ color: 'var(--ll-ink)' }}>
            1. Fixed-size window
          </h3>
          <p className="mt-3 text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            The window length k is given by the problem. You slide the window
            one element at a time across the array, adding the new element on
            the right and removing the one on the left in O(1). The classic
            example is &ldquo;maximum sum of any k consecutive elements.&rdquo;
            You compute the sum of the first k elements once, then for each
            subsequent step add the next element and subtract the oldest.
          </p>

          <h3 className="mt-7 text-[16px] font-semibold" style={{ color: 'var(--ll-ink)' }}>
            2. Dynamic-size window
          </h3>
          <p className="mt-3 text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            The window length is not given — you grow it from the right as
            long as the condition holds, then shrink it from the left when the
            condition breaks. The classic example is &ldquo;longest substring
            without repeating characters.&rdquo; You expand the right pointer
            into new characters, and when you hit a duplicate you advance the
            left pointer past the earlier occurrence. The window represents
            the current best valid range ending at the right pointer.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ll-ink)' }}>
            The Python template
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            The dynamic-window template fits almost every variable-size sliding
            window problem you will encounter in interviews:
          </p>
          <pre
            className="mt-5 overflow-x-auto rounded-md p-5 text-[13.5px] leading-[1.6]"
            style={{
              ...MONO,
              background: 'var(--ll-bg-elevated)',
              border: '1px solid var(--ll-border)',
              color: 'var(--ll-ink)',
            }}
          >
{`def sliding_window(nums):
    left = 0
    state = init_state()         # counter, sum, set, etc.
    best = init_best()           # 0, math.inf, etc.

    for right, x in enumerate(nums):
        add(state, x)            # extend the window to the right

        while not valid(state):  # shrink from the left until valid
            remove(state, nums[left])
            left += 1

        best = update(best, right - left + 1, state)

    return best`}
          </pre>
          <p className="mt-4 text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            Three things change between problems: what you store in{' '}
            <code style={MONO}>state</code> (a hash map for character counts, a
            running sum, a set of seen elements), what{' '}
            <code style={MONO}>valid()</code> means, and what
            you measure with <code style={MONO}>update()</code>. Everything
            else is the same skeleton.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ll-ink)' }}>
            Common interview problems that use this pattern
          </h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-[1.7] list-disc pl-5" style={{ color: 'var(--ll-ink-muted)' }}>
            <li>Longest substring without repeating characters</li>
            <li>Minimum window substring</li>
            <li>Longest substring with at most K distinct characters</li>
            <li>Maximum sum of K consecutive elements</li>
            <li>Permutation in string</li>
            <li>Find all anagrams in a string</li>
            <li>Fruit into baskets</li>
            <li>Longest repeating character replacement</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--ll-ink)' }}>
            How sliding window relates to other patterns
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.75]" style={{ color: 'var(--ll-ink-muted)' }}>
            Sliding window is a specialization of the two-pointers pattern. In
            two pointers the pointers can move independently in any direction;
            in sliding window the right pointer always moves forward and the
            left pointer only catches up. If your problem requires the
            pointers to move toward each other from both ends — like
            two-sum-on-sorted or container-with-most-water — that is
            two-pointers, not sliding window. If your problem has a window-like
            shape but adding elements can both help and hurt the condition,
            you usually need a monotonic deque or a heap.
          </p>
        </section>

        <section className="mt-14">
          <div
            className="rounded-lg p-6"
            style={{
              background: 'var(--ll-bg-elevated)',
              border: '1px solid var(--ll-border)',
            }}
          >
            <p className="text-[15.5px] leading-[1.7]" style={{ color: 'var(--ll-ink)' }}>
              <strong>Practice this pattern with hint-guided AI tutoring.</strong> LeetLockin
              groups eight sliding-window problems together and unlocks them
              after the prerequisite blocks, so you build pattern intuition
              before you grind variations.
            </p>
            <Link
              href="/sign-in"
              className="mt-4 inline-flex items-center px-5 h-10 rounded-md text-[13.5px] font-semibold text-white"
              style={{
                ...SANS,
                background: 'var(--ll-accent)',
                boxShadow:
                  '0 1px 0 0 rgba(255,255,255,0.15) inset, 0 1px 2px rgba(15,23,42,0.06), 0 8px 24px -10px rgba(59,130,246,0.55)',
              }}
            >
              Start the Pattern Library
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
