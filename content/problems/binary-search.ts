// ─── Binary Search problems ──────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const BINARY_SEARCH_PROBLEMS: ProblemContent[] = [
  // ─── Binary Search (LC #704) ────────────────────────────────────────────────
  {
    slug: 'binary-search',
    lcNumber: 704,
    title: 'Binary Search',
    difficulty: 'Easy',
    pattern: 'Binary Search',
    tags: ['array', 'binary-search'],
    descriptionMd: `Given a **sorted** integer array \`nums\` (ascending order, no duplicates) and a value
\`target\`, return the **index** of \`target\` if it is in the array, or \`-1\` if it is not.

Your solution should run in \`O(log n)\` time. The classic implementation maintains \`lo\` and
\`hi\` bounds, computes \`mid\`, and shrinks the range based on how \`nums[mid]\` compares to
\`target\`.`,
    examples: [
      {
        input: 'nums = [-3, 0, 4, 8, 11, 17], target = 8',
        output: '3',
      },
      {
        input: 'nums = [-3, 0, 4, 8, 11, 17], target = 5',
        output: '-1',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^4`',
      '`-10^4 < nums[i], target < 10^4`',
      '`nums` is sorted in ascending order with all values distinct.',
    ],
    starterCode: {
      python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Return the index of target in the sorted array nums, or -1 if absent.
        pass
`,
    },
    methodName: 'search',
    argKeys: ['nums', 'target'],
    defaultTests: [
      { label: 'Found',     inputJson: '{"nums":[-3,0,4,8,11,17],"target":8}',  expectedJson: '3'  },
      { label: 'Missing',   inputJson: '{"nums":[-3,0,4,8,11,17],"target":5}',  expectedJson: '-1' },
      { label: 'First',     inputJson: '{"nums":[1,2,3,4,5],"target":1}',       expectedJson: '0'  },
      { label: 'Last',      inputJson: '{"nums":[1,2,3,4,5],"target":5}',       expectedJson: '4'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Search Insert Position (LC #35) ───────────────────────────────────────
  {
    slug: 'search-insert-position',
    lcNumber: 35,
    title: 'Search Insert Position',
    difficulty: 'Easy',
    pattern: 'Binary Search',
    tags: ['array', 'binary-search'],
    descriptionMd: `Given a sorted array of distinct integers \`nums\` and a target value \`target\`,
return the index where \`target\` would be found if it exists, or the index where it would be
**inserted to keep the array sorted** if it does not.

Your solution must run in \`O(log n)\` time. This is a standard lower-bound binary search:
at each step shrink the range based on whether \`nums[mid]\` is below or not below the target.`,
    examples: [
      {
        input: 'nums = [2, 4, 6, 8], target = 5',
        output: '2',
        explanation: '5 would be inserted between 4 and 6 at index 2.',
      },
      {
        input: 'nums = [2, 4, 6, 8], target = 4',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^4`',
      '`-10^4 <= nums[i], target <= 10^4`',
      '`nums` is sorted ascending with all distinct values.',
    ],
    starterCode: {
      python: `class Solution:
    def searchInsert(self, nums: list[int], target: int) -> int:
        # Return the index where target is (or would be inserted).
        pass
`,
    },
    methodName: 'searchInsert',
    argKeys: ['nums', 'target'],
    defaultTests: [
      { label: 'Between',    inputJson: '{"nums":[2,4,6,8],"target":5}',  expectedJson: '2' },
      { label: 'Found',      inputJson: '{"nums":[2,4,6,8],"target":4}',  expectedJson: '1' },
      { label: 'Append',     inputJson: '{"nums":[2,4,6,8],"target":10}', expectedJson: '4' },
      { label: 'Prepend',    inputJson: '{"nums":[2,4,6,8],"target":1}',  expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── First Bad Version (LC #278) ───────────────────────────────────────────
  {
    slug: 'first-bad-version',
    lcNumber: 278,
    title: 'First Bad Version',
    difficulty: 'Easy',
    pattern: 'Binary Search',
    tags: ['binary-search'],
    descriptionMd: `You have versions numbered \`1..n\` of a product. Starting at some **first bad
version** \`bad\`, every subsequent version is also bad. Given \`n\` and a helper that tells
you whether a specific version is bad, return the first bad version.

On LeetCode the helper is an external \`isBadVersion(v)\` API. To keep this problem
self-contained, our grader passes the true cutoff as a second argument \`bad\` and asks you
to return the smallest version number \`v\` with \`v >= bad\`, using a **binary search**
(not a linear scan — the judge times long runs out).`,
    examples: [
      {
        input: 'n = 10, bad = 5',
        output: '5',
      },
      {
        input: 'n = 1, bad = 1',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= bad <= n <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def firstBadVersion(self, n: int, bad: int) -> int:
        # Return the smallest v in [1, n] such that v >= bad. Use a binary search.
        pass
`,
    },
    methodName: 'firstBadVersion',
    argKeys: ['n', 'bad'],
    defaultTests: [
      { label: 'Mid',   inputJson: '{"n":10,"bad":5}',    expectedJson: '5'   },
      { label: 'First', inputJson: '{"n":1,"bad":1}',     expectedJson: '1'   },
      { label: 'Last',  inputJson: '{"n":100,"bad":100}', expectedJson: '100' },
    ],
    resultCompare: 'exact',
  },

  // ─── Sqrt(x) (LC #69) ──────────────────────────────────────────────────────
  {
    slug: 'sqrtx',
    lcNumber: 69,
    title: 'Sqrt(x)',
    difficulty: 'Easy',
    pattern: 'Binary Search',
    tags: ['math', 'binary-search'],
    descriptionMd: `Given a non-negative integer \`x\`, return the **integer square root** of \`x\` —
that is, the largest integer \`r\` such that \`r * r <= x\`.

You must not use any built-in square-root function. The canonical solution is a binary search
over the range \`[0, x]\` looking for the largest \`mid\` whose square does not exceed \`x\`.`,
    examples: [
      {
        input: 'x = 9',
        output: '3',
      },
      {
        input: 'x = 8',
        output: '2',
        explanation: 'Square root of 8 is about 2.828, which rounds down to 2.',
      },
    ],
    constraints: [
      '`0 <= x <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def mySqrt(self, x: int) -> int:
        # Return the largest integer r with r*r <= x. Do not use math.sqrt.
        pass
`,
    },
    methodName: 'mySqrt',
    argKeys: ['x'],
    defaultTests: [
      { label: 'Perfect square',   inputJson: '{"x":9}',   expectedJson: '3'  },
      { label: 'Non-perfect',      inputJson: '{"x":8}',   expectedJson: '2'  },
      { label: 'Zero',             inputJson: '{"x":0}',   expectedJson: '0'  },
      { label: 'One',              inputJson: '{"x":1}',   expectedJson: '1'  },
      { label: 'Larger',           inputJson: '{"x":100}', expectedJson: '10' },
    ],
    resultCompare: 'exact',
  },

  // ─── Guess Number Higher or Lower (LC #374) ────────────────────────────────
  {
    slug: 'guess-number-higher-or-lower',
    lcNumber: 374,
    title: 'Guess Number Higher or Lower',
    difficulty: 'Easy',
    pattern: 'Binary Search',
    tags: ['binary-search'],
    descriptionMd: `Somebody picked a number \`pick\` from the range \`[1, n]\` and will tell you whether
your guess is too high, too low, or correct. Find \`pick\`.

On LeetCode the oracle is an external \`guess(num)\` API. To keep this problem
self-contained, our grader passes \`pick\` as a second argument so your solution can compare
directly. You must still use a **binary search** rather than a linear scan.`,
    examples: [
      {
        input: 'n = 10, pick = 6',
        output: '6',
      },
      {
        input: 'n = 1, pick = 1',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= pick <= n <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def guessNumber(self, n: int, pick: int) -> int:
        # Binary search over [1, n] and return pick.
        pass
`,
    },
    methodName: 'guessNumber',
    argKeys: ['n', 'pick'],
    defaultTests: [
      { label: 'Mid',   inputJson: '{"n":10,"pick":6}',  expectedJson: '6' },
      { label: 'Only', inputJson: '{"n":1,"pick":1}',    expectedJson: '1' },
      { label: 'Top',  inputJson: '{"n":20,"pick":20}',  expectedJson: '20' },
    ],
    resultCompare: 'exact',
  },

  // ─── Find First and Last Position of Element in Sorted Array (LC #34) ─────
  {
    slug: 'find-first-and-last-position-of-element-in-sorted-array',
    lcNumber: 34,
    title: 'Find First and Last Position of Element in Sorted Array',
    difficulty: 'Medium',
    pattern: 'Binary Search',
    tags: ['array', 'binary-search'],
    descriptionMd: `Given an ascending sorted integer array \`nums\` (with possible duplicates) and a
\`target\`, return a length-2 list \`[first, last]\` giving the first and last index where
\`target\` appears. If \`target\` is not in \`nums\`, return \`[-1, -1]\`.

Your solution must run in \`O(log n)\` time. The idiomatic approach is two binary searches —
one for the left bound (lower bound) and one for the right bound (upper bound minus one).`,
    examples: [
      {
        input: 'nums = [1, 2, 2, 2, 3, 4], target = 2',
        output: '[1, 3]',
      },
      {
        input: 'nums = [1, 2, 3], target = 5',
        output: '[-1, -1]',
      },
    ],
    constraints: [
      '`0 <= len(nums) <= 10^5`',
      '`-10^9 <= nums[i], target <= 10^9`',
      '`nums` is sorted in non-decreasing order.',
    ],
    starterCode: {
      python: `class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        # Return [first_index, last_index] of target in nums, or [-1, -1] if absent.
        pass
`,
    },
    methodName: 'searchRange',
    argKeys: ['nums', 'target'],
    defaultTests: [
      { label: 'Range',    inputJson: '{"nums":[1,2,2,2,3,4],"target":2}', expectedJson: '[1,3]'   },
      { label: 'Missing',  inputJson: '{"nums":[1,2,3],"target":5}',       expectedJson: '[-1,-1]' },
      { label: 'Single',   inputJson: '{"nums":[5],"target":5}',           expectedJson: '[0,0]'   },
    ],
    resultCompare: 'exact',
  },

  // ─── Search in Rotated Sorted Array (LC #33) ───────────────────────────────
  {
    slug: 'search-in-rotated-sorted-array',
    lcNumber: 33,
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    pattern: 'Binary Search',
    tags: ['array', 'binary-search'],
    descriptionMd: `You are given an integer array \`nums\` that was originally sorted in ascending order
with distinct values, then rotated left by some unknown amount (so, e.g., \`[1,2,3,4,5]\`
might now be \`[3,4,5,1,2]\`). Given a \`target\`, return the **index** of \`target\` in the
rotated array, or \`-1\` if it is not present.

Your solution must run in \`O(log n)\` time. The trick is that one of the two halves split
by \`mid\` is still sorted — check which, decide whether \`target\` fits in the sorted half,
and recurse into that half or the other.`,
    examples: [
      {
        input: 'nums = [6, 7, 8, 1, 2, 3, 4, 5], target = 3',
        output: '5',
      },
      {
        input: 'nums = [6, 7, 8, 1, 2, 3, 4, 5], target = 9',
        output: '-1',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 5000`',
      '`-10^4 <= nums[i], target <= 10^4`',
      'All values in `nums` are distinct.',
    ],
    starterCode: {
      python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        # Return the index of target in the rotated sorted nums, or -1.
        pass
`,
    },
    methodName: 'search',
    argKeys: ['nums', 'target'],
    defaultTests: [
      { label: 'Rotated hit',  inputJson: '{"nums":[6,7,8,1,2,3,4,5],"target":3}', expectedJson: '5'  },
      { label: 'Rotated miss', inputJson: '{"nums":[6,7,8,1,2,3,4,5],"target":9}', expectedJson: '-1' },
      { label: 'Single',       inputJson: '{"nums":[3],"target":3}',                expectedJson: '0'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Find Minimum in Rotated Sorted Array (LC #153) ────────────────────────
  {
    slug: 'find-minimum-in-rotated-sorted-array',
    lcNumber: 153,
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    pattern: 'Binary Search',
    tags: ['array', 'binary-search'],
    descriptionMd: `You are given an integer array \`nums\` of distinct values, originally sorted in
ascending order, then rotated left by an unknown amount. Return the **minimum** value in the
rotated array.

Your solution must run in \`O(log n)\` time. At every step compare \`nums[mid]\` to
\`nums[right]\`: if \`nums[mid] > nums[right]\` the minimum is strictly right of \`mid\`;
otherwise it is at \`mid\` or to the left.`,
    examples: [
      {
        input: 'nums = [6, 7, 8, 1, 2, 3, 4, 5]',
        output: '1',
      },
      {
        input: 'nums = [1, 2, 3]',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 5000`',
      '`-5000 <= nums[i] <= 5000`',
      'All values in `nums` are distinct.',
    ],
    starterCode: {
      python: `class Solution:
    def findMin(self, nums: list[int]) -> int:
        # Return the minimum of the rotated sorted nums in O(log n).
        pass
`,
    },
    methodName: 'findMin',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Rotated', inputJson: '{"nums":[6,7,8,1,2,3,4,5]}', expectedJson: '1' },
      { label: 'Not rotated', inputJson: '{"nums":[1,2,3]}',       expectedJson: '1' },
      { label: 'Small rotate',inputJson: '{"nums":[2,1]}',          expectedJson: '1' },
    ],
    resultCompare: 'exact',
  },

  // ─── Koko Eating Bananas (LC #875) ─────────────────────────────────────────
  {
    slug: 'koko-eating-bananas',
    lcNumber: 875,
    title: 'Koko Eating Bananas',
    difficulty: 'Medium',
    pattern: 'Answer Space',
    tags: ['array', 'binary-search'],
    descriptionMd: `Koko has \`piles[i]\` bananas in pile \`i\` and exactly \`h\` hours to finish them
all. Each hour she picks one pile and eats up to \`k\` bananas from it (if the pile has fewer
than \`k\` she eats the whole pile that hour but still uses the hour). Return the **minimum
\`k\`** such that Koko can finish every pile within \`h\` hours.

This is the canonical "binary search on the answer" problem. The eating speed is
monotone — if some speed \`k\` works, every larger speed also works — so you can binary
search \`k\` over \`[1, max(piles)]\`.`,
    examples: [
      {
        input: 'piles = [5, 10, 15], h = 6',
        output: '5',
        explanation: 'At speed 5, hours used = ceil(5/5) + ceil(10/5) + ceil(15/5) = 1 + 2 + 3 = 6.',
      },
      {
        input: 'piles = [10], h = 1',
        output: '10',
      },
    ],
    constraints: [
      '`1 <= len(piles) <= 10^4`',
      '`1 <= piles[i] <= 10^9`',
      '`len(piles) <= h <= 10^9`',
    ],
    starterCode: {
      python: `class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        # Return the minimum integer k such that Koko finishes in h hours.
        pass
`,
    },
    methodName: 'minEatingSpeed',
    argKeys: ['piles', 'h'],
    defaultTests: [
      { label: 'Tight fit',    inputJson: '{"piles":[5,10,15],"h":6}',  expectedJson: '5'  },
      { label: 'Single hour',  inputJson: '{"piles":[10],"h":1}',       expectedJson: '10' },
      { label: 'Plenty of time', inputJson: '{"piles":[1,2,3],"h":10}', expectedJson: '1'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Capacity To Ship Packages Within D Days (LC #1011) ────────────────────
  {
    slug: 'capacity-to-ship-packages-within-d-days',
    lcNumber: 1011,
    title: 'Capacity To Ship Packages Within D Days',
    difficulty: 'Medium',
    pattern: 'Answer Space',
    tags: ['array', 'binary-search'],
    descriptionMd: `You are given an array \`weights\` representing the weights of packages that must be
shipped **in the listed order**, and an integer \`days\`. Each day you pick the next prefix of
remaining packages that fits within the boat's capacity. Return the **minimum boat capacity**
that lets you ship every package within \`days\` days.

This is another binary search on the answer: the capacity is monotone, so search the range
\`[max(weights), sum(weights)]\`. The predicate is a greedy simulation of the day-by-day
loading.`,
    examples: [
      {
        input: 'weights = [3, 2, 2, 4, 1, 4], days = 3',
        output: '6',
        explanation: 'Day 1 loads [3,2], day 2 loads [2,4], day 3 loads [1,4]. Max load = 6.',
      },
      {
        input: 'weights = [1, 1, 1], days = 1',
        output: '3',
      },
    ],
    constraints: [
      '`1 <= days <= len(weights) <= 5 * 10^4`',
      '`1 <= weights[i] <= 500`',
    ],
    starterCode: {
      python: `class Solution:
    def shipWithinDays(self, weights: list[int], days: int) -> int:
        # Return the minimum boat capacity that ships every package within days days.
        pass
`,
    },
    methodName: 'shipWithinDays',
    argKeys: ['weights', 'days'],
    defaultTests: [
      { label: 'Three days',  inputJson: '{"weights":[3,2,2,4,1,4],"days":3}', expectedJson: '6' },
      { label: 'Single day',  inputJson: '{"weights":[1,1,1],"days":1}',       expectedJson: '3' },
      { label: 'Per day',     inputJson: '{"weights":[2,5,3],"days":3}',       expectedJson: '5' },
    ],
    resultCompare: 'exact',
  },

  // ─── Split Array Largest Sum (LC #410) ─────────────────────────────────────
  {
    slug: 'split-array-largest-sum',
    lcNumber: 410,
    title: 'Split Array Largest Sum',
    difficulty: 'Hard',
    pattern: 'Answer Space',
    tags: ['array', 'binary-search', 'dp'],
    descriptionMd: `Given an integer array \`nums\` of non-negative values and an integer \`k\`, split
\`nums\` into exactly \`k\` **non-empty contiguous** subarrays so as to **minimise the
largest sum** among those subarrays. Return that minimised largest sum.

Binary search the answer in the range \`[max(nums), sum(nums)]\`. The predicate "is it
possible to split into at most \`k\` subarrays each with sum \`<= mid\`" is a linear greedy
scan, which makes the whole algorithm \`O(n log(sum))\`.`,
    examples: [
      {
        input: 'nums = [1, 2, 3, 4, 5], k = 2',
        output: '9',
        explanation: 'Split as [1,2,3] and [4,5] — sums 6 and 9, max 9.',
      },
      {
        input: 'nums = [1, 4, 4], k = 3',
        output: '4',
      },
    ],
    constraints: [
      '`1 <= k <= len(nums) <= 1000`',
      '`0 <= nums[i] <= 10^6`',
    ],
    starterCode: {
      python: `class Solution:
    def splitArray(self, nums: list[int], k: int) -> int:
        # Return the minimum possible value of the largest subarray sum across k splits.
        pass
`,
    },
    methodName: 'splitArray',
    argKeys: ['nums', 'k'],
    defaultTests: [
      { label: 'Two splits',   inputJson: '{"nums":[1,2,3,4,5],"k":2}', expectedJson: '9' },
      { label: 'Each alone',   inputJson: '{"nums":[1,4,4],"k":3}',     expectedJson: '4' },
      { label: 'Single split', inputJson: '{"nums":[5],"k":1}',         expectedJson: '5' },
    ],
    resultCompare: 'exact',
  },

  // ─── Median of Two Sorted Arrays (LC #4) ───────────────────────────────────
  {
    slug: 'median-of-two-sorted-arrays',
    lcNumber: 4,
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    pattern: 'Binary Search',
    tags: ['array', 'binary-search'],
    descriptionMd: `Given two sorted integer arrays \`nums1\` and \`nums2\` of (possibly different)
lengths, return the **median** of the combined sorted sequence as a floating-point number.

Your solution must run in \`O(log(min(m, n)))\` time. The idiomatic approach is a binary
search on a partition of the shorter array so that the combined left half has the right size
and the \`max(left)\` is \`<= min(right)\`.`,
    examples: [
      {
        input: 'nums1 = [1, 3], nums2 = [2]',
        output: '2.0',
      },
      {
        input: 'nums1 = [1, 2], nums2 = [3, 4]',
        output: '2.5',
      },
    ],
    constraints: [
      '`nums1.length == m, nums2.length == n`',
      '`0 <= m, n <= 1000`',
      '`1 <= m + n <= 2000`',
      'Both arrays are sorted in non-decreasing order.',
    ],
    starterCode: {
      python: `class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        # Return the median of the combined sorted sequence.
        pass
`,
    },
    methodName: 'findMedianSortedArrays',
    argKeys: ['nums1', 'nums2'],
    defaultTests: [
      { label: 'Odd total',    inputJson: '{"nums1":[1,3],"nums2":[2]}',     expectedJson: '2.0' },
      { label: 'Even total',   inputJson: '{"nums1":[1,2],"nums2":[3,4]}',   expectedJson: '2.5' },
      { label: 'One empty',    inputJson: '{"nums1":[],"nums2":[1]}',        expectedJson: '1.0' },
      { label: 'Even, bigger', inputJson: '{"nums1":[1,2,3],"nums2":[4,5,6]}',expectedJson: '3.5' },
    ],
    resultCompare: 'exact',
  },
];
