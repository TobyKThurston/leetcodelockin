// ─── Two Pointers problems ───────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const TWO_POINTERS_PROBLEMS: ProblemContent[] = [
  // ─── Valid Palindrome (LC #125) ─────────────────────────────────────────────
  {
    slug: 'valid-palindrome',
    lcNumber: 125,
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    pattern: 'Two Pointers',
    tags: ['string', 'two-pointers'],
    descriptionMd: `Given a string \`s\`, return \`True\` if it reads the same forwards and backwards
**after dropping every character that is not a letter or digit, and lowercasing the rest**.
Otherwise return \`False\`.

The cleanest solution uses two pointers — one moving in from each end — that skip past any
character that is not alphanumeric and compare the rest case-insensitively.`,
    examples: [
      {
        input: 's = "Step on no pets!"',
        output: 'True',
        explanation: 'Cleaned string is "steponnopets" which is a palindrome.',
      },
      {
        input: 's = "robot"',
        output: 'False',
        explanation: '"robot" reversed is "tobor", which is different.',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 2 * 10^5`',
      '`s` consists of printable ASCII characters.',
    ],
    starterCode: {
      python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        # Return True if s is a palindrome after stripping non-alphanumerics.
        pass
`,
    },
    methodName: 'isPalindrome',
    argKeys: ['s'],
    defaultTests: [
      { label: 'With punctuation', inputJson: '{"s":"Step on no pets!"}', expectedJson: 'true'  },
      { label: 'Plain non-pal',    inputJson: '{"s":"robot"}',            expectedJson: 'false' },
      { label: 'Empty after strip',inputJson: '{"s":".,;"}',              expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Reverse String (LC #344) ───────────────────────────────────────────────
  {
    slug: 'reverse-string',
    lcNumber: 344,
    title: 'Reverse String',
    difficulty: 'Easy',
    pattern: 'Two Pointers',
    tags: ['string', 'two-pointers'],
    descriptionMd: `Given a list of characters \`s\`, reverse the order of the elements and return the
resulting list.

The textbook approach uses two pointers (one at the start, one at the end) that swap characters
as they move toward each other. You should aim for **O(1)** extra memory beyond the input.

> Note: LeetCode asks you to mutate the list in place. To make our test runner happy, please
> also \`return\` the (now reversed) list at the end.`,
    examples: [
      {
        input: 's = ["p","y","t","h","o","n"]',
        output: '["n","o","h","t","y","p"]',
      },
      {
        input: 's = ["a","b"]',
        output: '["b","a"]',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 10^5`',
      '`s[i]` is a printable ASCII character.',
    ],
    starterCode: {
      python: `class Solution:
    def reverseString(self, s: list[str]) -> list[str]:
        # Reverse s in place and return it.
        pass
`,
    },
    methodName: 'reverseString',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Word',         inputJson: '{"s":["p","y","t","h","o","n"]}', expectedJson: '["n","o","h","t","y","p"]' },
      { label: 'Two letters',  inputJson: '{"s":["a","b"]}',                  expectedJson: '["b","a"]'                 },
      { label: 'Single char',  inputJson: '{"s":["x"]}',                      expectedJson: '["x"]'                     },
    ],
    resultCompare: 'exact',
  },

  // ─── Move Zeroes (LC #283) ──────────────────────────────────────────────────
  {
    slug: 'move-zeroes',
    lcNumber: 283,
    title: 'Move Zeroes',
    difficulty: 'Easy',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers'],
    descriptionMd: `Given an integer array \`nums\`, push every zero to the end of the array while keeping
the relative order of the non-zero elements unchanged. Return the resulting array.

The two-pointer trick: a write pointer that always points at the next slot for a non-zero
value, and a read pointer that scans every element. After the scan, fill the remaining slots
with zeros.

> Note: LeetCode asks you to mutate the list in place. To make our test runner happy, please
> also \`return\` the (now updated) list at the end.`,
    examples: [
      {
        input: 'nums = [4, 0, 1, 0, 7, 0, 3]',
        output: '[4, 1, 7, 3, 0, 0, 0]',
      },
      {
        input: 'nums = [0, 0, 5]',
        output: '[5, 0, 0]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^4`',
      '`-2^31 <= nums[i] <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def moveZeroes(self, nums: list[int]) -> list[int]:
        # Move all zeros to the end while preserving the order of non-zeros.
        pass
`,
    },
    methodName: 'moveZeroes',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Mixed',         inputJson: '{"nums":[4,0,1,0,7,0,3]}', expectedJson: '[4,1,7,3,0,0,0]' },
      { label: 'Leading zeros', inputJson: '{"nums":[0,0,5]}',         expectedJson: '[5,0,0]'         },
      { label: 'No zeros',      inputJson: '{"nums":[1,2,3]}',         expectedJson: '[1,2,3]'         },
    ],
    resultCompare: 'exact',
  },

  // ─── Squares of a Sorted Array (LC #977) ────────────────────────────────────
  {
    slug: 'squares-of-a-sorted-array',
    lcNumber: 977,
    title: 'Squares of a Sorted Array',
    difficulty: 'Easy',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers'],
    descriptionMd: `You are given an integer array \`nums\` that is sorted in **non-decreasing** order
(it may contain negatives). Return a new array containing the squares of each element, also
sorted in non-decreasing order.

The brute force is to square each element and sort the result in \`O(n log n)\`. The optimal
approach uses two pointers — one at each end — and fills the result from the back, since the
largest square always lives at one of the two ends.`,
    examples: [
      {
        input: 'nums = [-6, -3, 1, 2, 5]',
        output: '[1, 4, 9, 25, 36]',
      },
      {
        input: 'nums = [-1, 0, 4]',
        output: '[0, 1, 16]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^4`',
      '`-10^4 <= nums[i] <= 10^4`',
      '`nums` is sorted in non-decreasing order.',
    ],
    starterCode: {
      python: `class Solution:
    def sortedSquares(self, nums: list[int]) -> list[int]:
        # Return the squares of the elements, sorted in non-decreasing order.
        pass
`,
    },
    methodName: 'sortedSquares',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Mixed signs', inputJson: '{"nums":[-6,-3,1,2,5]}', expectedJson: '[1,4,9,25,36]' },
      { label: 'Has zero',    inputJson: '{"nums":[-1,0,4]}',      expectedJson: '[0,1,16]'      },
      { label: 'All positive',inputJson: '{"nums":[1,2,3]}',       expectedJson: '[1,4,9]'       },
    ],
    resultCompare: 'exact',
  },

  // ─── Two Sum II — Input Array Is Sorted (LC #167) ──────────────────────────
  {
    slug: 'two-sum-ii-input-array-is-sorted',
    lcNumber: 167,
    title: 'Two Sum II — Input Array Is Sorted',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers'],
    descriptionMd: `You are given a **1-indexed** integer array \`numbers\` that is sorted in
non-decreasing order, and a target integer \`target\`. Return the **two 1-indexed positions**
\`[i, j]\` (with \`i < j\`) such that \`numbers[i] + numbers[j] == target\`.

You may assume there is exactly one such pair. Because the array is sorted, the two-pointer
sweep from both ends takes \`O(n)\` time and \`O(1)\` extra memory.`,
    examples: [
      {
        input: 'numbers = [2, 4, 7, 11, 15], target = 18',
        output: '[3, 4]',
        explanation: 'numbers[3] + numbers[4] = 7 + 11 = 18 (1-indexed).',
      },
      {
        input: 'numbers = [1, 3], target = 4',
        output: '[1, 2]',
      },
    ],
    constraints: [
      '`2 <= len(numbers) <= 3 * 10^4`',
      '`numbers` is sorted in non-decreasing order.',
      'Exactly one valid pair exists, and you may not use the same element twice.',
    ],
    starterCode: {
      python: `class Solution:
    def twoSum(self, numbers: list[int], target: int) -> list[int]:
        # Return the 1-indexed positions of the two values that sum to target.
        pass
`,
    },
    methodName: 'twoSum',
    argKeys: ['numbers', 'target'],
    defaultTests: [
      { label: 'Example 1', inputJson: '{"numbers":[2,4,7,11,15],"target":18}', expectedJson: '[3,4]' },
      { label: 'Two values',inputJson: '{"numbers":[1,3],"target":4}',          expectedJson: '[1,2]' },
      { label: 'Negatives', inputJson: '{"numbers":[-3,-1,2,5],"target":1}',    expectedJson: '[2,3]' },
    ],
    resultCompare: 'exact',
  },

  // ─── Container With Most Water (LC #11) ────────────────────────────────────
  {
    slug: 'container-with-most-water',
    lcNumber: 11,
    title: 'Container With Most Water',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers', 'greedy'],
    descriptionMd: `You are given an array \`height\` where \`height[i]\` is the height of a vertical line
drawn at position \`i\` on a flat surface. Pick **two of these lines** that, together with the
x-axis, form a container holding the maximum possible amount of water.

Return the area of that container. The area between two lines at positions \`i\` and \`j\` is
\`(j - i) * min(height[i], height[j])\`.

The two-pointer approach starts at both ends and always moves the **shorter** side inward,
because moving the taller side inward can only shrink the area.`,
    examples: [
      {
        input: 'height = [4, 1, 2, 8, 3, 5, 6]',
        output: '24',
        explanation: 'Pick the lines at positions 0 and 6: width 6, min height 4, area 24.',
      },
      {
        input: 'height = [1, 1]',
        output: '1',
      },
    ],
    constraints: [
      '`2 <= len(height) <= 10^5`',
      '`0 <= height[i] <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        # Return the largest area of water a pair of lines can hold.
        pass
`,
    },
    methodName: 'maxArea',
    argKeys: ['height'],
    defaultTests: [
      { label: 'Mixed heights', inputJson: '{"height":[4,1,2,8,3,5,6]}', expectedJson: '24' },
      { label: 'Two lines',     inputJson: '{"height":[1,1]}',           expectedJson: '1'  },
      { label: 'Tall edges',    inputJson: '{"height":[5,1,1,1,5]}',     expectedJson: '20' },
    ],
    resultCompare: 'exact',
  },

  // ─── Remove Duplicates from Sorted Array (LC #26) ──────────────────────────
  {
    slug: 'remove-duplicates-from-sorted-array',
    lcNumber: 26,
    title: 'Remove Duplicates from Sorted Array',
    difficulty: 'Easy',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers'],
    descriptionMd: `You are given a sorted integer array \`nums\`. Remove the duplicates in place so that
each distinct value appears only once, then return the **list of unique values** in sorted
order.

On LeetCode this problem asks you to return the new length \`k\` and mutate the input so that
the first \`k\` entries hold the distinct values. Our grader instead checks the list you return,
so please return the deduplicated list directly.

The two-pointer technique walks a read pointer through every element and a write pointer that
only advances when the read pointer finds a value different from the previous unique value.`,
    examples: [
      {
        input: 'nums = [2, 4, 4, 6, 6, 6, 9]',
        output: '[2, 4, 6, 9]',
      },
      {
        input: 'nums = [7, 7, 7]',
        output: '[7]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 3 * 10^4`',
      '`-100 <= nums[i] <= 100`',
      '`nums` is sorted in non-decreasing order.',
    ],
    starterCode: {
      python: `class Solution:
    def removeDuplicates(self, nums: list[int]) -> list[int]:
        # Return the list of distinct values from the sorted array nums.
        pass
`,
    },
    methodName: 'removeDuplicates',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Mixed runs',  inputJson: '{"nums":[2,4,4,6,6,6,9]}', expectedJson: '[2,4,6,9]' },
      { label: 'All same',    inputJson: '{"nums":[7,7,7]}',         expectedJson: '[7]'       },
      { label: 'Already unique', inputJson: '{"nums":[1,2,3]}',      expectedJson: '[1,2,3]'   },
    ],
    resultCompare: 'exact',
  },

  // ─── 3Sum (LC #15) ─────────────────────────────────────────────────────────
  {
    slug: '3sum',
    lcNumber: 15,
    title: '3Sum',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers', 'sorting'],
    descriptionMd: `Given an integer array \`nums\`, return every **unique triplet** \`[a, b, c]\` of
values (not indices) drawn from \`nums\` such that \`a + b + c == 0\`.

To make grading deterministic, please:

1. Sort each inner triplet in non-decreasing order.
2. Sort the outer list of triplets lexicographically.

The standard approach sorts the array, then for each index \`i\` runs a two-pointer sweep on
the suffix looking for pairs summing to \`-nums[i]\`, skipping duplicates at every level.`,
    examples: [
      {
        input: 'nums = [-4, -1, -1, 0, 1, 2]',
        output: '[[-1, -1, 2], [-1, 0, 1]]',
      },
      {
        input: 'nums = [1, 2, 3]',
        output: '[]',
      },
    ],
    constraints: [
      '`3 <= len(nums) <= 3000`',
      '`-10^5 <= nums[i] <= 10^5`',
    ],
    starterCode: {
      python: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        # Return every unique triplet of values summing to zero.
        # Inner triplets must be sorted ascending; outer list must be sorted too.
        pass
`,
    },
    methodName: 'threeSum',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Two triplets', inputJson: '{"nums":[-4,-1,-1,0,1,2]}', expectedJson: '[[-1,-1,2],[-1,0,1]]' },
      { label: 'No triplet',   inputJson: '{"nums":[1,2,3]}',           expectedJson: '[]'                    },
      { label: 'All zeros',    inputJson: '{"nums":[0,0,0,0]}',         expectedJson: '[[0,0,0]]'             },
    ],
    resultCompare: 'exact',
  },

  // ─── 4Sum (LC #18) ─────────────────────────────────────────────────────────
  {
    slug: '4sum',
    lcNumber: 18,
    title: '4Sum',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers', 'sorting'],
    descriptionMd: `Given an integer array \`nums\` and an integer \`target\`, return every **unique
quadruplet** \`[a, b, c, d]\` of values drawn from \`nums\` whose sum equals \`target\`.

To make grading deterministic, please:

1. Sort each inner quadruplet in non-decreasing order.
2. Sort the outer list lexicographically.

The usual approach generalises 3Sum: sort the array, then loop over the first two indices and
run a two-pointer sweep on the remaining suffix, skipping duplicates at every level.`,
    examples: [
      {
        input: 'nums = [1, 2, 3, 4, 5], target = 10',
        output: '[[1, 2, 3, 4]]',
      },
      {
        input: 'nums = [0, 0, 0, 0, 0], target = 0',
        output: '[[0, 0, 0, 0]]',
      },
    ],
    constraints: [
      '`4 <= len(nums) <= 200`',
      '`-10^9 <= nums[i] <= 10^9`',
      '`-10^9 <= target <= 10^9`',
    ],
    starterCode: {
      python: `class Solution:
    def fourSum(self, nums: list[int], target: int) -> list[list[int]]:
        # Return every unique quadruplet summing to target.
        # Inner quadruplets sorted ascending; outer list sorted lexicographically.
        pass
`,
    },
    methodName: 'fourSum',
    argKeys: ['nums', 'target'],
    defaultTests: [
      { label: 'Single hit',    inputJson: '{"nums":[1,2,3,4,5],"target":10}', expectedJson: '[[1,2,3,4]]' },
      { label: 'All zero',      inputJson: '{"nums":[0,0,0,0,0],"target":0}',  expectedJson: '[[0,0,0,0]]' },
      { label: 'No hit',        inputJson: '{"nums":[1,2,3,4],"target":100}',  expectedJson: '[]'          },
    ],
    resultCompare: 'exact',
  },

  // ─── Sort Colors (LC #75) ──────────────────────────────────────────────────
  {
    slug: 'sort-colors',
    lcNumber: 75,
    title: 'Sort Colors',
    difficulty: 'Medium',
    pattern: 'Dutch Flag',
    tags: ['array', 'two-pointers', 'dutch-flag'],
    descriptionMd: `You are given an integer array \`nums\` containing only the values \`0\`, \`1\`, and
\`2\`. Sort the array so that all \`0\`s come first, then all \`1\`s, then all \`2\`s, and
return the sorted list.

The classic one-pass solution is the Dutch National Flag algorithm: three pointers (\`lo\`,
\`mid\`, \`hi\`) that partition the array into "zeros / ones / unknown / twos" regions. You
should aim for **O(1)** extra memory beyond the input.

> Note: LeetCode asks you to mutate the list in place. To make our test runner happy, please
> also \`return\` the (now sorted) list at the end.`,
    examples: [
      {
        input: 'nums = [1, 2, 0, 2, 1, 0, 0]',
        output: '[0, 0, 0, 1, 1, 2, 2]',
      },
      {
        input: 'nums = [2, 0, 1]',
        output: '[0, 1, 2]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 300`',
      '`nums[i]` is `0`, `1`, or `2`.',
    ],
    starterCode: {
      python: `class Solution:
    def sortColors(self, nums: list[int]) -> list[int]:
        # Sort nums so 0s come before 1s before 2s, then return it.
        pass
`,
    },
    methodName: 'sortColors',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Mixed',     inputJson: '{"nums":[1,2,0,2,1,0,0]}', expectedJson: '[0,0,0,1,1,2,2]' },
      { label: 'Three',     inputJson: '{"nums":[2,0,1]}',         expectedJson: '[0,1,2]'         },
      { label: 'All same',  inputJson: '{"nums":[1,1,1]}',         expectedJson: '[1,1,1]'         },
    ],
    resultCompare: 'exact',
  },

  // ─── Trapping Rain Water (LC #42) ──────────────────────────────────────────
  {
    slug: 'trapping-rain-water',
    lcNumber: 42,
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers', 'dp'],
    descriptionMd: `You are given an array \`height\` of non-negative integers where \`height[i]\` is the
height of a bar one unit wide at position \`i\`. After it rains, water pools between the bars.
Return the **total units of water** that would be trapped.

The water above each position is bounded by the taller of the highest bar to its left and the
highest bar to its right. The two-pointer solution walks from both ends, always advancing the
shorter side and accumulating water based on the running maximum on that side.`,
    examples: [
      {
        input: 'height = [3, 0, 1, 0, 2]',
        output: '5',
        explanation: 'Water above the interior positions: 2 + 1 + 2 = 5.',
      },
      {
        input: 'height = [4, 1, 3, 2, 5]',
        output: '6',
      },
    ],
    constraints: [
      '`1 <= len(height) <= 2 * 10^4`',
      '`0 <= height[i] <= 10^5`',
    ],
    starterCode: {
      python: `class Solution:
    def trap(self, height: list[int]) -> int:
        # Return the total units of water trapped between the bars.
        pass
`,
    },
    methodName: 'trap',
    argKeys: ['height'],
    defaultTests: [
      { label: 'Pool between',  inputJson: '{"height":[3,0,1,0,2]}', expectedJson: '5' },
      { label: 'Two pools',     inputJson: '{"height":[4,1,3,2,5]}', expectedJson: '6' },
      { label: 'Flat',          inputJson: '{"height":[2,2,2]}',     expectedJson: '0' },
      { label: 'Single bar',    inputJson: '{"height":[4]}',         expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Boats to Save People (LC #881) ────────────────────────────────────────
  {
    slug: 'boats-to-save-people',
    lcNumber: 881,
    title: 'Boats to Save People',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers', 'greedy'],
    descriptionMd: `You are given an integer array \`people\` where \`people[i]\` is the weight of the
\`i\`-th person, and a single integer \`limit\` which is the maximum weight a rescue boat can
carry. **Every boat can carry at most two people** at a time, and their combined weight must
not exceed \`limit\`.

Return the **minimum number of boats** needed to rescue everyone. You may assume each person's
weight is at most \`limit\`.

The greedy two-pointer approach: sort the array and use pointers \`i\` (lightest remaining)
and \`j\` (heaviest remaining). If \`people[i] + people[j] <= limit\` the two share a boat;
otherwise the heavy person goes alone. Advance pointers and repeat.`,
    examples: [
      {
        input: 'people = [4, 2, 1], limit = 4',
        output: '2',
        explanation: 'Boat 1 carries the 1 and the 2; boat 2 carries the 4.',
      },
      {
        input: 'people = [5, 5, 5, 5], limit = 5',
        output: '4',
        explanation: 'Nobody can share a boat, so each person needs their own.',
      },
    ],
    constraints: [
      '`1 <= len(people) <= 5 * 10^4`',
      '`1 <= people[i] <= limit <= 3 * 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def numRescueBoats(self, people: list[int], limit: int) -> int:
        # Return the minimum number of boats needed, each carrying at most two people.
        pass
`,
    },
    methodName: 'numRescueBoats',
    argKeys: ['people', 'limit'],
    defaultTests: [
      { label: 'Pair possible', inputJson: '{"people":[4,2,1],"limit":4}',    expectedJson: '2' },
      { label: 'All alone',     inputJson: '{"people":[5,5,5,5],"limit":5}',  expectedJson: '4' },
      { label: 'Tight fit',     inputJson: '{"people":[1,2],"limit":3}',      expectedJson: '1' },
    ],
    resultCompare: 'exact',
  },
];
