// ─── 1-D Dynamic Programming problems ───────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const DP_1D_PROBLEMS: ProblemContent[] = [
  // ─── Climbing Stairs (LC #70) ──────────────────────────────────────────────
  {
    slug: 'climbing-stairs',
    lcNumber: 70,
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    pattern: 'Dynamic Programming',
    tags: ['dp'],
    descriptionMd: `You are climbing a staircase that has \`n\` steps. On each move you may take **either
1 or 2 steps**. Return the number of distinct sequences of moves that reach the top.

This is the simplest possible DP problem: \`ways(n) = ways(n - 1) + ways(n - 2)\`, with the
base cases \`ways(1) = 1\` and \`ways(2) = 2\`. The recurrence is identical to the Fibonacci
sequence shifted by one.`,
    examples: [
      {
        input: 'n = 5',
        output: '8',
        explanation: 'The Fibonacci-style count: ways(5) = ways(4) + ways(3) = 5 + 3 = 8.',
      },
      {
        input: 'n = 1',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= n <= 45`',
    ],
    starterCode: {
      python: `class Solution:
    def climbStairs(self, n: int) -> int:
        # Return the number of distinct ways to climb n stairs taking 1 or 2 at a time.
        pass
`,
    },
    methodName: 'climbStairs',
    argKeys: ['n'],
    defaultTests: [
      { label: 'n = 5',  inputJson: '{"n":5}',  expectedJson: '8'  },
      { label: 'n = 1',  inputJson: '{"n":1}',  expectedJson: '1'  },
      { label: 'n = 10', inputJson: '{"n":10}', expectedJson: '89' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive (Brute Force)',
        intuition: 'At each step we can take 1 or 2 stairs, so the number of ways is the sum of ways(n-1) and ways(n-2). This has overlapping subproblems, leading to exponential time without memoization.',
        code: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        return self.climbStairs(n - 1) + self.climbStairs(n - 2)
`,
        timeComplexity: 'O(2^n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Bottom-Up DP (Iterative)',
        intuition: 'Since ways(n) = ways(n-1) + ways(n-2), iterate from the base cases upward, keeping only the last two values for O(1) space.',
        code: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Min Cost Climbing Stairs (LC #746) ────────────────────────────────────
  {
    slug: 'min-cost-climbing-stairs',
    lcNumber: 746,
    title: 'Min Cost Climbing Stairs',
    difficulty: 'Easy',
    pattern: 'DP',
    tags: ['dp'],
    descriptionMd: `You are given an integer array \`cost\` where \`cost[i]\` is the cost of stepping
on stair \`i\`. Once you pay the cost of a stair, you may move either **one or two** stairs
up. You can start at either stair 0 or stair 1. Return the **minimum total cost** required
to reach the top of the staircase (the position just past the last stair).

The recurrence is \`dp[i] = cost[i] + min(dp[i - 1], dp[i - 2])\`, and the answer is
\`min(dp[n - 1], dp[n - 2])\`. Since you only ever need the last two values, \`O(1)\`
memory is enough.`,
    examples: [
      {
        input: 'cost = [2, 5, 3]',
        output: '5',
        explanation: 'Start at 1 (pay 5), step two to the top — total 5.',
      },
      {
        input: 'cost = [10, 15, 20]',
        output: '15',
      },
    ],
    constraints: [
      '`2 <= len(cost) <= 1000`',
      '`0 <= cost[i] <= 999`',
    ],
    starterCode: {
      python: `class Solution:
    def minCostClimbingStairs(self, cost: list[int]) -> int:
        # Return the minimum cost to reach the top of the staircase.
        pass
`,
    },
    methodName: 'minCostClimbingStairs',
    argKeys: ['cost'],
    defaultTests: [
      { label: 'Short',     inputJson: '{"cost":[2,5,3]}',      expectedJson: '5'  },
      { label: 'Three',     inputJson: '{"cost":[10,15,20]}',   expectedJson: '15' },
      { label: 'Zeros',     inputJson: '{"cost":[0,0]}',        expectedJson: '0'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive (Brute Force)',
        intuition: 'At each stair, the minimum cost is the stair cost plus the cheaper of the two preceding costs. Recursion with memoization avoids recomputation.',
        code: `class Solution:
    def minCostClimbingStairs(self, cost: list[int]) -> int:
        memo = {}
        def dp(i):
            if i < 2:
                return cost[i] if i < len(cost) else 0
            if i in memo:
                return memo[i]
            memo[i] = cost[i] + min(dp(i - 1), dp(i - 2)) if i < len(cost) else min(dp(i - 1), dp(i - 2))
            return memo[i]
        return min(dp(len(cost) - 1), dp(len(cost) - 2))
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Bottom-Up DP (Iterative)',
        intuition: 'Build the answer iteratively: dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2]). Only the last two values are needed, so use two variables.',
        code: `class Solution:
    def minCostClimbingStairs(self, cost: list[int]) -> int:
        a = b = 0
        for i in range(2, len(cost) + 1):
            cur = min(a + cost[i - 2], b + cost[i - 1])
            a, b = b, cur
        return b
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── House Robber (LC #198) ────────────────────────────────────────────────
  {
    slug: 'house-robber',
    lcNumber: 198,
    title: 'House Robber',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp'],
    descriptionMd: `You are a thief planning to rob houses along a street. Each house holds
\`nums[i]\` dollars, but **adjacent houses are wired to the same alarm system** — robbing
two adjacent houses on the same night triggers the police. Return the **maximum amount of
money** you can rob in one night without alerting the police.

The recurrence is \`dp[i] = max(dp[i - 1], dp[i - 2] + nums[i])\`. You only need the last
two values.`,
    examples: [
      {
        input: 'nums = [2, 7, 9, 3, 1]',
        output: '12',
        explanation: 'Rob houses 0, 2, 4 — total 2 + 9 + 1 = 12.',
      },
      {
        input: 'nums = [5]',
        output: '5',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 100`',
      '`0 <= nums[i] <= 400`',
    ],
    starterCode: {
      python: `class Solution:
    def rob(self, nums: list[int]) -> int:
        # Return the max money robbable without hitting adjacent houses.
        pass
`,
    },
    methodName: 'rob',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Five houses',  inputJson: '{"nums":[2,7,9,3,1]}', expectedJson: '12' },
      { label: 'Four houses',  inputJson: '{"nums":[1,2,3,1]}',   expectedJson: '4'  },
      { label: 'Single',       inputJson: '{"nums":[5]}',         expectedJson: '5'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive (Brute Force)',
        intuition: 'For each house, either rob it (add its value and skip the previous) or skip it. This gives the recurrence rob(i) = max(rob(i-1), rob(i-2) + nums[i]).',
        code: `class Solution:
    def rob(self, nums: list[int]) -> int:
        memo = {}
        def dp(i):
            if i < 0:
                return 0
            if i in memo:
                return memo[i]
            memo[i] = max(dp(i - 1), dp(i - 2) + nums[i])
            return memo[i]
        return dp(len(nums) - 1)
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Bottom-Up DP (Iterative)',
        intuition: 'Iterate through houses, tracking the best loot with and without the current house using two rolling variables.',
        code: `class Solution:
    def rob(self, nums: list[int]) -> int:
        prev = prev2 = 0
        for v in nums:
            prev, prev2 = max(prev, prev2 + v), prev
        return prev
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── House Robber II (LC #213) ─────────────────────────────────────────────
  {
    slug: 'house-robber-ii',
    lcNumber: 213,
    title: 'House Robber II',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp'],
    descriptionMd: `Same setup as "House Robber", but now the houses are arranged in a **circle** —
the first and last houses are also adjacent. Return the maximum money you can rob without
triggering the alarm.

The trick: run the linear House Robber twice, once on \`nums[0..n-2]\` (exclude the last
house) and once on \`nums[1..n-1]\` (exclude the first), and take the larger answer.`,
    examples: [
      {
        input: 'nums = [2, 3, 2]',
        output: '3',
        explanation: 'You cannot rob both of the 2s because they wrap around and are adjacent.',
      },
      {
        input: 'nums = [1, 2, 3, 1]',
        output: '4',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 100`',
      '`0 <= nums[i] <= 1000`',
    ],
    starterCode: {
      python: `class Solution:
    def rob(self, nums: list[int]) -> int:
        # Same as House Robber but the line is circular (first and last adjacent).
        pass
`,
    },
    methodName: 'rob',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Circular three', inputJson: '{"nums":[2,3,2]}',   expectedJson: '3' },
      { label: 'Four houses',    inputJson: '{"nums":[1,2,3,1]}', expectedJson: '4' },
      { label: 'Single',         inputJson: '{"nums":[1]}',       expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Reduce to Linear House Robber',
        intuition: 'Since the houses form a circle, the first and last houses are adjacent. Run the linear House Robber twice: once excluding the last house and once excluding the first, then take the maximum.',
        code: `class Solution:
    def rob(self, nums: list[int]) -> int:
        if len(nums) == 1:
            return nums[0]

        def rob_line(arr):
            prev = prev2 = 0
            for v in arr:
                prev, prev2 = max(prev, prev2 + v), prev
            return prev

        return max(rob_line(nums[:-1]), rob_line(nums[1:]))
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Fibonacci Number (LC #509) ────────────────────────────────────────────
  {
    slug: 'fibonacci-number',
    lcNumber: 509,
    title: 'Fibonacci Number',
    difficulty: 'Easy',
    pattern: 'DP',
    tags: ['dp', 'math'],
    descriptionMd: `Return the \`n\`-th Fibonacci number, defined by \`F(0) = 0\`, \`F(1) = 1\`, and
\`F(n) = F(n - 1) + F(n - 2)\` for \`n >= 2\`.

The iterative \`O(n)\` loop using two rolling variables is the standard solution.`,
    examples: [
      {
        input: 'n = 10',
        output: '55',
      },
      {
        input: 'n = 0',
        output: '0',
      },
    ],
    constraints: [
      '`0 <= n <= 30`',
    ],
    starterCode: {
      python: `class Solution:
    def fib(self, n: int) -> int:
        # Return the n-th Fibonacci number using an iterative loop.
        pass
`,
    },
    methodName: 'fib',
    argKeys: ['n'],
    defaultTests: [
      { label: 'n = 10', inputJson: '{"n":10}', expectedJson: '55'     },
      { label: 'n = 0',  inputJson: '{"n":0}',  expectedJson: '0'      },
      { label: 'n = 1',  inputJson: '{"n":1}',  expectedJson: '1'      },
      { label: 'n = 30', inputJson: '{"n":30}', expectedJson: '832040' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive (Brute Force)',
        intuition: 'The naive recursive definition F(n) = F(n-1) + F(n-2) directly mirrors the problem statement but has exponential time due to repeated subproblems.',
        code: `class Solution:
    def fib(self, n: int) -> int:
        if n < 2:
            return n
        return self.fib(n - 1) + self.fib(n - 2)
`,
        timeComplexity: 'O(2^n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Bottom-Up DP (Iterative)',
        intuition: 'Iterate from the base cases upward, maintaining only the two most recent values. This computes F(n) in linear time with constant space.',
        code: `class Solution:
    def fib(self, n: int) -> int:
        if n < 2:
            return n
        a, b = 0, 1
        for _ in range(n - 1):
            a, b = b, a + b
        return b
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Delete and Earn (LC #740) ─────────────────────────────────────────────
  {
    slug: 'delete-and-earn',
    lcNumber: 740,
    title: 'Delete and Earn',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp', 'array'],
    descriptionMd: `You are given an integer array \`nums\`. You may repeatedly pick any value \`v\`
still present in \`nums\` and earn \`v\` points for each copy of \`v\` you remove — but
doing so forces you to also delete **every copy** of \`v - 1\` and \`v + 1\`. Return the
**maximum points** you can earn across all such operations.

Reduce the problem to House Robber: build an array \`pts[v] = v * count[v]\`, and find the
max subset sum where no two chosen indices are adjacent. Use the standard
\`pick\` / \`skip\` DP.`,
    examples: [
      {
        input: 'nums = [3, 4, 2]',
        output: '6',
      },
      {
        input: 'nums = [2, 2, 3, 3, 3, 4]',
        output: '9',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 2 * 10^4`',
      '`1 <= nums[i] <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def deleteAndEarn(self, nums: list[int]) -> int:
        # Return the maximum points achievable with the delete-and-earn rules.
        pass
`,
    },
    methodName: 'deleteAndEarn',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Basic',        inputJson: '{"nums":[3,4,2]}',           expectedJson: '6' },
      { label: 'Runs of three',inputJson: '{"nums":[2,2,3,3,3,4]}',     expectedJson: '9' },
      { label: 'Single value', inputJson: '{"nums":[5]}',                expectedJson: '5' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Reduce to House Robber',
        intuition: 'Build an array pts where pts[v] = v * count(v). Now the problem becomes House Robber on pts: picking value v means you cannot pick v-1 or v+1, which maps to no adjacent indices.',
        code: `class Solution:
    def deleteAndEarn(self, nums: list[int]) -> int:
        if not nums:
            return 0
        max_v = max(nums)
        points = [0] * (max_v + 1)
        for v in nums:
            points[v] += v
        prev = prev2 = 0
        for v in range(len(points)):
            prev, prev2 = max(prev, prev2 + points[v]), prev
        return prev
`,
        timeComplexity: 'O(n + k) where k is max(nums)',
        spaceComplexity: 'O(k)',
      },
    ],
  },

  // ─── Maximum Product Subarray (LC #152) ────────────────────────────────────
  {
    slug: 'maximum-product-subarray',
    lcNumber: 152,
    title: 'Maximum Product Subarray',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp', 'array'],
    descriptionMd: `Given an integer array \`nums\`, return the **largest product** of any contiguous
non-empty subarray.

The trick with signed products: negative numbers can turn a large negative product into a
large positive one. So track both the **max** and **min** product ending at each index, and
when you see a negative \`nums[i]\` the new max comes from the old **min**.`,
    examples: [
      {
        input: 'nums = [-2, -3, 4]',
        output: '24',
        explanation: 'Taking the whole array gives (-2) * (-3) * 4 = 24.',
      },
      {
        input: 'nums = [2, -5, 3]',
        output: '3',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 2 * 10^4`',
      '`-10 <= nums[i] <= 10`',
      'The answer is guaranteed to fit in a 32-bit integer.',
    ],
    starterCode: {
      python: `class Solution:
    def maxProduct(self, nums: list[int]) -> int:
        # Return the largest product of any contiguous non-empty subarray of nums.
        pass
`,
    },
    methodName: 'maxProduct',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Three negatives', inputJson: '{"nums":[-2,-3,4]}',  expectedJson: '24' },
      { label: 'Drop the neg',    inputJson: '{"nums":[2,-5,3]}',   expectedJson: '3'  },
      { label: 'Zero in middle',  inputJson: '{"nums":[-2,0,-1]}',  expectedJson: '0'  },
      { label: 'Single',          inputJson: '{"nums":[7]}',         expectedJson: '7'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Track Max and Min Products',
        intuition: 'A negative number can flip a large negative product into a large positive one. Track both the current max and min product ending at each index, swapping them when encountering a negative number.',
        code: `class Solution:
    def maxProduct(self, nums: list[int]) -> int:
        best = cur_max = cur_min = nums[0]
        for v in nums[1:]:
            if v < 0:
                cur_max, cur_min = cur_min, cur_max
            cur_max = max(v, cur_max * v)
            cur_min = min(v, cur_min * v)
            if cur_max > best:
                best = cur_max
        return best
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Word Break (LC #139) ──────────────────────────────────────────────────
  {
    slug: 'word-break',
    lcNumber: 139,
    title: 'Word Break',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp', 'string'],
    descriptionMd: `Given a string \`s\` and a list of dictionary words \`wordDict\`, return \`True\` if
\`s\` can be segmented into a space-separated sequence of one or more words from
\`wordDict\`. A word may be reused any number of times.

The classic DP: \`dp[i] = True\` if the prefix \`s[0..i]\` can be segmented, which holds
whenever there's some \`j < i\` with \`dp[j]\` true and \`s[j..i]\` in \`wordDict\`.`,
    examples: [
      {
        input: 's = "applepenapple", wordDict = ["apple", "pen"]',
        output: 'True',
      },
      {
        input: 's = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 300`',
      '`1 <= len(wordDict) <= 1000`',
      '`1 <= len(wordDict[i]) <= 20`',
      'All strings consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        # Return True if s can be built by concatenating words from wordDict.
        pass
`,
    },
    methodName: 'wordBreak',
    argKeys: ['s', 'wordDict'],
    defaultTests: [
      { label: 'Can split',   inputJson: '{"s":"applepenapple","wordDict":["apple","pen"]}',             expectedJson: 'true'  },
      { label: 'Cannot split',inputJson: '{"s":"catsandog","wordDict":["cats","dog","sand","and","cat"]}', expectedJson: 'false' },
      { label: 'Single char', inputJson: '{"s":"a","wordDict":["a"]}',                                    expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive (Brute Force)',
        intuition: 'Try every possible split point: dp(i) is True if s[:i] can be segmented. For each i, check all j < i where dp(j) is True and s[j:i] is in the dictionary.',
        code: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        memo = {}
        def dp(start):
            if start == len(s):
                return True
            if start in memo:
                return memo[start]
            for end in range(start + 1, len(s) + 1):
                if s[start:end] in words and dp(end):
                    memo[start] = True
                    return True
            memo[start] = False
            return False
        return dp(0)
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Build a boolean dp array where dp[i] = True means s[:i] can be segmented. For each position i, check all prior positions j where dp[j] is True and s[j:i] is a dictionary word.',
        code: `class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        words = set(wordDict)
        n = len(s)
        dp = [False] * (n + 1)
        dp[0] = True
        for i in range(1, n + 1):
            for j in range(i):
                if dp[j] and s[j:i] in words:
                    dp[i] = True
                    break
        return dp[n]
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Longest Increasing Subsequence (LC #300) ──────────────────────────────
  {
    slug: 'longest-increasing-subsequence',
    lcNumber: 300,
    title: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp', 'array'],
    descriptionMd: `Given an integer array \`nums\`, return the length of the longest **strictly
increasing subsequence** (the chosen elements don't need to be contiguous in \`nums\`).

The simple \`O(n^2)\` DP: \`dp[i] = 1 + max(dp[j] for j < i if nums[j] < nums[i])\`, or 1
if no such \`j\` exists. An \`O(n log n)\` approach uses patience sorting with a tails
array maintained by binary search.`,
    examples: [
      {
        input: 'nums = [1, 3, 2, 4]',
        output: '3',
        explanation: 'Subsequences [1, 3, 4] and [1, 2, 4] both have length 3.',
      },
      {
        input: 'nums = [5, 4, 3, 2, 1]',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 2500`',
      '`-10^4 <= nums[i] <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        # Return the length of the longest strictly increasing subsequence of nums.
        pass
`,
    },
    methodName: 'lengthOfLIS',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Short',        inputJson: '{"nums":[1,3,2,4]}',     expectedJson: '3' },
      { label: 'Strictly down',inputJson: '{"nums":[5,4,3,2,1]}',   expectedJson: '1' },
      { label: 'Single',       inputJson: '{"nums":[5]}',           expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'O(n^2) DP',
        intuition: 'For each element, look back at all earlier elements. If nums[j] < nums[i], then dp[i] = max(dp[i], dp[j] + 1). The answer is the maximum across all dp values.',
        code: `class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        if not nums:
            return 0
        dp = [1] * len(nums)
        for i in range(1, len(nums)):
            for j in range(i):
                if nums[j] < nums[i]:
                    dp[i] = max(dp[i], dp[j] + 1)
        return max(dp)
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Patience Sorting (Binary Search)',
        intuition: 'Maintain a tails array where tails[i] is the smallest tail element for an increasing subsequence of length i+1. For each number, binary search for its position in tails. The length of tails is the LIS length.',
        code: `from bisect import bisect_left


class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        tails = []
        for v in nums:
            pos = bisect_left(tails, v)
            if pos == len(tails):
                tails.append(v)
            else:
                tails[pos] = v
        return len(tails)
`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Coin Change (LC #322) ─────────────────────────────────────────────────
  {
    slug: 'coin-change',
    lcNumber: 322,
    title: 'Coin Change',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp'],
    descriptionMd: `You are given a list of coin denominations \`coins\` and a target \`amount\`.
Return the **fewest** coins needed to make up \`amount\` (you may use each coin an unlimited
number of times). If it cannot be done, return \`-1\`.

The standard DP builds \`dp[i]\` = fewest coins for amount \`i\`, initialised to infinity
with \`dp[0] = 0\`, and relaxes as
\`dp[i] = min(dp[i], dp[i - c] + 1)\` for every coin \`c\`.`,
    examples: [
      {
        input: 'coins = [1, 2, 5], amount = 11',
        output: '3',
        explanation: '5 + 5 + 1 = 11 with three coins.',
      },
      {
        input: 'coins = [2], amount = 3',
        output: '-1',
      },
    ],
    constraints: [
      '`1 <= len(coins) <= 12`',
      '`1 <= coins[i] <= 2^31 - 1`',
      '`0 <= amount <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        # Return the fewest coins to make amount, or -1 if impossible.
        pass
`,
    },
    methodName: 'coinChange',
    argKeys: ['coins', 'amount'],
    defaultTests: [
      { label: 'Three coins', inputJson: '{"coins":[1,2,5],"amount":11}', expectedJson: '3'  },
      { label: 'Impossible',  inputJson: '{"coins":[2],"amount":3}',       expectedJson: '-1' },
      { label: 'Zero amount', inputJson: '{"coins":[1],"amount":0}',       expectedJson: '0'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'For each amount, try subtracting each coin and recursively solve the remainder. Memoize to avoid recomputation.',
        code: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        memo = {}
        def dp(rem):
            if rem == 0:
                return 0
            if rem < 0:
                return float('inf')
            if rem in memo:
                return memo[rem]
            memo[rem] = min(dp(rem - c) + 1 for c in coins)
            return memo[rem]
        res = dp(amount)
        return -1 if res == float('inf') else res
`,
        timeComplexity: 'O(amount * len(coins))',
        spaceComplexity: 'O(amount)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Build dp[i] = fewest coins for amount i, starting from dp[0] = 0. For each amount, try each coin and take the minimum.',
        code: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        INF = amount + 1
        dp = [INF] * (amount + 1)
        dp[0] = 0
        for i in range(1, amount + 1):
            for c in coins:
                if c <= i and dp[i - c] + 1 < dp[i]:
                    dp[i] = dp[i - c] + 1
        return -1 if dp[amount] >= INF else dp[amount]
`,
        timeComplexity: 'O(amount * len(coins))',
        spaceComplexity: 'O(amount)',
      },
    ],
  },

  // ─── Decode Ways (LC #91) ──────────────────────────────────────────────────
  {
    slug: 'decode-ways',
    lcNumber: 91,
    title: 'Decode Ways',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp', 'string'],
    descriptionMd: `A digit string \`s\` is encoded using the mapping \`A = "1"\`, \`B = "2"\`, ...,
\`Z = "26"\`. Return the **number of distinct ways** to decode \`s\`. If \`s\` contains a
\`'0'\` that can't be part of a valid 10..26 pair, the answer is \`0\`.

The DP is Fibonacci-like: \`dp[i]\` is the number of decodings for \`s[0..i-1]\`. At each
index, add \`dp[i - 1]\` if \`s[i - 1] != '0'\` and \`dp[i - 2]\` if \`s[i - 2..i]\` is
between \`10\` and \`26\`.`,
    examples: [
      {
        input: 's = "226"',
        output: '3',
        explanation: '"BZ", "VF", and "BBF" are all valid decodings.',
      },
      {
        input: 's = "06"',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 100`',
      '`s` consists of digits only.',
    ],
    starterCode: {
      python: `class Solution:
    def numDecodings(self, s: str) -> int:
        # Return the number of ways to decode s using the A=1..Z=26 mapping.
        pass
`,
    },
    methodName: 'numDecodings',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Classic',     inputJson: '{"s":"226"}', expectedJson: '3' },
      { label: 'Leading zero',inputJson: '{"s":"06"}',  expectedJson: '0' },
      { label: 'Single valid',inputJson: '{"s":"12"}',  expectedJson: '2' },
      { label: 'Too large',   inputJson: '{"s":"27"}',  expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'At each position, a single non-zero digit contributes dp(i+1) decodings, and a valid two-digit number (10-26) contributes dp(i+2). Memoize to avoid recomputation.',
        code: `class Solution:
    def numDecodings(self, s: str) -> int:
        memo = {}
        def dp(i):
            if i == len(s):
                return 1
            if s[i] == '0':
                return 0
            if i in memo:
                return memo[i]
            res = dp(i + 1)
            if i + 1 < len(s) and int(s[i:i+2]) <= 26:
                res += dp(i + 2)
            memo[i] = res
            return res
        return dp(0)
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Iterate left to right, accumulating the count of decodings. At each position, add the previous count if the current digit is valid, and the count two steps back if the two-digit number is valid (10-26).',
        code: `class Solution:
    def numDecodings(self, s: str) -> int:
        if not s or s[0] == '0':
            return 0
        n = len(s)
        prev2 = 1
        prev1 = 1
        for i in range(1, n):
            cur = 0
            if s[i] != '0':
                cur += prev1
            two = int(s[i - 1:i + 1])
            if 10 <= two <= 26:
                cur += prev2
            prev2, prev1 = prev1, cur
        return prev1
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Perfect Squares (LC #279) ─────────────────────────────────────────────
  {
    slug: 'perfect-squares',
    lcNumber: 279,
    title: 'Perfect Squares',
    difficulty: 'Medium',
    pattern: 'DP',
    tags: ['dp', 'math'],
    descriptionMd: `Given a positive integer \`n\`, return the **least number** of perfect-square
integers (\`1, 4, 9, 16, ...\`) whose sum equals \`n\`.

The DP is \`dp[i] = 1 + min(dp[i - j * j] for j from 1 while j * j <= i)\`, with
\`dp[0] = 0\`. (Lagrange's four-square theorem says the answer is always 1, 2, 3, or 4 —
useful for sanity checks.)`,
    examples: [
      {
        input: 'n = 12',
        output: '3',
        explanation: '12 = 4 + 4 + 4.',
      },
      {
        input: 'n = 13',
        output: '2',
        explanation: '13 = 4 + 9.',
      },
    ],
    constraints: [
      '`1 <= n <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def numSquares(self, n: int) -> int:
        # Return the least number of perfect-square integers summing to n.
        pass
`,
    },
    methodName: 'numSquares',
    argKeys: ['n'],
    defaultTests: [
      { label: 'n = 12', inputJson: '{"n":12}', expectedJson: '3' },
      { label: 'n = 13', inputJson: '{"n":13}', expectedJson: '2' },
      { label: 'n = 1',  inputJson: '{"n":1}',  expectedJson: '1' },
      { label: 'n = 4',  inputJson: '{"n":4}',  expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'For each number n, try subtracting every perfect square j*j <= n and recursively solve the remainder. The answer is 1 + min over all such subproblems.',
        code: `class Solution:
    def numSquares(self, n: int) -> int:
        memo = {}
        def dp(rem):
            if rem == 0:
                return 0
            if rem in memo:
                return memo[rem]
            best = rem
            j = 1
            while j * j <= rem:
                best = min(best, dp(rem - j * j) + 1)
                j += 1
            memo[rem] = best
            return best
        return dp(n)
`,
        timeComplexity: 'O(n * sqrt(n))',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Build dp[i] = least number of perfect squares summing to i. For each i, try all perfect squares j*j <= i and take dp[i] = 1 + min(dp[i - j*j]).',
        code: `class Solution:
    def numSquares(self, n: int) -> int:
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            best = i
            j = 1
            while j * j <= i:
                best = min(best, dp[i - j * j] + 1)
                j += 1
            dp[i] = best
        return dp[n]
`,
        timeComplexity: 'O(n * sqrt(n))',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── N-th Tribonacci Number (LC #1137) ──────────────────────────────────────
  {
    slug: 'n-th-tribonacci-number',
    lcNumber: 1137,
    title: 'N-th Tribonacci Number',
    difficulty: 'Easy',
    pattern: '1-D DP',
    tags: ['dp', 'math'],
    descriptionMd: `The **Tribonacci sequence** \`T_n\` is defined by:

- \`T_0 = 0\`
- \`T_1 = 1\`
- \`T_2 = 1\`
- For \`n >= 0\`: \`T_{n+3} = T_n + T_{n+1} + T_{n+2}\`

Given a non-negative integer \`n\`, return \`T_n\`. The naive recursion is exponential —
use a rolling window of the last three values for a constant-space \`O(n)\` solution.`,
    examples: [
      {
        input: 'n = 4',
        output: '4',
        explanation: 'T_3 = 0+1+1 = 2, T_4 = 1+1+2 = 4.',
      },
      {
        input: 'n = 25',
        output: '1389537',
      },
    ],
    constraints: [
      '`0 <= n <= 37`',
      'The answer always fits in a signed 32-bit integer.',
    ],
    starterCode: {
      python: `class Solution:
    def tribonacci(self, n: int) -> int:
        # Return the n-th Tribonacci number.
        pass
`,
    },
    methodName: 'tribonacci',
    argKeys: ['n'],
    defaultTests: [
      { label: 'Zero',  inputJson: '{"n":0}',  expectedJson: '0'       },
      { label: 'One',   inputJson: '{"n":1}',  expectedJson: '1'       },
      { label: 'Four',  inputJson: '{"n":4}',  expectedJson: '4'       },
      { label: 'Large', inputJson: '{"n":25}', expectedJson: '1389537' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Iterative Rolling Window',
        intuition: 'Only the previous three Tribonacci values are needed to compute the next one. Keep them in three variables and walk forward in O(n) time with O(1) extra space.',
        code: `class Solution:
    def tribonacci(self, n: int) -> int:
        if n == 0:
            return 0
        if n <= 2:
            return 1
        a, b, c = 0, 1, 1
        for _ in range(n - 2):
            a, b, c = b, c, a + b + c
        return c`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Pascal's Triangle (LC #118) ────────────────────────────────────────────
  {
    slug: 'pascals-triangle',
    lcNumber: 118,
    title: "Pascal's Triangle",
    difficulty: 'Easy',
    pattern: '1-D DP',
    tags: ['dp', 'array'],
    descriptionMd: `Given an integer \`numRows\`, return the first \`numRows\` rows of
**Pascal's Triangle**. In Pascal's Triangle, each number is the sum of the two directly
above it, with the outermost entries of every row equal to \`1\`.

Row 0 is \`[1]\`, row 1 is \`[1, 1]\`, row 2 is \`[1, 2, 1]\`, and so on. The classic build
is bottom-up: start from the previous row, slide a window of width two, and sandwich the
result between two ones.`,
    examples: [
      {
        input: 'numRows = 5',
        output: '[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]',
      },
      {
        input: 'numRows = 1',
        output: '[[1]]',
      },
    ],
    constraints: [
      '`1 <= numRows <= 30`',
    ],
    starterCode: {
      python: `class Solution:
    def generate(self, numRows: int) -> list[list[int]]:
        # Return the first numRows rows of Pascal's Triangle.
        pass
`,
    },
    methodName: 'generate',
    argKeys: ['numRows'],
    defaultTests: [
      { label: 'Five rows', inputJson: '{"numRows":5}', expectedJson: '[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]' },
      { label: 'One row',   inputJson: '{"numRows":1}', expectedJson: '[[1]]'                                        },
      { label: 'Three rows',inputJson: '{"numRows":3}', expectedJson: '[[1],[1,1],[1,2,1]]'                          },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Row by Row',
        intuition: 'Build each row from the previous one. The interior of row i is formed by summing adjacent pairs of row i - 1, then sandwiched between 1s at the ends.',
        code: `class Solution:
    def generate(self, numRows: int) -> list[list[int]]:
        rows = [[1]]
        for i in range(1, numRows):
            prev = rows[-1]
            row = [1]
            for j in range(1, i):
                row.append(prev[j - 1] + prev[j])
            row.append(1)
            rows.append(row)
        return rows`,
        timeComplexity: 'O(numRows^2)',
        spaceComplexity: 'O(numRows^2)',
      },
    ],
  },
];
