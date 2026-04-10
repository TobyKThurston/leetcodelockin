// ─── Arrays & Hashing problems ───────────────────────────────────────────────
//
// NeetCode-150 style "Arrays & Hashing" category. Hand-authored ProblemContent
// entries — every description, example, and defaultTest input is original. LC
// numbers and canonical method names are kept so learners who have seen the
// problem elsewhere still recognise the shape.

import type { ProblemContent } from '../../lib/problem-types';

export const ARRAYS_HASHING_PROBLEMS: ProblemContent[] = [
  // ─── Contains Duplicate (LC #217) ───────────────────────────────────────────
  {
    slug: 'contains-duplicate',
    lcNumber: 217,
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    pattern: 'Hash Set',
    tags: ['array', 'hash-set'],
    descriptionMd: `Given an integer array \`nums\`, return \`True\` if **any value appears more than once**
in the array, and \`False\` if every value is unique.

This is the canonical first hash-set problem: scan the array once, and for each value either
record it as seen or report a collision.`,
    examples: [
      {
        input: 'nums = [3, 8, 2, 5, 8]',
        output: 'True',
        explanation: 'The value 8 shows up twice.',
      },
      {
        input: 'nums = [9, 1, 4, 7, 0]',
        output: 'False',
        explanation: 'Every value appears at most once.',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^5`',
      '`-10^9 <= nums[i] <= 10^9`',
    ],
    starterCode: {
      python: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        # Return True if any value appears at least twice in nums.
        pass
`,
    },
    methodName: 'containsDuplicate',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Has duplicate',   inputJson: '{"nums":[3,8,2,5,8]}',  expectedJson: 'true'  },
      { label: 'All unique',      inputJson: '{"nums":[9,1,4,7,0]}',  expectedJson: 'false' },
      { label: 'Single element',  inputJson: '{"nums":[42]}',         expectedJson: 'false' },
    ],
    resultCompare: 'exact',
  },

  // ─── Valid Anagram (LC #242) ────────────────────────────────────────────────
  {
    slug: 'valid-anagram',
    lcNumber: 242,
    title: 'Valid Anagram',
    difficulty: 'Easy',
    pattern: 'Hash Map',
    tags: ['string', 'hash-map'],
    descriptionMd: `Given two strings \`s\` and \`t\`, return \`True\` if \`t\` is an **anagram** of \`s\` —
that is, if \`t\` can be formed by rearranging exactly the characters of \`s\` (using each
character the same number of times). Otherwise return \`False\`.

You may assume both strings consist of lowercase ASCII letters. The classic approach builds a
character-frequency map for one string and decrements while scanning the other.`,
    examples: [
      {
        input: 's = "elbow", t = "below"',
        output: 'True',
        explanation: 'Both strings use the same letters with the same counts.',
      },
      {
        input: 's = "rail", t = "rain"',
        output: 'False',
        explanation: 'rail has an l where rain has an n.',
      },
    ],
    constraints: [
      '`1 <= len(s), len(t) <= 5 * 10^4`',
      '`s` and `t` consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        # Return True if t is a rearrangement of s.
        pass
`,
    },
    methodName: 'isAnagram',
    argKeys: ['s', 't'],
    defaultTests: [
      { label: 'Anagram',          inputJson: '{"s":"elbow","t":"below"}', expectedJson: 'true'  },
      { label: 'Different counts', inputJson: '{"s":"rail","t":"rain"}',   expectedJson: 'false' },
      { label: 'Different length', inputJson: '{"s":"abc","t":"abcd"}',    expectedJson: 'false' },
    ],
    resultCompare: 'exact',
  },

  // ─── Two Sum (LC #1) ────────────────────────────────────────────────────────
  {
    slug: 'two-sum',
    lcNumber: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    pattern: 'Hash Map',
    tags: ['array', 'hash-map'],
    descriptionMd: `You are given an array of integers \`nums\` and a target integer \`target\`.
Your job is to find the **two distinct positions** in the array whose values add up to \`target\`,
and return their indices as a length-2 list.

You may assume that there is **exactly one** valid pair, and you may not use the same element
twice. Indices may be returned in either order.

The most straightforward solution scans every pair, but you can do this in a single pass by
remembering each value you have seen so far in a hash map keyed by value.`,
    examples: [
      {
        input: 'nums = [4, 1, 9, 6], target = 10',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] = 1 + 9 = 10, so return the positions 1 and 2.',
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
        explanation: 'The two threes are at positions 0 and 1.',
      },
    ],
    constraints: [
      '`2 <= len(nums) <= 10^4`',
      '`-10^9 <= nums[i] <= 10^9`',
      '`-10^9 <= target <= 10^9`',
      'Exactly one valid pair is guaranteed to exist.',
    ],
    starterCode: {
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Return the two indices whose values sum to target.
        pass
`,
    },
    methodName: 'twoSum',
    argKeys: ['nums', 'target'],
    defaultTests: [
      { label: 'Example 1', inputJson: '{"nums":[4,1,9,6],"target":10}', expectedJson: '[1,2]' },
      { label: 'Example 2', inputJson: '{"nums":[3,3],"target":6}',       expectedJson: '[0,1]' },
      { label: 'Negatives', inputJson: '{"nums":[-2,7,11,-4],"target":3}', expectedJson: '[1,3]' },
    ],
    // sorted_array: the pair may come back in either index order.
    resultCompare: 'sorted_array',
  },

  // ─── Group Anagrams (LC #49) ────────────────────────────────────────────────
  {
    slug: 'group-anagrams',
    lcNumber: 49,
    title: 'Group Anagrams',
    difficulty: 'Medium',
    pattern: 'Hash Map',
    tags: ['string', 'hash-map', 'sorting'],
    descriptionMd: `Given a list of strings \`strs\`, group together every set of strings that are anagrams
of each other (i.e. share the exact same letter counts) and return the groups as a list of
lists.

To make grading deterministic, please:

1. **Sort the characters inside each individual group**, so that within a group the strings
   appear in lexicographic order.
2. **Sort the outer list** so groups appear in a stable order.

A typical implementation builds a hash map keyed by the sorted-string canonical form of each
input.`,
    examples: [
      {
        input: 'strs = ["bat","tab","cat","act","dog","god"]',
        output: '[["act","cat"],["bat","tab"],["dog","god"]]',
      },
      {
        input: 'strs = ["x"]',
        output: '[["x"]]',
      },
    ],
    constraints: [
      '`1 <= len(strs) <= 10^4`',
      '`0 <= len(strs[i]) <= 100`',
      '`strs[i]` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        # Group strs into anagram groups.
        # Sort the strings inside each group, and sort the outer list of groups.
        pass
`,
    },
    methodName: 'groupAnagrams',
    argKeys: ['strs'],
    defaultTests: [
      {
        label: 'Three groups',
        inputJson: '{"strs":["bat","tab","cat","act","dog","god"]}',
        expectedJson: '[["act","cat"],["bat","tab"],["dog","god"]]',
      },
      {
        label: 'Singleton',
        inputJson: '{"strs":["x"]}',
        expectedJson: '[["x"]]',
      },
      {
        label: 'Empty string',
        inputJson: '{"strs":["",""]}',
        expectedJson: '[["",""]]',
      },
    ],
    // sorted_array: outer list order is normalised by the grader.
    resultCompare: 'sorted_array',
  },

  // ─── Top K Frequent Elements (LC #347) ──────────────────────────────────────
  {
    slug: 'top-k-frequent-elements',
    lcNumber: 347,
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    pattern: 'Bucket Sort',
    tags: ['array', 'hash-map', 'heap', 'bucket-sort'],
    descriptionMd: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` values that occur
most frequently in \`nums\`. The order of the returned values does not matter.

You may assume the answer is always uniquely determined. The bucket-sort solution counts each
value's frequency, then drops it into a bucket indexed by frequency. Walking the buckets from
highest to lowest gives the top \`k\` in linear time.`,
    examples: [
      {
        input: 'nums = [1,1,1,2,2,3], k = 2',
        output: '[1, 2]',
      },
      {
        input: 'nums = [4], k = 1',
        output: '[4]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^5`',
      '`-10^4 <= nums[i] <= 10^4`',
      '`1 <= k <= number of distinct values in nums`',
      'It is guaranteed the answer is unique.',
    ],
    starterCode: {
      python: `class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        # Return the k values that appear most often in nums.
        pass
`,
    },
    methodName: 'topKFrequent',
    argKeys: ['nums', 'k'],
    defaultTests: [
      { label: 'Top two',     inputJson: '{"nums":[1,1,1,2,2,3],"k":2}', expectedJson: '[1,2]' },
      { label: 'Single value',inputJson: '{"nums":[4],"k":1}',           expectedJson: '[4]'   },
      { label: 'Top three',   inputJson: '{"nums":[5,5,5,3,3,2,2,1],"k":3}', expectedJson: '[5,3,2]' },
    ],
    // set: problem says "order does not matter".
    resultCompare: 'set',
  },

  // ─── Product of Array Except Self (LC #238) ─────────────────────────────────
  {
    slug: 'product-of-array-except-self',
    lcNumber: 238,
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    pattern: 'Prefix Product',
    tags: ['array', 'prefix-product'],
    descriptionMd: `Given an integer array \`nums\`, return an array \`output\` such that \`output[i]\` is
equal to the product of every element of \`nums\` **except \`nums[i]\`**.

You must solve it **without using division**, and the algorithm should run in \`O(n)\` time.

The standard trick is two passes: first build a "product of everything to my left" array, then
multiply each entry by "product of everything to my right" computed on the way back.`,
    examples: [
      {
        input: 'nums = [2, 3, 4, 5]',
        output: '[60, 40, 30, 24]',
        explanation: '3*4*5=60, 2*4*5=40, 2*3*5=30, 2*3*4=24.',
      },
      {
        input: 'nums = [1, -2, 3]',
        output: '[-6, 3, -2]',
      },
    ],
    constraints: [
      '`2 <= len(nums) <= 10^5`',
      '`-30 <= nums[i] <= 30`',
      'The product of any prefix or suffix of `nums` fits in a 32-bit integer.',
    ],
    starterCode: {
      python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        # Return an array where output[i] is the product of nums except nums[i].
        # Solve without division.
        pass
`,
    },
    methodName: 'productExceptSelf',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'All positive', inputJson: '{"nums":[2,3,4,5]}', expectedJson: '[60,40,30,24]' },
      { label: 'With negative',inputJson: '{"nums":[1,-2,3]}',  expectedJson: '[-6,3,-2]'     },
      { label: 'Has zero',     inputJson: '{"nums":[2,0,3]}',   expectedJson: '[0,6,0]'       },
    ],
    resultCompare: 'exact',
  },

  // ─── Intersection of Two Arrays (LC #349) ───────────────────────────────────
  {
    slug: 'intersection-of-two-arrays',
    lcNumber: 349,
    title: 'Intersection of Two Arrays',
    difficulty: 'Easy',
    pattern: 'Hash Set',
    tags: ['array', 'hash-set'],
    descriptionMd: `Given two integer arrays \`nums1\` and \`nums2\`, return a list of the values that
appear in **both** arrays. Each value in the result must be **unique** (no duplicates), and
the order of the output does not matter.

The canonical approach turns one array into a set, then walks the other collecting values
that are present in the set.`,
    examples: [
      {
        input: 'nums1 = [3, 1, 4, 1, 5], nums2 = [9, 1, 5]',
        output: '[1, 5]',
      },
      {
        input: 'nums1 = [7, 8], nums2 = [9, 10]',
        output: '[]',
        explanation: 'No values are shared.',
      },
    ],
    constraints: [
      '`1 <= len(nums1), len(nums2) <= 1000`',
      '`0 <= nums1[i], nums2[i] <= 1000`',
    ],
    starterCode: {
      python: `class Solution:
    def intersection(self, nums1: list[int], nums2: list[int]) -> list[int]:
        # Return the distinct values that appear in both arrays.
        pass
`,
    },
    methodName: 'intersection',
    argKeys: ['nums1', 'nums2'],
    defaultTests: [
      { label: 'Some overlap', inputJson: '{"nums1":[3,1,4,1,5],"nums2":[9,1,5]}', expectedJson: '[1,5]' },
      { label: 'No overlap',   inputJson: '{"nums1":[7,8],"nums2":[9,10]}',         expectedJson: '[]'    },
      { label: 'Heavy dups',   inputJson: '{"nums1":[2,2,2],"nums2":[2]}',          expectedJson: '[2]'   },
    ],
    // set: result is distinct values, order irrelevant.
    resultCompare: 'set',
  },

  // ─── Find All Numbers Disappeared in an Array (LC #448) ─────────────────────
  {
    slug: 'find-all-numbers-disappeared-in-an-array',
    lcNumber: 448,
    title: 'Find All Numbers Disappeared in an Array',
    difficulty: 'Easy',
    pattern: 'Cyclic Sort',
    tags: ['array', 'hash-set', 'cyclic-sort'],
    descriptionMd: `You are given an integer array \`nums\` of length \`n\`, where every value lies in the
range \`[1, n]\` (duplicates are allowed). Return the list of values in that range that do
**not** appear in \`nums\`.

A simple hash-set solution is \`O(n)\` time and \`O(n)\` extra space. The classic follow-up
asks you to use only \`O(1)\` extra space by marking indices in place — hence the "cyclic
sort" pattern tag.`,
    examples: [
      {
        input: 'nums = [2, 3, 2, 1, 5]',
        output: '[4]',
        explanation: 'n = 5, and the only value in [1, 5] not present is 4.',
      },
      {
        input: 'nums = [1, 1, 1, 1, 1]',
        output: '[2, 3, 4, 5]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^5`',
      '`1 <= nums[i] <= len(nums)`',
    ],
    starterCode: {
      python: `class Solution:
    def findDisappearedNumbers(self, nums: list[int]) -> list[int]:
        # Return every value in [1, n] that does not appear in nums.
        pass
`,
    },
    methodName: 'findDisappearedNumbers',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'One missing',  inputJson: '{"nums":[2,3,2,1,5]}',       expectedJson: '[4]'         },
      { label: 'Most missing', inputJson: '{"nums":[1,1,1,1,1]}',       expectedJson: '[2,3,4,5]'   },
      { label: 'None missing', inputJson: '{"nums":[1,2,3]}',           expectedJson: '[]'          },
    ],
    // sorted_array: the problem says the answer is a list; order doesn't matter to graders.
    resultCompare: 'sorted_array',
  },

  // ─── Unique Number of Occurrences (LC #1207) ───────────────────────────────
  {
    slug: 'unique-number-of-occurrences',
    lcNumber: 1207,
    title: 'Unique Number of Occurrences',
    difficulty: 'Easy',
    pattern: 'Hash Map',
    tags: ['array', 'hash-map'],
    descriptionMd: `Given an integer array \`arr\`, return \`True\` if **every value's occurrence count is
distinct** — that is, no two values appear the same number of times. Otherwise return \`False\`.

The standard approach counts frequencies in a hash map, then checks that the set of counts
is the same size as the list of counts.`,
    examples: [
      {
        input: 'arr = [1, 2, 2, 1, 1, 3]',
        output: 'True',
        explanation: '1 appears 3 times, 2 appears 2 times, 3 appears 1 time — all distinct.',
      },
      {
        input: 'arr = [7, 7, 8, 8, 9]',
        output: 'False',
        explanation: '7 and 8 both appear twice, so two different values share a count.',
      },
    ],
    constraints: [
      '`1 <= len(arr) <= 1000`',
      '`-1000 <= arr[i] <= 1000`',
    ],
    starterCode: {
      python: `class Solution:
    def uniqueOccurrences(self, arr: list[int]) -> bool:
        # Return True if every value's count is distinct from every other value's count.
        pass
`,
    },
    methodName: 'uniqueOccurrences',
    argKeys: ['arr'],
    defaultTests: [
      { label: 'All distinct',  inputJson: '{"arr":[1,2,2,1,1,3]}', expectedJson: 'true'  },
      { label: 'Tied counts',   inputJson: '{"arr":[7,7,8,8,9]}',   expectedJson: 'false' },
      { label: 'Singleton',     inputJson: '{"arr":[5,5]}',         expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Valid Sudoku (LC #36) ─────────────────────────────────────────────────
  {
    slug: 'valid-sudoku',
    lcNumber: 36,
    title: 'Valid Sudoku',
    difficulty: 'Medium',
    pattern: 'Hash Set',
    tags: ['array', 'hash-set', 'matrix'],
    descriptionMd: `You are given a \`9 x 9\` sudoku \`board\` represented as a list of rows. Each cell
contains either a digit character \`'1'\`..\`'9'\` or the placeholder \`'.'\` for an empty cell.

Return \`True\` if the board is currently valid, meaning:

- Every row contains each of the digits \`1\`..\`9\` **at most once**.
- Every column contains each of the digits \`1\`..\`9\` **at most once**.
- Each of the nine \`3 x 3\` sub-boxes contains each of the digits \`1\`..\`9\` at most once.

You only have to check whether the currently-filled cells are consistent — you do **not** have
to check whether the board is solvable.

The classic implementation walks every cell once, maintaining a set per row, a set per column,
and a set per 3x3 box, and reports a collision as soon as any set would receive a duplicate.`,
    examples: [
      {
        input: 'board = 9x9 grid with a "1" on the main diagonal and dots everywhere else',
        output: 'True',
        explanation: 'Wait — diagonal 1..9 puts one distinct digit per row, column, and box.',
      },
      {
        input: 'board = two "1"s in the same column',
        output: 'False',
      },
    ],
    constraints: [
      '`board.length == 9`',
      '`board[i].length == 9`',
      '`board[i][j]` is a digit `"1"`..`"9"` or the character `"."`.',
    ],
    starterCode: {
      python: `class Solution:
    def isValidSudoku(self, board: list[list[str]]) -> bool:
        # Return True if no row, column, or 3x3 sub-box already contains a duplicate digit.
        pass
`,
    },
    methodName: 'isValidSudoku',
    argKeys: ['board'],
    defaultTests: [
      {
        label: 'Sparse diagonal (valid)',
        inputJson: '{"board":[["1",".",".",".",".",".",".",".","."],[".","2",".",".",".",".",".",".","."],[".",".","3",".",".",".",".",".","."],[".",".",".","4",".",".",".",".","."],[".",".",".",".","5",".",".",".","."],[".",".",".",".",".","6",".",".","."],[".",".",".",".",".",".","7",".","."],[".",".",".",".",".",".",".","8","."],[".",".",".",".",".",".",".",".","9"]]}',
        expectedJson: 'true',
      },
      {
        label: 'Duplicate column',
        inputJson: '{"board":[["1",".",".",".",".",".",".",".","."],["1",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."]]}',
        expectedJson: 'false',
      },
      {
        label: 'Duplicate 3x3 box',
        inputJson: '{"board":[["1",".",".",".",".",".",".",".","."],[".","1",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."],[".",".",".",".",".",".",".",".","."]]}',
        expectedJson: 'false',
      },
    ],
    resultCompare: 'exact',
  },

  // ─── Subarray Sum Equals K (LC #560) ───────────────────────────────────────
  {
    slug: 'subarray-sum-equals-k',
    lcNumber: 560,
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    pattern: 'Prefix Sum',
    tags: ['array', 'prefix-sum', 'hash-map'],
    descriptionMd: `Given an integer array \`nums\` and an integer \`k\`, return the number of **contiguous
non-empty subarrays** whose elements sum to exactly \`k\`.

The brute-force approach is quadratic: try every start/end pair. The optimal solution walks the
array once, maintaining a running prefix sum and a hash map from prefix-sum value to how many
times that value has been seen. For each new prefix sum \`cur\`, the number of subarrays ending
here with sum \`k\` is exactly the number of previously-seen prefix sums equal to \`cur - k\`.`,
    examples: [
      {
        input: 'nums = [3, 1, 2, 4, 2], k = 6',
        output: '3',
        explanation: 'The subarrays are [2,4], [4,2], and [3,1,2].',
      },
      {
        input: 'nums = [1, 1, 1], k = 2',
        output: '2',
        explanation: 'The two length-2 windows each sum to 2.',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 2 * 10^4`',
      '`-1000 <= nums[i] <= 1000`',
      '`-10^7 <= k <= 10^7`',
    ],
    starterCode: {
      python: `class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        # Return the number of contiguous non-empty subarrays of nums whose values sum to k.
        pass
`,
    },
    methodName: 'subarraySum',
    argKeys: ['nums', 'k'],
    defaultTests: [
      { label: 'Three hits',   inputJson: '{"nums":[3,1,2,4,2],"k":6}', expectedJson: '3' },
      { label: 'Two hits',     inputJson: '{"nums":[1,1,1],"k":2}',     expectedJson: '2' },
      { label: 'Negatives',    inputJson: '{"nums":[-1,-1,1],"k":0}',   expectedJson: '1' },
      { label: 'No hits',      inputJson: '{"nums":[5,5,5],"k":3}',     expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Longest Consecutive Sequence (LC #128) ────────────────────────────────
  {
    slug: 'longest-consecutive-sequence',
    lcNumber: 128,
    title: 'Longest Consecutive Sequence',
    difficulty: 'Medium',
    pattern: 'Hash Set',
    tags: ['array', 'hash-set', 'union-find'],
    descriptionMd: `Given an unsorted integer array \`nums\`, return the length of the longest run of
**consecutive integers** that appear in the array. The run does not need to appear in order
in \`nums\` — only its underlying values need to be consecutive.

Your solution should run in \`O(n)\` time. The trick: throw every value into a set, then for
each value \`v\`, skip it unless \`v - 1\` is **not** in the set (meaning \`v\` is the start
of a run). For every start, walk forward counting how long the run extends.`,
    examples: [
      {
        input: 'nums = [8, 2, 4, 3, 5, 9]',
        output: '4',
        explanation: 'The run [2, 3, 4, 5] has length 4; the run [8, 9] has length 2.',
      },
      {
        input: 'nums = []',
        output: '0',
      },
    ],
    constraints: [
      '`0 <= len(nums) <= 10^5`',
      '`-10^9 <= nums[i] <= 10^9`',
    ],
    starterCode: {
      python: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        # Return the length of the longest consecutive-integer run inside nums.
        pass
`,
    },
    methodName: 'longestConsecutive',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Mixed runs',   inputJson: '{"nums":[8,2,4,3,5,9]}',        expectedJson: '4' },
      { label: 'Empty',        inputJson: '{"nums":[]}',                    expectedJson: '0' },
      { label: 'Duplicates',   inputJson: '{"nums":[10,5,10,7,6,5,11]}',    expectedJson: '3' },
      { label: 'Single value', inputJson: '{"nums":[42]}',                  expectedJson: '1' },
    ],
    resultCompare: 'exact',
  },
];
