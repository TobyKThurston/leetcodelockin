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
Otherwise return \`False\`.`,
    examples: [
      {
        input: 's = "Step on no pets!"',
        output: 'True',
        explanation: 'After cleaning, the string is "steponnopets", which reads the same forwards and backwards.',
      },
      {
        input: 's = "robot"',
        output: 'False',
        explanation: '"robot" reversed is "tobor", which differs.',
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
    solutions: [
      {
        approach: 'Clean and Compare',
        intuition: 'Filter out non-alphanumeric characters, lowercase everything, then compare the cleaned string with its reverse.',
        code: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        cleaned = ''.join(ch.lower() for ch in s if ch.isalnum())
        return cleaned == cleaned[::-1]`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Two Pointers',
        intuition: 'Use two pointers from each end, skipping non-alphanumeric characters. Compare characters in place without creating a new string.',
        code: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        i, j = 0, len(s) - 1
        while i < j:
            while i < j and not s[i].isalnum():
                i += 1
            while i < j and not s[j].isalnum():
                j -= 1
            if s[i].lower() != s[j].lower():
                return False
            i += 1
            j -= 1
        return True`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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

You must do this by modifying the input array in place with **O(1)** extra memory.

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
    solutions: [
      {
        approach: 'Two Pointers (Swap)',
        intuition: 'Use two pointers that walk toward each other. At each step, swap the characters at the two pointers, then move both inward.',
        code: `class Solution:
    def reverseString(self, s: list[str]) -> list[str]:
        i, j = 0, len(s) - 1
        while i < j:
            s[i], s[j] = s[j], s[i]
            i += 1
            j -= 1
        return s`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
    solutions: [
      {
        approach: 'Two Pointers (Swap)',
        intuition: 'Use a write pointer w that tracks where the next non-zero should go. Scan with a read pointer r — whenever we find a non-zero, swap it to position w and advance w.',
        code: `class Solution:
    def moveZeroes(self, nums: list[int]) -> list[int]:
        w = 0
        for r in range(len(nums)):
            if nums[r] != 0:
                nums[w], nums[r] = nums[r], nums[w]
                w += 1
        return nums`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
sorted in non-decreasing order.`,
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
    solutions: [
      {
        approach: 'Brute Force (Sort After Squaring)',
        intuition: 'Square every element and then sort the resulting array.',
        code: `class Solution:
    def sortedSquares(self, nums: list[int]) -> list[int]:
        return sorted(x * x for x in nums)`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Two Pointers',
        intuition: 'The largest square is always at one of the two ends (most negative or most positive). Use two pointers from each end, placing the larger square at the back of the result array and working inward.',
        code: `class Solution:
    def sortedSquares(self, nums: list[int]) -> list[int]:
        n = len(nums)
        out = [0] * n
        i, j, k = 0, n - 1, n - 1
        while i <= j:
            a, b = nums[i] * nums[i], nums[j] * nums[j]
            if a > b:
                out[k] = a
                i += 1
            else:
                out[k] = b
                j -= 1
            k -= 1
        return out`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
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

You may assume there is exactly one such pair, and you may not use the same element twice.`,
    examples: [
      {
        input: 'numbers = [2, 4, 7, 11, 15], target = 18',
        output: '[3, 4]',
        explanation: 'numbers[3] + numbers[4] = 7 + 11 = 18 (using 1-indexed positions).',
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
    solutions: [
      {
        approach: 'Two Pointers',
        intuition: 'Since the array is sorted, use two pointers at each end. If the sum is too small, move the left pointer right to increase it. If too large, move the right pointer left. Stop when you find the target.',
        code: `class Solution:
    def twoSum(self, numbers: list[int], target: int) -> list[int]:
        i, j = 0, len(numbers) - 1
        while i < j:
            s = numbers[i] + numbers[j]
            if s == target:
                return [i + 1, j + 1]
            if s < target:
                i += 1
            else:
                j -= 1
        return []`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
\`(j - i) * min(height[i], height[j])\`.`,
    examples: [
      {
        input: 'height = [4, 1, 2, 8, 3, 5, 6]',
        output: '24',
        explanation: 'The lines at positions 0 and 6 give width 6 and min height 4, for area 24.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'Try every pair of lines and compute the area. Return the maximum.',
        code: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        best = 0
        for i in range(len(height)):
            for j in range(i + 1, len(height)):
                area = min(height[i], height[j]) * (j - i)
                best = max(best, area)
        return best`,
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Two Pointers',
        intuition: 'Start with pointers at both ends for maximum width. Always move the shorter side inward — moving the taller side can only shrink or maintain the area, never increase it.',
        code: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        i, j = 0, len(height) - 1
        best = 0
        while i < j:
            h = min(height[i], height[j])
            area = h * (j - i)
            best = max(best, area)
            if height[i] < height[j]:
                i += 1
            else:
                j -= 1
        return best`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
so please return the deduplicated list directly.`,
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
    solutions: [
      {
        approach: 'Two Pointers',
        intuition: 'Since the array is sorted, use a write pointer w. Walk a read pointer r through the array — whenever nums[r] differs from nums[r-1], copy it to position w and advance w. Return the first w elements.',
        code: `class Solution:
    def removeDuplicates(self, nums: list[int]) -> list[int]:
        if not nums:
            return []
        w = 1
        for r in range(1, len(nums)):
            if nums[r] != nums[r - 1]:
                nums[w] = nums[r]
                w += 1
        return nums[:w]`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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

The same triplet of values must not appear twice in the result.

To make grading deterministic, please:

1. Sort each inner triplet in non-decreasing order.
2. Sort the outer list of triplets lexicographically.`,
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
    solutions: [
      {
        approach: 'Sort + Two Pointers',
        intuition: 'Sort the array. Fix one element at index i, then use two pointers (lo, hi) on the remaining suffix to find pairs that sum to -nums[i]. Skip duplicates at every level to avoid repeated triplets.',
        code: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums = sorted(nums)
        out = []
        n = len(nums)
        for i in range(n - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            lo, hi = i + 1, n - 1
            while lo < hi:
                s = nums[i] + nums[lo] + nums[hi]
                if s == 0:
                    out.append([nums[i], nums[lo], nums[hi]])
                    lo += 1
                    hi -= 1
                    while lo < hi and nums[lo] == nums[lo - 1]:
                        lo += 1
                    while lo < hi and nums[hi] == nums[hi + 1]:
                        hi -= 1
                elif s < 0:
                    lo += 1
                else:
                    hi -= 1
        out.sort()
        return out`,
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
      },
    ],
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

The same quadruplet of values must not appear twice in the result.

To make grading deterministic, please:

1. Sort each inner quadruplet in non-decreasing order.
2. Sort the outer list lexicographically.`,
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
    solutions: [
      {
        approach: 'Sort + Two Pointers',
        intuition: 'Generalize 3Sum: sort, fix the first two elements with nested loops, then use two pointers on the remaining suffix. Skip duplicates at all levels.',
        code: `class Solution:
    def fourSum(self, nums: list[int], target: int) -> list[list[int]]:
        nums = sorted(nums)
        n = len(nums)
        out = []
        for i in range(n - 3):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            for j in range(i + 1, n - 2):
                if j > i + 1 and nums[j] == nums[j - 1]:
                    continue
                lo, hi = j + 1, n - 1
                while lo < hi:
                    s = nums[i] + nums[j] + nums[lo] + nums[hi]
                    if s == target:
                        out.append([nums[i], nums[j], nums[lo], nums[hi]])
                        lo += 1
                        hi -= 1
                        while lo < hi and nums[lo] == nums[lo - 1]:
                            lo += 1
                        while lo < hi and nums[hi] == nums[hi + 1]:
                            hi -= 1
                    elif s < target:
                        lo += 1
                    else:
                        hi -= 1
        out.sort()
        return out`,
        timeComplexity: 'O(n³)',
        spaceComplexity: 'O(1)',
      },
    ],
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

You must solve this without using a library sort function.

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
    solutions: [
      {
        approach: 'Counting Sort',
        intuition: 'Count occurrences of 0, 1, and 2, then overwrite the array with the right number of each value.',
        code: `class Solution:
    def sortColors(self, nums: list[int]) -> list[int]:
        counts = [0, 0, 0]
        for v in nums:
            counts[v] += 1
        i = 0
        for color in range(3):
            for _ in range(counts[color]):
                nums[i] = color
                i += 1
        return nums`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Dutch National Flag',
        intuition: 'Use three pointers: lo (boundary of 0s), mid (current), hi (boundary of 2s). Swap 0s to the front and 2s to the back in a single pass.',
        code: `class Solution:
    def sortColors(self, nums: list[int]) -> list[int]:
        lo, mid, hi = 0, 0, len(nums) - 1
        while mid <= hi:
            if nums[mid] == 0:
                nums[lo], nums[mid] = nums[mid], nums[lo]
                lo += 1
                mid += 1
            elif nums[mid] == 2:
                nums[mid], nums[hi] = nums[hi], nums[mid]
                hi -= 1
            else:
                mid += 1
        return nums`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
Return the **total units of water** that would be trapped.`,
    examples: [
      {
        input: 'height = [3, 0, 1, 0, 2]',
        output: '5',
        explanation: 'Water pools above the interior positions: 2 + 1 + 2 = 5 units.',
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
    solutions: [
      {
        approach: 'Prefix Max Arrays',
        intuition: 'Precompute the maximum height to the left and right of each position. Water at position i is min(leftMax[i], rightMax[i]) - height[i].',
        code: `class Solution:
    def trap(self, height: list[int]) -> int:
        n = len(height)
        if n == 0:
            return 0
        left_max = [0] * n
        right_max = [0] * n
        left_max[0] = height[0]
        for i in range(1, n):
            left_max[i] = max(left_max[i - 1], height[i])
        right_max[n - 1] = height[n - 1]
        for i in range(n - 2, -1, -1):
            right_max[i] = max(right_max[i + 1], height[i])
        total = 0
        for i in range(n):
            total += min(left_max[i], right_max[i]) - height[i]
        return total`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Two Pointers',
        intuition: 'Walk from both ends, always advancing the shorter side. Track the running max on each side. Water at any position is determined by the running max on its side minus the height.',
        code: `class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        i, j = 0, len(height) - 1
        lmax = rmax = 0
        total = 0
        while i < j:
            if height[i] < height[j]:
                if height[i] >= lmax:
                    lmax = height[i]
                else:
                    total += lmax - height[i]
                i += 1
            else:
                if height[j] >= rmax:
                    rmax = height[j]
                else:
                    total += rmax - height[j]
                j -= 1
        return total`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
weight is at most \`limit\`.`,
    examples: [
      {
        input: 'people = [4, 2, 1], limit = 4',
        output: '2',
        explanation: 'Boat 1 carries the 1 and the 2; boat 2 carries the 4.',
      },
      {
        input: 'people = [5, 5, 5, 5], limit = 5',
        output: '4',
        explanation: 'Every person weighs the full limit, so each one needs a separate boat.',
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
    solutions: [
      {
        approach: 'Greedy Two Pointers',
        intuition: 'Sort by weight. Pair the lightest with the heaviest person. If they fit together, both go; otherwise the heavy person goes alone. This greedy approach is optimal because pairing the lightest with the heaviest maximizes the chance of sharing boats.',
        code: `class Solution:
    def numRescueBoats(self, people: list[int], limit: int) -> int:
        people = sorted(people)
        i, j = 0, len(people) - 1
        boats = 0
        while i <= j:
            if people[i] + people[j] <= limit:
                i += 1
            j -= 1
            boats += 1
        return boats`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Merge Sorted Array (LC #88) ────────────────────────────────────────────
  {
    slug: 'merge-sorted-array',
    lcNumber: 88,
    title: 'Merge Sorted Array',
    difficulty: 'Easy',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers'],
    descriptionMd: `You are given two sorted integer arrays \`nums1\` and \`nums2\`, with
\`nums1\` padded out to hold \`m + n\` elements (the first \`m\` are the real values, the
trailing \`n\` slots are zero-filled placeholders). \`nums2\` has length \`n\`. Merge the
two arrays so the result is sorted in non-decreasing order.

On LeetCode this problem asks you to mutate \`nums1\` in place. To make the grader happy,
please return the merged list of length \`m + n\`.`,
    examples: [
      {
        input: 'nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3',
        output: '[1, 2, 2, 3, 5, 6]',
      },
      {
        input: 'nums1 = [1], m = 1, nums2 = [], n = 0',
        output: '[1]',
      },
    ],
    constraints: [
      '`0 <= m, n <= 200`',
      '`1 <= m + n <= 200`',
      '`-10^9 <= nums1[i], nums2[i] <= 10^9`',
    ],
    starterCode: {
      python: `class Solution:
    def merge(self, nums1: list[int], m: int, nums2: list[int], n: int) -> list[int]:
        # Merge nums2 into the first m slots of nums1 and return the full merged list.
        pass
`,
    },
    methodName: 'merge',
    argKeys: ['nums1', 'm', 'nums2', 'n'],
    defaultTests: [
      { label: 'Interleaved', inputJson: '{"nums1":[1,2,3,0,0,0],"m":3,"nums2":[2,5,6],"n":3}', expectedJson: '[1,2,2,3,5,6]' },
      { label: 'Empty nums2', inputJson: '{"nums1":[1],"m":1,"nums2":[],"n":0}',                 expectedJson: '[1]'           },
      { label: 'Empty nums1', inputJson: '{"nums1":[0],"m":0,"nums2":[1],"n":1}',                expectedJson: '[1]'           },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Two Pointers from the End',
        intuition: 'Walk from the tails of both real arrays and write the larger value into the very end of nums1. Because we fill from the back, we never overwrite a value we still need.',
        code: `class Solution:
    def merge(self, nums1: list[int], m: int, nums2: list[int], n: int) -> list[int]:
        i, j, k = m - 1, n - 1, m + n - 1
        while j >= 0:
            if i >= 0 and nums1[i] > nums2[j]:
                nums1[k] = nums1[i]
                i -= 1
            else:
                nums1[k] = nums2[j]
                j -= 1
            k -= 1
        return nums1[:m + n]`,
        timeComplexity: 'O(m + n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Remove Element (LC #27) ────────────────────────────────────────────────
  {
    slug: 'remove-element',
    lcNumber: 27,
    title: 'Remove Element',
    difficulty: 'Easy',
    pattern: 'Two Pointers',
    tags: ['array', 'two-pointers'],
    descriptionMd: `You are given an integer array \`nums\` and a target integer \`val\`.
Remove **every occurrence** of \`val\` from \`nums\` and return the resulting list, with
the relative order of the remaining elements preserved.

On LeetCode this problem asks you to mutate \`nums\` in place and return the new length
\`k\`. Our grader instead checks the list you return, so please return the filtered list
directly.`,
    examples: [
      {
        input: 'nums = [3, 2, 2, 3], val = 3',
        output: '[2, 2]',
      },
      {
        input: 'nums = [0, 1, 2, 2, 3, 0, 4, 2], val = 2',
        output: '[0, 1, 3, 0, 4]',
      },
    ],
    constraints: [
      '`0 <= len(nums) <= 100`',
      '`0 <= nums[i] <= 50`',
      '`0 <= val <= 100`',
    ],
    starterCode: {
      python: `class Solution:
    def removeElement(self, nums: list[int], val: int) -> list[int]:
        # Return nums with every occurrence of val removed (preserving order).
        pass
`,
    },
    methodName: 'removeElement',
    argKeys: ['nums', 'val'],
    defaultTests: [
      { label: 'Two removals',   inputJson: '{"nums":[3,2,2,3],"val":3}',           expectedJson: '[2,2]'       },
      { label: 'Multiple',       inputJson: '{"nums":[0,1,2,2,3,0,4,2],"val":2}',   expectedJson: '[0,1,3,0,4]' },
      { label: 'Not present',    inputJson: '{"nums":[1,2,3],"val":9}',             expectedJson: '[1,2,3]'     },
      { label: 'All removed',    inputJson: '{"nums":[4,4,4],"val":4}',             expectedJson: '[]'          },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Two Pointers',
        intuition: 'Use a write pointer w that tracks the position of the next kept value. Scan through the array — every value that is not equal to val gets copied to nums[w] and w advances.',
        code: `class Solution:
    def removeElement(self, nums: list[int], val: int) -> list[int]:
        w = 0
        for v in nums:
            if v != val:
                nums[w] = v
                w += 1
        return nums[:w]`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },
];
