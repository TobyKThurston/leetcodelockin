export type FAQ = {
  q: string;
  a: string;
};

export const FAQS: FAQ[] = [
  {
    q: 'How is LeetLockin different from LeetCode?',
    a: 'LeetCode is a problem bank. LeetLockin is a curriculum. You learn patterns like Two Pointers, Sliding Window, and Dynamic Programming first, then practice problems grouped by that pattern. Every solve reinforces a transferable skill instead of memorizing a one-off answer.',
  },
  {
    q: 'What do I get on the free plan?',
    a: 'The full curriculum. All 4 paths, 200+ problems, in-browser Python execution, and progress tracking are free. Free includes 5 AI hints per week. Pro removes the cap and adds mock interviews, spaced repetition, and streak freezes.',
  },
  {
    q: 'Do I need to know Python before I start?',
    a: 'No. Path 1 is Python Foundations. It covers variables, loops, functions, lists, dictionaries, and sets before you touch your first problem. If you already know Python, skip ahead to Core Data Structures.',
  },
  {
    q: 'Does the AI just hand me the answer?',
    a: 'No. Hints are progressive. First, a nudge about which pattern applies. Next, a pointer to the specific technique. Only if you ask again do you see the mechanics. The goal is to close your gap, not replace your thinking.',
  },
  {
    q: 'Does this prep me for top tech companies?',
    a: 'Yes. The Pattern Library covers every template you see in FAANG-style interviews, including BFS, DFS, Backtracking, Dynamic Programming, Heaps, and Tries. The Interview Ready path drills timed problem solving, communication, and clean code writing.',
  },
  {
    q: 'Can I cancel Pro anytime?',
    a: 'Yes. Cancel from your dashboard in one click. You keep Pro access until the end of your current billing period, then drop to the free plan. No emails, no friction.',
  },
];
