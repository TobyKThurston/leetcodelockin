// ─── Sliding Window problems ─────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const SLIDING_WINDOW_PROBLEMS: ProblemContent[] = [
  // ─── Best Time to Buy and Sell Stock (LC #121) ─────────────────────────────
  {
    slug: 'best-time-to-buy-and-sell-stock',
    lcNumber: 121,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    pattern: 'One Pass',
    tags: ['array', 'greedy'],
    descriptionMd: `You are given an array \`prices\` where \`prices[i]\` is the price of a stock on day \`i\`.

You may pick **one day** to buy and a **later day** to sell. Return the largest profit you can
make. If no profit is possible, return \`0\`.

The single-pass trick: walk through the prices once, tracking the lowest price you have seen so
far, and at each day compute today's price minus that minimum. Keep the largest such difference.`,
    examples: [
      {
        input: 'prices = [9, 2, 7, 1, 8, 3]',
        output: '7',
        explanation: 'Buy on day 3 (price 1) and sell on day 4 (price 8) for a profit of 7.',
      },
      {
        input: 'prices = [10, 9, 8, 7]',
        output: '0',
        explanation: 'Prices only go down, so the best move is not to trade.',
      },
    ],
    constraints: [
      '`1 <= len(prices) <= 10^5`',
      '`0 <= prices[i] <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        # Return the largest profit from one buy and one later sell.
        pass
`,
    },
    methodName: 'maxProfit',
    argKeys: ['prices'],
    defaultTests: [
      { label: 'Profit possible', inputJson: '{"prices":[9,2,7,1,8,3]}', expectedJson: '7' },
      { label: 'Strictly down',   inputJson: '{"prices":[10,9,8,7]}',    expectedJson: '0' },
      { label: 'Single day',      inputJson: '{"prices":[5]}',           expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Longest Substring Without Repeating Characters (LC #3) ────────────────
  {
    slug: 'longest-substring-without-repeating-characters',
    lcNumber: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    pattern: 'Sliding Window',
    tags: ['string', 'sliding-window', 'hash-map'],
    descriptionMd: `Given a string \`s\`, return the length of the **longest contiguous substring** that
contains no repeated characters.

The textbook solution is a sliding window with a set or last-seen map: expand the right edge
forward, and whenever you see a character already inside the window, shrink the left edge until
the duplicate is gone.`,
    examples: [
      {
        input: 's = "fishchips"',
        output: '5',
        explanation: 'The longest unique-character window is "chips" (length 5).',
      },
      {
        input: 's = "aaaa"',
        output: '1',
      },
      {
        input: 's = ""',
        output: '0',
      },
    ],
    constraints: [
      '`0 <= len(s) <= 5 * 10^4`',
      '`s` consists of printable ASCII characters.',
    ],
    starterCode: {
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Return the length of the longest substring with all distinct characters.
        pass
`,
    },
    methodName: 'lengthOfLongestSubstring',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Mixed',  inputJson: '{"s":"fishchips"}', expectedJson: '5' },
      { label: 'All same',inputJson: '{"s":"aaaa"}',     expectedJson: '1' },
      { label: 'Empty',  inputJson: '{"s":""}',          expectedJson: '0' },
      { label: 'No dups',inputJson: '{"s":"abcdef"}',    expectedJson: '6' },
    ],
    resultCompare: 'exact',
  },

  // ─── Maximum Average Subarray I (LC #643) ──────────────────────────────────
  {
    slug: 'maximum-average-subarray-i',
    lcNumber: 643,
    title: 'Maximum Average Subarray I',
    difficulty: 'Easy',
    pattern: 'Fixed Window',
    tags: ['array', 'sliding-window'],
    descriptionMd: `You are given an integer array \`nums\` and an integer \`k\`. Find the contiguous
subarray of length exactly \`k\` that has the largest average value, and return that average
as a float.

Because the window size is fixed, the usual trick is to compute the sum of the first window,
then slide it one step at a time by adding the new right element and subtracting the old left
element. Divide the best sum by \`k\` at the end.`,
    examples: [
      {
        input: 'nums = [2, 4, 1, 5, 3], k = 2',
        output: '4.0',
        explanation: 'The window [5, 3] has sum 8 and average 4.0.',
      },
      {
        input: 'nums = [-1, -2, -3, -4], k = 2',
        output: '-1.5',
      },
    ],
    constraints: [
      '`1 <= k <= len(nums) <= 10^5`',
      '`-10^4 <= nums[i] <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def findMaxAverage(self, nums: list[int], k: int) -> float:
        # Return the largest average of any length-k contiguous window of nums.
        pass
`,
    },
    methodName: 'findMaxAverage',
    argKeys: ['nums', 'k'],
    defaultTests: [
      { label: 'Window of 2',   inputJson: '{"nums":[2,4,1,5,3],"k":2}',     expectedJson: '4.0'  },
      { label: 'All negatives', inputJson: '{"nums":[-1,-2,-3,-4],"k":2}',   expectedJson: '-1.5' },
      { label: 'Whole array',   inputJson: '{"nums":[5,5,5,5],"k":4}',       expectedJson: '5.0'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Contains Duplicate II (LC #219) ───────────────────────────────────────
  {
    slug: 'contains-duplicate-ii',
    lcNumber: 219,
    title: 'Contains Duplicate II',
    difficulty: 'Easy',
    pattern: 'Hash Map',
    tags: ['array', 'hash-map', 'sliding-window'],
    descriptionMd: `Given an integer array \`nums\` and an integer \`k\`, return \`True\` if there exist
**two distinct indices** \`i\` and \`j\` such that \`nums[i] == nums[j]\` and
\`abs(i - j) <= k\`. Otherwise return \`False\`.

The canonical solution keeps a hash map from value to most recent index, checking whether the
previous occurrence of each value is within distance \`k\` as you scan.`,
    examples: [
      {
        input: 'nums = [5, 6, 5], k = 2',
        output: 'True',
      },
      {
        input: 'nums = [5, 6, 5], k = 1',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^5`',
      '`-10^9 <= nums[i] <= 10^9`',
      '`0 <= k <= 10^5`',
    ],
    starterCode: {
      python: `class Solution:
    def containsNearbyDuplicate(self, nums: list[int], k: int) -> bool:
        # Return True if nums has duplicate values within k positions of each other.
        pass
`,
    },
    methodName: 'containsNearbyDuplicate',
    argKeys: ['nums', 'k'],
    defaultTests: [
      { label: 'Within k',  inputJson: '{"nums":[5,6,5],"k":2}',   expectedJson: 'true'  },
      { label: 'Beyond k',  inputJson: '{"nums":[5,6,5],"k":1}',   expectedJson: 'false' },
      { label: 'No dups',   inputJson: '{"nums":[1,2,3,4],"k":3}', expectedJson: 'false' },
    ],
    resultCompare: 'exact',
  },

  // ─── Minimum Size Subarray Sum (LC #209) ───────────────────────────────────
  {
    slug: 'minimum-size-subarray-sum',
    lcNumber: 209,
    title: 'Minimum Size Subarray Sum',
    difficulty: 'Medium',
    pattern: 'Variable Window',
    tags: ['array', 'sliding-window'],
    descriptionMd: `Given an array of positive integers \`nums\` and a positive integer \`target\`,
return the **minimum length** of a contiguous subarray whose sum is \`>= target\`. If no such
subarray exists, return \`0\`.

Because the values are positive, the running sum is monotonic in window size. That lets you
use a classic variable-size sliding window: grow the window by moving \`right\`, and whenever
the sum reaches \`target\` shrink from the left while the sum stays large enough.`,
    examples: [
      {
        input: 'nums = [4, 2, 2, 5, 1, 6], target = 10',
        output: '3',
        explanation: 'The shortest qualifying window is [5, 1, 6] with sum 12.',
      },
      {
        input: 'nums = [1, 1, 1], target = 10',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^5`',
      '`1 <= nums[i] <= 10^4`',
      '`1 <= target <= 10^9`',
    ],
    starterCode: {
      python: `class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        # Return the shortest contiguous window whose sum is at least target, or 0 if impossible.
        pass
`,
    },
    methodName: 'minSubArrayLen',
    argKeys: ['target', 'nums'],
    defaultTests: [
      { label: 'Three wide',  inputJson: '{"target":10,"nums":[4,2,2,5,1,6]}', expectedJson: '3' },
      { label: 'Impossible',  inputJson: '{"target":10,"nums":[1,1,1]}',       expectedJson: '0' },
      { label: 'Exact fit',   inputJson: '{"target":11,"nums":[5,6]}',         expectedJson: '2' },
    ],
    resultCompare: 'exact',
  },

  // ─── Maximum Number of Vowels in a Substring of Given Length (LC #1456) ────
  {
    slug: 'maximum-number-of-vowels-in-a-substring-of-given-length',
    lcNumber: 1456,
    title: 'Maximum Number of Vowels in a Substring of Given Length',
    difficulty: 'Medium',
    pattern: 'Fixed Window',
    tags: ['string', 'sliding-window'],
    descriptionMd: `Given a lowercase string \`s\` and an integer \`k\`, return the maximum number of
vowel letters (\`a\`, \`e\`, \`i\`, \`o\`, \`u\`) appearing in any contiguous substring of
length exactly \`k\`.

This is a fixed-size window problem: compute the vowel count of the first \`k\` characters,
then slide the window one character at a time, incrementing/decrementing the count based on
what enters and leaves the window.`,
    examples: [
      {
        input: 's = "greedy", k = 3',
        output: '2',
        explanation: 'Windows "ree" and "eed" each contain 2 vowels.',
      },
      {
        input: 's = "rhythm", k = 2',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 10^5`',
      '`1 <= k <= len(s)`',
      '`s` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def maxVowels(self, s: str, k: int) -> int:
        # Return the maximum vowel count of any length-k window of s.
        pass
`,
    },
    methodName: 'maxVowels',
    argKeys: ['s', 'k'],
    defaultTests: [
      { label: 'Mixed',      inputJson: '{"s":"greedy","k":3}',  expectedJson: '2' },
      { label: 'No vowels',  inputJson: '{"s":"rhythm","k":2}',  expectedJson: '0' },
      { label: 'All vowels', inputJson: '{"s":"aeiou","k":5}',   expectedJson: '5' },
    ],
    resultCompare: 'exact',
  },

  // ─── Permutation in String (LC #567) ───────────────────────────────────────
  {
    slug: 'permutation-in-string',
    lcNumber: 567,
    title: 'Permutation in String',
    difficulty: 'Medium',
    pattern: 'Frequency Map',
    tags: ['string', 'sliding-window', 'frequency-map'],
    descriptionMd: `Given two strings \`s1\` and \`s2\`, return \`True\` if \`s2\` contains any
**permutation** of \`s1\` as a contiguous substring. Otherwise return \`False\`.

Equivalently: is there a window of length \`len(s1)\` in \`s2\` whose character counts exactly
match those of \`s1\`? The usual solution maintains two length-26 frequency arrays (one for
\`s1\`, one for the current window in \`s2\`) and slides the window one character at a time.`,
    examples: [
      {
        input: 's1 = "abc", s2 = "lazabcxyz"',
        output: 'True',
        explanation: 'The substring "abc" at position 3 matches exactly.',
      },
      {
        input: 's1 = "xy", s2 = "yxwz"',
        output: 'True',
        explanation: '"yx" is a permutation of "xy".',
      },
      {
        input: 's1 = "ab", s2 = "a"',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(s1), len(s2) <= 10^4`',
      '`s1` and `s2` consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        # Return True if any substring of s2 is a permutation of s1.
        pass
`,
    },
    methodName: 'checkInclusion',
    argKeys: ['s1', 's2'],
    defaultTests: [
      { label: 'Exact match',   inputJson: '{"s1":"abc","s2":"lazabcxyz"}', expectedJson: 'true'  },
      { label: 'Rearranged',    inputJson: '{"s1":"xy","s2":"yxwz"}',       expectedJson: 'true'  },
      { label: 'Too short',     inputJson: '{"s1":"ab","s2":"a"}',          expectedJson: 'false' },
      { label: 'No match',      inputJson: '{"s1":"abc","s2":"aabbcc"}',    expectedJson: 'false' },
    ],
    resultCompare: 'exact',
  },

  // ─── Find All Anagrams in a String (LC #438) ───────────────────────────────
  {
    slug: 'find-all-anagrams-in-a-string',
    lcNumber: 438,
    title: 'Find All Anagrams in a String',
    difficulty: 'Medium',
    pattern: 'Frequency Map',
    tags: ['string', 'sliding-window', 'frequency-map'],
    descriptionMd: `Given two strings \`s\` and \`p\`, return a list of all the **start indices** in
\`s\` where a substring is an anagram of \`p\`.

Use a sliding frequency map of size \`len(p)\` over \`s\` and record the current start index
every time the window's frequency counts match those of \`p\`. Indices should be returned in
ascending order.`,
    examples: [
      {
        input: 's = "abab", p = "ab"',
        output: '[0, 1, 2]',
        explanation: 'Windows "ab", "ba", and "ab" are all anagrams of "ab".',
      },
      {
        input: 's = "xxx", p = "x"',
        output: '[0, 1, 2]',
      },
    ],
    constraints: [
      '`1 <= len(s), len(p) <= 3 * 10^4`',
      '`s` and `p` consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def findAnagrams(self, s: str, p: str) -> list[int]:
        # Return every starting index in s where a substring is an anagram of p.
        pass
`,
    },
    methodName: 'findAnagrams',
    argKeys: ['s', 'p'],
    defaultTests: [
      { label: 'Multiple hits', inputJson: '{"s":"abab","p":"ab"}', expectedJson: '[0,1,2]' },
      { label: 'Single char',   inputJson: '{"s":"xxx","p":"x"}',   expectedJson: '[0,1,2]' },
      { label: 'No match',      inputJson: '{"s":"abc","p":"de"}',  expectedJson: '[]'      },
    ],
    resultCompare: 'exact',
  },

  // ─── Longest Repeating Character Replacement (LC #424) ─────────────────────
  {
    slug: 'longest-repeating-character-replacement',
    lcNumber: 424,
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    pattern: 'Variable Window',
    tags: ['string', 'sliding-window', 'frequency-map'],
    descriptionMd: `Given an uppercase string \`s\` and an integer \`k\`, return the length of the
longest contiguous substring you can make consist of the **same single letter** by replacing
at most \`k\` characters (with any letters you choose).

The variable-window trick: expand the right edge freely, and whenever
\`window_length - (highest letter count inside the window) > k\`, shrink the left edge. The
answer is the maximum window length seen at any point.`,
    examples: [
      {
        input: 's = "AABABB", k = 2',
        output: '5',
        explanation: 'Replace the two non-B characters in "ABABB" to get "BBBBB" — length 5.',
      },
      {
        input: 's = "ABCD", k = 0',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 10^5`',
      '`0 <= k <= len(s)`',
      '`s` consists of uppercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        # Return the longest substring that becomes a single repeated char after at most k swaps.
        pass
`,
    },
    methodName: 'characterReplacement',
    argKeys: ['s', 'k'],
    defaultTests: [
      { label: 'Two swaps',   inputJson: '{"s":"AABABB","k":2}', expectedJson: '5' },
      { label: 'No swaps',    inputJson: '{"s":"ABCD","k":0}',   expectedJson: '1' },
      { label: 'Already same',inputJson: '{"s":"AAAA","k":0}',   expectedJson: '4' },
    ],
    resultCompare: 'exact',
  },

  // ─── Subarray Product Less Than K (LC #713) ────────────────────────────────
  {
    slug: 'subarray-product-less-than-k',
    lcNumber: 713,
    title: 'Subarray Product Less Than K',
    difficulty: 'Medium',
    pattern: 'Variable Window',
    tags: ['array', 'sliding-window'],
    descriptionMd: `Given an array of positive integers \`nums\` and an integer \`k\`, return the number
of contiguous non-empty subarrays whose **product is strictly less than** \`k\`.

Because every element is positive, the running product is monotonic in window size, which is
exactly what lets a sliding window work. Grow the right edge, multiplying as you go. Whenever
the product hits \`k\` or more, shrink from the left (dividing out) until it drops below
\`k\`. The number of qualifying subarrays ending at \`right\` is \`right - left + 1\`.`,
    examples: [
      {
        input: 'nums = [1, 2, 3], k = 7',
        output: '6',
        explanation: 'All six non-empty subarrays have a product under 7.',
      },
      {
        input: 'nums = [5, 5, 5], k = 5',
        output: '0',
        explanation: 'Every single element already equals 5, so none is strictly less than k.',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 3 * 10^4`',
      '`1 <= nums[i] <= 1000`',
      '`0 <= k <= 10^6`',
    ],
    starterCode: {
      python: `class Solution:
    def numSubarrayProductLessThanK(self, nums: list[int], k: int) -> int:
        # Return the number of contiguous non-empty subarrays whose product is < k.
        pass
`,
    },
    methodName: 'numSubarrayProductLessThanK',
    argKeys: ['nums', 'k'],
    defaultTests: [
      { label: 'All under',   inputJson: '{"nums":[1,2,3],"k":7}',   expectedJson: '6' },
      { label: 'None under',  inputJson: '{"nums":[5,5,5],"k":5}',   expectedJson: '0' },
      { label: 'Ones easy',   inputJson: '{"nums":[1,1,1],"k":2}',   expectedJson: '6' },
    ],
    resultCompare: 'exact',
  },

  // ─── Fruit Into Baskets (LC #904) ──────────────────────────────────────────
  {
    slug: 'fruit-into-baskets',
    lcNumber: 904,
    title: 'Fruit Into Baskets',
    difficulty: 'Medium',
    pattern: 'Variable Window',
    tags: ['array', 'sliding-window'],
    descriptionMd: `You are standing in front of a row of fruit trees, represented by the integer
array \`fruits\` where \`fruits[i]\` is the type of fruit on the \`i\`-th tree. You have two
baskets, and **each basket can only hold one type of fruit**. You must pick from a contiguous
stretch of trees starting from the first tree you choose, and you must pick one fruit from
every tree you pass.

Return the **maximum number of fruits** you can collect. Equivalently: the length of the
longest contiguous subarray of \`fruits\` that contains at most **two distinct values**.

The usual solution is a variable-size window that tracks a count of each type inside. When a
third distinct value appears, shrink from the left until one type's count drops to zero.`,
    examples: [
      {
        input: 'fruits = [1, 2, 1, 3, 4, 3, 3]',
        output: '4',
        explanation: 'Pick the contiguous stretch [4, 3, 3, 3] of length 4 — wait, read again: the window [3,4,3,3] starts at index 3. Two types, length 4.',
      },
      {
        input: 'fruits = [2, 2, 2]',
        output: '3',
      },
    ],
    constraints: [
      '`1 <= len(fruits) <= 10^5`',
      '`0 <= fruits[i] <= len(fruits) - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def totalFruit(self, fruits: list[int]) -> int:
        # Return the length of the longest contiguous window containing at most two distinct values.
        pass
`,
    },
    methodName: 'totalFruit',
    argKeys: ['fruits'],
    defaultTests: [
      { label: 'Two types win', inputJson: '{"fruits":[1,2,1,3,4,3,3]}', expectedJson: '4' },
      { label: 'Uniform',       inputJson: '{"fruits":[2,2,2]}',         expectedJson: '3' },
      { label: 'Single tree',   inputJson: '{"fruits":[5]}',             expectedJson: '1' },
    ],
    resultCompare: 'exact',
  },

  // ─── Minimum Window Substring (LC #76) ─────────────────────────────────────
  {
    slug: 'minimum-window-substring',
    lcNumber: 76,
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    pattern: 'Frequency Map',
    tags: ['string', 'sliding-window', 'frequency-map'],
    descriptionMd: `Given two strings \`s\` and \`t\`, return the **shortest contiguous substring** of
\`s\` that contains every character of \`t\` (including repetitions). If no such window exists,
return the empty string \`""\`.

The classic solution maintains a frequency map of \`t\`, a \`need\` counter, and a sliding
window. Expand the right edge until every required character is covered, then shrink the
left edge as far as possible while still covered, recording the smallest window each time.`,
    examples: [
      {
        input: 's = "abbcba", t = "abc"',
        output: '"cba"',
        explanation: 'The window "cba" has length 3 and contains one of each required letter.',
      },
      {
        input: 's = "a", t = "b"',
        output: '""',
      },
    ],
    constraints: [
      '`1 <= len(s), len(t) <= 10^5`',
      '`s` and `t` consist of uppercase and lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        # Return the shortest substring of s that contains every char of t (with counts), or "".
        pass
`,
    },
    methodName: 'minWindow',
    argKeys: ['s', 't'],
    defaultTests: [
      { label: 'Three letters', inputJson: '{"s":"abbcba","t":"abc"}', expectedJson: '"cba"' },
      { label: 'Impossible',    inputJson: '{"s":"a","t":"b"}',        expectedJson: '""'    },
      { label: 'Whole string',  inputJson: '{"s":"abc","t":"ac"}',     expectedJson: '"abc"' },
    ],
    resultCompare: 'exact',
  },
];
