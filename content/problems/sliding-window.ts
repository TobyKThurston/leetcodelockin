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
make from that single transaction. If no profit is possible, return \`0\`.`,
    examples: [
      {
        input: 'prices = [9, 2, 7, 1, 8, 3]',
        output: '7',
        explanation: 'Buy on day 3 at price 1, sell on day 4 at price 8, profit = 7.',
      },
      {
        input: 'prices = [10, 9, 8, 7]',
        output: '0',
        explanation: 'Prices only decrease, so no transaction produces a positive profit.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'Check every pair of days (i, j) where j > i, compute prices[j] - prices[i], and track the maximum. This considers all possible trades.',
        code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        best = 0
        for i in range(len(prices)):
            for j in range(i + 1, len(prices)):
                best = max(best, prices[j] - prices[i])
        return best
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'One Pass (Track Minimum)',
        intuition: 'Walk through prices once, keeping track of the lowest price seen so far. At each day, compute the profit if you sold today and update the best profit. This works because the best buy must come before the best sell.',
        code: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        best = 0
        lo = prices[0]
        for p in prices:
            if p < lo:
                lo = p
            elif p - lo > best:
                best = p - lo
        return best
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
contains no repeated characters.`,
    examples: [
      {
        input: 's = "fishchips"',
        output: '5',
        explanation: 'The substring "chips" has 5 distinct characters.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'For each starting index, check all possible substrings by expanding rightward and using a set to detect duplicates. Reset whenever a duplicate is found.',
        code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        best = 0
        for i in range(len(s)):
            seen = set()
            for j in range(i, len(s)):
                if s[j] in seen:
                    break
                seen.add(s[j])
                best = max(best, j - i + 1)
        return best
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(min(n, m)) where m is the character set size',
      },
      {
        approach: 'Sliding Window with Last-Seen Map',
        intuition: 'Maintain a map of each character to its most recent index. When you encounter a character already in the window, jump the left pointer past its previous occurrence. This lets you process each character at most once.',
        code: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}
        best = 0
        left = 0
        for i, ch in enumerate(s):
            if ch in last and last[ch] >= left:
                left = last[ch] + 1
            last[ch] = i
            if i - left + 1 > best:
                best = i - left + 1
        return best
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(min(n, m)) where m is the character set size',
      },
    ],
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
as a float.`,
    examples: [
      {
        input: 'nums = [2, 4, 1, 5, 3], k = 2',
        output: '4.0',
        explanation: 'The subarray [5, 3] sums to 8, average 4.0.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'Compute the sum of every contiguous subarray of length k, divide by k, and track the maximum. This recomputes the sum from scratch for each window.',
        code: `class Solution:
    def findMaxAverage(self, nums: list[int], k: int) -> float:
        best = float('-inf')
        for i in range(len(nums) - k + 1):
            best = max(best, sum(nums[i:i+k]))
        return best / k
`,
        timeComplexity: 'O(n * k)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Fixed Sliding Window',
        intuition: 'Compute the sum of the first window, then slide one step at a time by adding the new element and subtracting the departing element. Divide the best sum by k at the end.',
        code: `class Solution:
    def findMaxAverage(self, nums: list[int], k: int) -> float:
        cur = sum(nums[:k])
        best = cur
        for i in range(k, len(nums)):
            cur += nums[i] - nums[i - k]
            if cur > best:
                best = cur
        return best / k
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
\`abs(i - j) <= k\`. Otherwise return \`False\`.`,
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'For every pair of indices, check if nums[i] == nums[j] and abs(i - j) <= k. This directly checks the condition but is slow for large inputs.',
        code: `class Solution:
    def containsNearbyDuplicate(self, nums: list[int], k: int) -> bool:
        for i in range(len(nums)):
            for j in range(i + 1, min(i + k + 1, len(nums))):
                if nums[i] == nums[j]:
                    return True
        return False
`,
        timeComplexity: 'O(n * k)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Hash Map (Last-Seen Index)',
        intuition: 'Keep a hash map from each value to its most recent index. For each element, check if we have seen it before within distance k. This gives a single-pass O(n) solution.',
        code: `class Solution:
    def containsNearbyDuplicate(self, nums: list[int], k: int) -> bool:
        last = {}
        for i, v in enumerate(nums):
            if v in last and i - last[v] <= k:
                return True
            last[v] = i
        return False
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
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
subarray exists, return \`0\`.`,
    examples: [
      {
        input: 'nums = [4, 2, 2, 5, 1, 6], target = 10',
        output: '3',
        explanation: 'The shortest qualifying subarray is [5, 1, 6] with sum 12.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'Check every possible subarray starting at each index, accumulating the sum and recording the shortest one that reaches the target.',
        code: `class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        best = 0
        for i in range(len(nums)):
            cur = 0
            for j in range(i, len(nums)):
                cur += nums[j]
                if cur >= target:
                    window = j - i + 1
                    if best == 0 or window < best:
                        best = window
                    break
        return best
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Variable Sliding Window',
        intuition: 'Since all values are positive, growing the window only increases the sum. Expand the right edge, and whenever the sum reaches the target, shrink from the left while the sum stays large enough, tracking the minimum window size.',
        code: `class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        best = 0
        cur = 0
        left = 0
        for right in range(len(nums)):
            cur += nums[right]
            while cur >= target:
                window = right - left + 1
                if best == 0 or window < best:
                    best = window
                cur -= nums[left]
                left += 1
        return best
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
length exactly \`k\`.`,
    examples: [
      {
        input: 's = "greedy", k = 3',
        output: '2',
        explanation: 'The substrings "ree" and "eed" each contain 2 vowels.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'For each window of size k, count how many characters are vowels by scanning the entire window. Track the maximum count across all windows.',
        code: `class Solution:
    def maxVowels(self, s: str, k: int) -> int:
        vowels = set('aeiou')
        best = 0
        for i in range(len(s) - k + 1):
            count = sum(1 for c in s[i:i+k] if c in vowels)
            best = max(best, count)
        return best
`,
        timeComplexity: 'O(n * k)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Fixed Sliding Window',
        intuition: 'Compute the vowel count of the first k characters, then slide one character at a time: add 1 if the entering character is a vowel, subtract 1 if the leaving character is a vowel.',
        code: `class Solution:
    def maxVowels(self, s: str, k: int) -> int:
        vowels = set('aeiou')
        cur = sum(1 for c in s[:k] if c in vowels)
        best = cur
        for i in range(k, len(s)):
            if s[i] in vowels:
                cur += 1
            if s[i - k] in vowels:
                cur -= 1
            if cur > best:
                best = cur
        return best
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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

A permutation of \`s1\` is any rearrangement of its characters using each character the same
number of times.`,
    examples: [
      {
        input: 's1 = "abc", s2 = "lazabcxyz"',
        output: 'True',
        explanation: '"abc" appears as a substring of "lazabcxyz" starting at index 3.',
      },
      {
        input: 's1 = "xy", s2 = "yxwz"',
        output: 'True',
        explanation: '"yx" is a permutation of "xy" and appears at the start of "yxwz".',
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
    solutions: [
      {
        approach: 'Brute Force (Sort Each Window)',
        intuition: 'For every window of length len(s1) in s2, sort both the window and s1 and compare. If sorted forms match, the window is a permutation.',
        code: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        k = len(s1)
        target = sorted(s1)
        for i in range(len(s2) - k + 1):
            if sorted(s2[i:i+k]) == target:
                return True
        return False
`,
        timeComplexity: 'O(n * k log k) where n = len(s2), k = len(s1)',
        spaceComplexity: 'O(k)',
      },
      {
        approach: 'Sliding Window with Frequency Arrays',
        intuition: 'Maintain two length-26 frequency arrays: one for s1 and one for the current window in s2. Slide the window one character at a time, comparing the arrays at each step.',
        code: `class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        if len(s1) > len(s2):
            return False
        need = [0] * 26
        have = [0] * 26
        for ch in s1:
            need[ord(ch) - 97] += 1
        for i in range(len(s1)):
            have[ord(s2[i]) - 97] += 1
        if have == need:
            return True
        for i in range(len(s1), len(s2)):
            have[ord(s2[i]) - 97] += 1
            have[ord(s2[i - len(s1)]) - 97] -= 1
            if have == need:
                return True
        return False
`,
        timeComplexity: 'O(n) where n = len(s2)',
        spaceComplexity: 'O(1) (fixed 26-element arrays)',
      },
    ],
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
\`s\` where a substring of length \`len(p)\` is an anagram of \`p\`. An anagram is a
rearrangement of the characters using each character the same number of times.

Indices should be returned in ascending order.`,
    examples: [
      {
        input: 's = "abab", p = "ab"',
        output: '[0, 1, 2]',
        explanation: 'The substrings "ab", "ba", and "ab" starting at indices 0, 1, 2 are all anagrams of "ab".',
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
    solutions: [
      {
        approach: 'Brute Force (Sort Each Window)',
        intuition: 'For every window of length len(p) in s, sort the window and compare it with sorted p. Collect all starting indices where they match.',
        code: `class Solution:
    def findAnagrams(self, s: str, p: str) -> list[int]:
        k = len(p)
        target = sorted(p)
        out = []
        for i in range(len(s) - k + 1):
            if sorted(s[i:i+k]) == target:
                out.append(i)
        return out
`,
        timeComplexity: 'O(n * k log k) where n = len(s), k = len(p)',
        spaceComplexity: 'O(k)',
      },
      {
        approach: 'Sliding Window with Frequency Arrays',
        intuition: 'Maintain two length-26 frequency arrays and slide a window of size len(p) across s. When the arrays match, the current window start is an anagram position.',
        code: `class Solution:
    def findAnagrams(self, s: str, p: str) -> list[int]:
        if len(p) > len(s):
            return []
        need = [0] * 26
        have = [0] * 26
        for ch in p:
            need[ord(ch) - 97] += 1
        out = []
        for i in range(len(s)):
            have[ord(s[i]) - 97] += 1
            if i >= len(p):
                have[ord(s[i - len(p)]) - 97] -= 1
            if i >= len(p) - 1 and have == need:
                out.append(i - len(p) + 1)
        return out
`,
        timeComplexity: 'O(n) where n = len(s)',
        spaceComplexity: 'O(1) (fixed 26-element arrays)',
      },
    ],
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
at most \`k\` characters (with any letters you choose).`,
    examples: [
      {
        input: 's = "AABABB", k = 2',
        output: '5',
        explanation: 'Replace the two A characters in the substring "ABABB" to get "BBBBB" — length 5.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'For each starting index, try every possible window length. Track the most frequent character in each window and check if the rest can be replaced within k swaps.',
        code: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        best = 0
        for i in range(len(s)):
            counts = {}
            max_freq = 0
            for j in range(i, len(s)):
                counts[s[j]] = counts.get(s[j], 0) + 1
                max_freq = max(max_freq, counts[s[j]])
                if (j - i + 1) - max_freq <= k:
                    best = max(best, j - i + 1)
                else:
                    break
        return best
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(1) (at most 26 keys)',
      },
      {
        approach: 'Variable Sliding Window',
        intuition: 'Expand the right edge freely, tracking the highest character frequency in the window. When window_length minus that max frequency exceeds k, shrink from the left. The answer is the largest valid window seen.',
        code: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        counts = {}
        left = 0
        best = 0
        max_freq = 0
        for right in range(len(s)):
            ch = s[right]
            counts[ch] = counts.get(ch, 0) + 1
            if counts[ch] > max_freq:
                max_freq = counts[ch]
            while (right - left + 1) - max_freq > k:
                counts[s[left]] -= 1
                left += 1
                max_freq = max(counts.values()) if counts else 0
            if right - left + 1 > best:
                best = right - left + 1
        return best
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1) (at most 26 keys)',
      },
    ],
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
of contiguous non-empty subarrays whose **product is strictly less than** \`k\`.`,
    examples: [
      {
        input: 'nums = [1, 2, 3], k = 7',
        output: '6',
        explanation: 'All six non-empty subarrays of [1, 2, 3] have product strictly less than 7.',
      },
      {
        input: 'nums = [5, 5, 5], k = 5',
        output: '0',
        explanation: 'Every element equals 5, so no subarray has a product strictly less than 5.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'For each starting index, expand rightward computing the running product. Count every subarray whose product stays below k.',
        code: `class Solution:
    def numSubarrayProductLessThanK(self, nums: list[int], k: int) -> int:
        if k <= 1:
            return 0
        count = 0
        for i in range(len(nums)):
            prod = 1
            for j in range(i, len(nums)):
                prod *= nums[j]
                if prod < k:
                    count += 1
                else:
                    break
        return count
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Variable Sliding Window',
        intuition: 'Since all elements are positive, the product is monotonic in window size. Grow the right edge multiplying as you go. When the product reaches k or more, shrink from the left by dividing. The number of valid subarrays ending at right is right - left + 1.',
        code: `class Solution:
    def numSubarrayProductLessThanK(self, nums: list[int], k: int) -> int:
        if k <= 1:
            return 0
        prod = 1
        left = 0
        count = 0
        for right in range(len(nums)):
            prod *= nums[right]
            while prod >= k:
                prod //= nums[left]
                left += 1
            count += right - left + 1
        return count
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
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
longest contiguous subarray of \`fruits\` that contains at most **two distinct values**.`,
    examples: [
      {
        input: 'fruits = [1, 2, 1, 3, 4, 3, 3]',
        output: '4',
        explanation: 'The contiguous stretch [3, 4, 3, 3] starting at index 3 uses two types and has length 4.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'For each starting index, expand rightward and track distinct fruit types with a set. Stop when a third type appears. Track the longest valid window.',
        code: `class Solution:
    def totalFruit(self, fruits: list[int]) -> int:
        best = 0
        for i in range(len(fruits)):
            types = set()
            j = i
            while j < len(fruits) and (fruits[j] in types or len(types) < 2):
                types.add(fruits[j])
                j += 1
            best = max(best, j - i)
        return best
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Variable Sliding Window',
        intuition: 'Maintain a window with a count map of fruit types. When a third distinct type appears, shrink from the left until one type is fully removed. Track the maximum window length.',
        code: `class Solution:
    def totalFruit(self, fruits: list[int]) -> int:
        counts = {}
        left = 0
        best = 0
        for right in range(len(fruits)):
            f = fruits[right]
            counts[f] = counts.get(f, 0) + 1
            while len(counts) > 2:
                out = fruits[left]
                counts[out] -= 1
                if counts[out] == 0:
                    del counts[out]
                left += 1
            if right - left + 1 > best:
                best = right - left + 1
        return best
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1) (at most 3 keys in the map)',
      },
    ],
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
\`s\` that contains every character of \`t\` (including repetitions). If no such substring
exists, return the empty string \`""\`.

If multiple substrings tie for shortest, any one of them is acceptable.`,
    examples: [
      {
        input: 's = "abbcba", t = "abc"',
        output: '"cba"',
        explanation: 'The substring "cba" has length 3 and contains one of each required letter.',
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
    solutions: [
      {
        approach: 'Brute Force',
        intuition: 'Check every possible substring of s and verify whether it contains all characters of t with the right counts. Track the shortest valid one.',
        code: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        from collections import Counter
        need = Counter(t)
        best = ""
        for i in range(len(s)):
            for j in range(i + len(t), len(s) + 1):
                window = Counter(s[i:j])
                if all(window.get(c, 0) >= need[c] for c in need):
                    if not best or j - i < len(best):
                        best = s[i:j]
                    break
        return best
`,
        timeComplexity: 'O(n^2 * m) where m = len(t)',
        spaceComplexity: 'O(n + m)',
      },
      {
        approach: 'Sliding Window with Frequency Map',
        intuition: 'Expand the right edge until all required characters are covered, then shrink from the left as far as possible while still valid, recording the smallest window. A "formed" counter tracks how many distinct required characters have reached their needed count.',
        code: `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or not s:
            return ""
        need = {}
        for ch in t:
            need[ch] = need.get(ch, 0) + 1
        required = len(need)
        have_counts = {}
        formed = 0
        left = 0
        best = None  # (length, left, right)
        for right in range(len(s)):
            ch = s[right]
            have_counts[ch] = have_counts.get(ch, 0) + 1
            if ch in need and have_counts[ch] == need[ch]:
                formed += 1
            while formed == required:
                if best is None or right - left + 1 < best[0]:
                    best = (right - left + 1, left, right)
                lch = s[left]
                have_counts[lch] -= 1
                if lch in need and have_counts[lch] < need[lch]:
                    formed -= 1
                left += 1
        return "" if best is None else s[best[1]:best[2] + 1]
`,
        timeComplexity: 'O(n + m) where m = len(t)',
        spaceComplexity: 'O(n + m)',
      },
    ],
  },
];
