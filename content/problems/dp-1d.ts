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
  },
];
