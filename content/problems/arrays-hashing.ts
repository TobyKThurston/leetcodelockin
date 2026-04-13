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
    solutions: [
      {
        approach: 'Brute Force (Sorting)',
        intuition: 'Sort the array — if there are duplicates, they will be adjacent. Compare each element with its neighbor.',
        code: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        nums.sort()
        for i in range(1, len(nums)):
            if nums[i] == nums[i - 1]:
                return True
        return False`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Hash Set',
        intuition: 'Insert each element into a set. If we ever try to insert an element that is already there, we found a duplicate. Alternatively, just compare the set size to the array length.',
        code: `class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        return len(set(nums)) != len(nums)`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
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
    solutions: [
      {
        approach: 'Brute Force (Sorting)',
        intuition: 'Sort both strings and compare. Anagrams will produce the same sorted string.',
        code: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return sorted(s) == sorted(t)`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Hash Map (Frequency Count)',
        intuition: 'Count character frequencies for the first string, then decrement for the second. If all counts return to zero, the strings are anagrams.',
        code: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        counts = {}
        for ch in s:
            counts[ch] = counts.get(ch, 0) + 1
        for ch in t:
            if counts.get(ch, 0) == 0:
                return False
            counts[ch] -= 1
        return True`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'For each element, scan every other element to see if any pair sums to target. Simple but slow.',
        code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`,
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Hash Map (One Pass)',
        intuition: 'As we iterate, store each value and its index in a hash map. For each new value, check if its complement (target - value) was already seen.',
        code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, v in enumerate(nums):
            j = seen.get(target - v)
            if j is not None:
                return [j, i]
            seen[v] = i
        return []`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
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
    solutions: [
      {
        approach: 'Sorting',
        intuition: 'Sort each string to get a canonical key. Group strings that share the same sorted key using a hash map.',
        code: `class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        buckets = {}
        for s in strs:
            key = ''.join(sorted(s))
            buckets.setdefault(key, []).append(s)
        out = []
        for group in buckets.values():
            group.sort()
            out.append(group)
        out.sort()
        return out`,
        timeComplexity: 'O(n · k log k)',
        spaceComplexity: 'O(n · k)',
      },
      {
        approach: 'Character Count Key',
        intuition: 'Instead of sorting each string, count the frequency of each letter and use that count tuple as the hash key. This avoids the k log k sorting cost per string.',
        code: `class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        buckets = {}
        for s in strs:
            counts = [0] * 26
            for ch in s:
                counts[ord(ch) - ord('a')] += 1
            key = tuple(counts)
            buckets.setdefault(key, []).append(s)
        out = []
        for group in buckets.values():
            group.sort()
            out.append(group)
        out.sort()
        return out`,
        timeComplexity: 'O(n · k)',
        spaceComplexity: 'O(n · k)',
      },
    ],
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
    solutions: [
      {
        approach: 'Heap',
        intuition: 'Count frequencies with a hash map, then use a max-heap (or min-heap of size k) to extract the k most frequent elements.',
        code: `class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        import heapq
        counts = {}
        for v in nums:
            counts[v] = counts.get(v, 0) + 1
        return heapq.nlargest(k, counts.keys(), key=counts.get)`,
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Bucket Sort',
        intuition: 'Create an array of buckets where index i holds elements that appear i times. The max frequency is n, so we walk the buckets from high to low collecting k elements in linear time.',
        code: `class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        counts = {}
        for v in nums:
            counts[v] = counts.get(v, 0) + 1
        buckets = [[] for _ in range(len(nums) + 1)]
        for v, c in counts.items():
            buckets[c].append(v)
        out = []
        for c in range(len(buckets) - 1, 0, -1):
            for v in buckets[c]:
                out.append(v)
                if len(out) == k:
                    return out
        return out`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
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
    solutions: [
      {
        approach: 'Brute Force (Extra Arrays)',
        intuition: 'Build a prefix product array and a suffix product array. The answer at index i is prefix[i] * suffix[i].',
        code: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        prefix = [1] * n
        suffix = [1] * n
        for i in range(1, n):
            prefix[i] = prefix[i - 1] * nums[i - 1]
        for i in range(n - 2, -1, -1):
            suffix[i] = suffix[i + 1] * nums[i + 1]
        return [prefix[i] * suffix[i] for i in range(n)]`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Optimal (Constant Extra Space)',
        intuition: 'Use the output array to store prefix products in the first pass, then multiply by suffix products in a second pass using a single running variable.',
        code: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        out = [1] * n
        left = 1
        for i in range(n):
            out[i] = left
            left *= nums[i]
        right = 1
        for i in range(n - 1, -1, -1):
            out[i] *= right
            right *= nums[i]
        return out`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
    solutions: [
      {
        approach: 'Hash Set',
        intuition: 'Convert both arrays to sets and return their intersection. Python makes this a one-liner with the & operator.',
        code: `class Solution:
    def intersection(self, nums1: list[int], nums2: list[int]) -> list[int]:
        return list(set(nums1) & set(nums2))`,
        timeComplexity: 'O(n + m)',
        spaceComplexity: 'O(n + m)',
      },
    ],
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
    solutions: [
      {
        approach: 'Hash Set',
        intuition: 'Put all values into a set, then check which numbers from 1 to n are missing from the set.',
        code: `class Solution:
    def findDisappearedNumbers(self, nums: list[int]) -> list[int]:
        present = set(nums)
        return [v for v in range(1, len(nums) + 1) if v not in present]`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Index Marking (O(1) Space)',
        intuition: 'Use the array itself as a hash map. For each value v, negate nums[v-1] to mark that v exists. After one pass, positive values at index i mean i+1 was never seen.',
        code: `class Solution:
    def findDisappearedNumbers(self, nums: list[int]) -> list[int]:
        for v in nums:
            idx = abs(v) - 1
            if nums[idx] > 0:
                nums[idx] = -nums[idx]
        return [i + 1 for i in range(len(nums)) if nums[i] > 0]`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
    solutions: [
      {
        approach: 'Hash Map + Set',
        intuition: 'Count the frequency of each value using a hash map, then check if all frequency counts are unique by comparing the length of the counts list to a set of counts.',
        code: `class Solution:
    def uniqueOccurrences(self, arr: list[int]) -> bool:
        counts = {}
        for v in arr:
            counts[v] = counts.get(v, 0) + 1
        vals = list(counts.values())
        return len(set(vals)) == len(vals)`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
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
    solutions: [
      {
        approach: 'Hash Sets (Rows, Cols, Boxes)',
        intuition: 'Walk every cell once. Maintain a set per row, a set per column, and a set per 3x3 box. If any digit is already in a set when we try to add it, the board is invalid.',
        code: `class Solution:
    def isValidSudoku(self, board: list[list[str]]) -> bool:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        for r in range(9):
            for c in range(9):
                ch = board[r][c]
                if ch == '.':
                    continue
                b = (r // 3) * 3 + (c // 3)
                if ch in rows[r] or ch in cols[c] or ch in boxes[b]:
                    return False
                rows[r].add(ch)
                cols[c].add(ch)
                boxes[b].add(ch)
        return True`,
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
      },
    ],
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'For every pair (i, j), compute the sum of the subarray from i to j. Count how many equal k.',
        code: `class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        count = 0
        for i in range(len(nums)):
            total = 0
            for j in range(i, len(nums)):
                total += nums[j]
                if total == k:
                    count += 1
        return count`,
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Prefix Sum + Hash Map',
        intuition: 'Maintain a running prefix sum and a hash map counting how many times each prefix sum has occurred. For each new prefix sum cur, the number of subarrays ending here with sum k is the count of prefix sums equal to cur - k.',
        code: `class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        seen = {0: 1}
        cur = 0
        count = 0
        for v in nums:
            cur += v
            count += seen.get(cur - k, 0)
            seen[cur] = seen.get(cur, 0) + 1
        return count`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
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
    solutions: [
      {
        approach: 'Brute Force (Sorting)',
        intuition: 'Sort the array. Then consecutive sequences become adjacent runs. Walk through and track the longest run.',
        code: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        if not nums:
            return 0
        nums.sort()
        best = 1
        cur = 1
        for i in range(1, len(nums)):
            if nums[i] == nums[i - 1]:
                continue
            if nums[i] == nums[i - 1] + 1:
                cur += 1
                best = max(best, cur)
            else:
                cur = 1
        return best`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Hash Set',
        intuition: 'Put all values in a set. For each value v, only start counting if v-1 is NOT in the set (so v is the start of a sequence). Then count forward v+1, v+2, ... while they exist. Each element is visited at most twice.',
        code: `class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        s = set(nums)
        best = 0
        for v in s:
            if v - 1 in s:
                continue
            length = 1
            cur = v + 1
            while cur in s:
                length += 1
                cur += 1
            best = max(best, length)
        return best`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Majority Element (LC #169) ─────────────────────────────────────────────
  {
    slug: 'majority-element',
    lcNumber: 169,
    title: 'Majority Element',
    difficulty: 'Easy',
    pattern: 'Boyer–Moore Voting',
    tags: ['array', 'hash-map'],
    descriptionMd: `Given an integer array \`nums\`, return the **majority element** — the value
that appears **strictly more than \`len(nums) // 2\`** times. You may assume the majority
element always exists in the array.

The textbook approach is a frequency hash map, but there is also a famously elegant
single-pass, constant-space trick — the Boyer–Moore voting algorithm — that maintains a
candidate and a count, flipping the candidate whenever the count drops to zero.`,
    examples: [
      {
        input: 'nums = [3, 2, 3]',
        output: '3',
      },
      {
        input: 'nums = [2, 2, 1, 1, 1, 2, 2]',
        output: '2',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 5 * 10^4`',
      '`-10^9 <= nums[i] <= 10^9`',
      'The majority element always exists.',
    ],
    starterCode: {
      python: `class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        # Return the value appearing more than len(nums) // 2 times.
        pass
`,
    },
    methodName: 'majorityElement',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Simple',       inputJson: '{"nums":[3,2,3]}',           expectedJson: '3' },
      { label: 'Alternating',  inputJson: '{"nums":[2,2,1,1,1,2,2]}',   expectedJson: '2' },
      { label: 'Single',       inputJson: '{"nums":[7]}',               expectedJson: '7' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Hash Map',
        intuition: 'Count the occurrences of each value in a hash map. Any value whose count exceeds n // 2 is the majority element.',
        code: `class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        counts = {}
        half = len(nums) // 2
        for v in nums:
            counts[v] = counts.get(v, 0) + 1
            if counts[v] > half:
                return v
        return -1`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Boyer–Moore Voting',
        intuition: 'Keep a candidate and a running count. When the count is zero, adopt the current element. Increment the count if it matches the candidate; otherwise decrement. A majority element always survives.',
        code: `class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        candidate = None
        count = 0
        for v in nums:
            if count == 0:
                candidate = v
            count += 1 if v == candidate else -1
        return candidate`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Concatenation of Array (LC #1929) ──────────────────────────────────────
  {
    slug: 'concatenation-of-array',
    lcNumber: 1929,
    title: 'Concatenation of Array',
    difficulty: 'Easy',
    pattern: 'Array',
    tags: ['array'],
    descriptionMd: `Given an integer array \`nums\` of length \`n\`, build and return an array
\`ans\` of length \`2 * n\` such that \`ans[i] == nums[i]\` and \`ans[i + n] == nums[i]\`
for every \`0 <= i < n\`.

In other words: return \`nums\` concatenated with itself. The one-liner in Python is
\`nums + nums\`, but it is worth practising the explicit index-based build too.`,
    examples: [
      {
        input: 'nums = [1, 2, 1]',
        output: '[1, 2, 1, 1, 2, 1]',
      },
      {
        input: 'nums = [1, 3, 2, 1]',
        output: '[1, 3, 2, 1, 1, 3, 2, 1]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 1000`',
      '`1 <= nums[i] <= 1000`',
    ],
    starterCode: {
      python: `class Solution:
    def getConcatenation(self, nums: list[int]) -> list[int]:
        # Return nums concatenated with itself (length 2n).
        pass
`,
    },
    methodName: 'getConcatenation',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Three',  inputJson: '{"nums":[1,2,1]}',     expectedJson: '[1,2,1,1,2,1]'     },
      { label: 'Four',   inputJson: '{"nums":[1,3,2,1]}',   expectedJson: '[1,3,2,1,1,3,2,1]' },
      { label: 'Single', inputJson: '{"nums":[5]}',         expectedJson: '[5,5]'             },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'List Concatenation',
        intuition: 'Python lists support the + operator which creates a new list containing both halves. This is the simplest one-liner.',
        code: `class Solution:
    def getConcatenation(self, nums: list[int]) -> list[int]:
        return nums + nums`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Index Build',
        intuition: 'Preallocate a list of length 2n and fill it with two index passes. This avoids relying on list concatenation semantics.',
        code: `class Solution:
    def getConcatenation(self, nums: list[int]) -> list[int]:
        n = len(nums)
        ans = [0] * (2 * n)
        for i in range(n):
            ans[i] = nums[i]
            ans[i + n] = nums[i]
        return ans`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },
];
