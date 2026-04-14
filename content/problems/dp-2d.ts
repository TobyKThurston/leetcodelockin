// ─── 2-D Dynamic Programming problems ──────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const DP_2D_PROBLEMS: ProblemContent[] = [
  // ─── Unique Paths (LC #62) ─────────────────────────────────────────────────
  {
    slug: 'unique-paths',
    lcNumber: 62,
    title: 'Unique Paths',
    difficulty: 'Medium',
    pattern: 'Grid DP',
    tags: ['dp', 'matrix'],
    descriptionMd: `A robot starts at the top-left corner of an \`m x n\` grid and wants to reach the
bottom-right corner. The robot can only move **down** or **right** at each step. Return the
number of distinct paths the robot can take.`,
    examples: [
      {
        input: 'm = 3, n = 2',
        output: '3',
      },
      {
        input: 'm = 1, n = 5',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= m, n <= 100`',
    ],
    starterCode: {
      python: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        # Return the number of distinct down/right-only paths on an m x n grid.
        pass
`,
    },
    methodName: 'uniquePaths',
    argKeys: ['m', 'n'],
    defaultTests: [
      { label: '3 x 2', inputJson: '{"m":3,"n":2}', expectedJson: '3'  },
      { label: '1 x 5', inputJson: '{"m":1,"n":5}', expectedJson: '1'  },
      { label: '3 x 3', inputJson: '{"m":3,"n":3}', expectedJson: '6'  },
      { label: '1 x 1', inputJson: '{"m":1,"n":1}', expectedJson: '1'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'From any cell (r, c) you can move down or right. The number of paths is the sum of paths from the cell below and the cell to the right, with base case 1 at the destination.',
        code: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        memo = {}
        def dp(r, c):
            if r == m - 1 and c == n - 1:
                return 1
            if r >= m or c >= n:
                return 0
            if (r, c) in memo:
                return memo[(r, c)]
            memo[(r, c)] = dp(r + 1, c) + dp(r, c + 1)
            return memo[(r, c)]
        return dp(0, 0)
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Fill a 1-D dp array row by row. Each cell accumulates the count from the cell above (already in dp) and the cell to the left.',
        code: `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [1] * n
        for _ in range(1, m):
            for c in range(1, n):
                dp[c] += dp[c - 1]
        return dp[-1]
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Minimum Path Sum (LC #64) ─────────────────────────────────────────────
  {
    slug: 'minimum-path-sum',
    lcNumber: 64,
    title: 'Minimum Path Sum',
    difficulty: 'Medium',
    pattern: 'Grid DP',
    tags: ['dp', 'matrix'],
    descriptionMd: `Given an \`m x n\` grid \`grid\` of non-negative integers, find a path from the
top-left to the bottom-right that only moves **down** or **right** and minimises the sum
of the values along the path. Return that minimum sum.`,
    examples: [
      {
        input: 'grid = [[1, 2], [1, 1]]',
        output: '3',
        explanation: 'The path 1 -> 1 -> 1 visits the top-left, bottom-left, and bottom-right cells; its sum is 3.',
      },
      {
        input: 'grid = [[7]]',
        output: '7',
      },
    ],
    constraints: [
      '`1 <= m, n <= 200`',
      '`0 <= grid[i][j] <= 100`',
    ],
    starterCode: {
      python: `class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        # Return the minimum sum path from top-left to bottom-right (down/right only).
        pass
`,
    },
    methodName: 'minPathSum',
    argKeys: ['grid'],
    defaultTests: [
      { label: 'Two by two',  inputJson: '{"grid":[[1,2],[1,1]]}',         expectedJson: '3'  },
      { label: 'Single cell', inputJson: '{"grid":[[7]]}',                  expectedJson: '7'  },
      { label: 'Bigger',      inputJson: '{"grid":[[1,3,1],[1,5,1],[4,2,1]]}', expectedJson: '7' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'From each cell, the minimum-sum path is the cell value plus the minimum of the path going right and the path going down. Memoize to avoid recomputation.',
        code: `class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        m, n = len(grid), len(grid[0])
        memo = {}
        def dp(r, c):
            if r == m - 1 and c == n - 1:
                return grid[r][c]
            if r >= m or c >= n:
                return float('inf')
            if (r, c) in memo:
                return memo[(r, c)]
            memo[(r, c)] = grid[r][c] + min(dp(r + 1, c), dp(r, c + 1))
            return memo[(r, c)]
        return dp(0, 0)
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Fill a 1-D dp array left to right, row by row. Each cell is grid[r][c] + min(cell above, cell to the left), with edge cases for the first row and column.',
        code: `class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        m = len(grid)
        n = len(grid[0])
        dp = [0] * n
        dp[0] = grid[0][0]
        for c in range(1, n):
            dp[c] = dp[c - 1] + grid[0][c]
        for r in range(1, m):
            dp[0] += grid[r][0]
            for c in range(1, n):
                dp[c] = grid[r][c] + min(dp[c], dp[c - 1])
        return dp[-1]
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Unique Paths II (LC #63) ──────────────────────────────────────────────
  {
    slug: 'unique-paths-ii',
    lcNumber: 63,
    title: 'Unique Paths II',
    difficulty: 'Medium',
    pattern: 'Grid DP',
    tags: ['dp', 'matrix'],
    descriptionMd: `Same setup as "Unique Paths", except now the grid \`obstacleGrid\` contains
obstacles marked with \`1\` (and free cells marked with \`0\`). Return the number of
distinct paths from the top-left to the bottom-right, moving only **down** or **right** and
never stepping on an obstacle. If the start or destination is an obstacle, return \`0\`.`,
    examples: [
      {
        input: 'obstacleGrid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]',
        output: '2',
      },
      {
        input: 'obstacleGrid = [[1]]',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= m, n <= 100`',
      '`obstacleGrid[i][j]` is `0` or `1`.',
    ],
    starterCode: {
      python: `class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: list[list[int]]) -> int:
        # Return the number of down/right-only paths avoiding obstacles.
        pass
`,
    },
    methodName: 'uniquePathsWithObstacles',
    argKeys: ['obstacleGrid'],
    defaultTests: [
      { label: 'Classic',    inputJson: '{"obstacleGrid":[[0,0,0],[0,1,0],[0,0,0]]}', expectedJson: '2' },
      { label: 'Start blocked', inputJson: '{"obstacleGrid":[[1]]}',                  expectedJson: '0' },
      { label: 'Clear 2x2',  inputJson: '{"obstacleGrid":[[0,0],[0,0]]}',             expectedJson: '2' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'Same as Unique Paths but set dp to 0 for obstacle cells. The count at each cell is the sum of paths from below and from the right, skipping obstacles.',
        code: `class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: list[list[int]]) -> int:
        m, n = len(obstacleGrid), len(obstacleGrid[0])
        memo = {}
        def dp(r, c):
            if r >= m or c >= n or obstacleGrid[r][c] == 1:
                return 0
            if r == m - 1 and c == n - 1:
                return 1
            if (r, c) in memo:
                return memo[(r, c)]
            memo[(r, c)] = dp(r + 1, c) + dp(r, c + 1)
            return memo[(r, c)]
        return dp(0, 0)
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Use a 1-D dp array updated row by row. If a cell has an obstacle, set its count to 0. Otherwise, accumulate from the cell above and to the left.',
        code: `class Solution:
    def uniquePathsWithObstacles(self, obstacleGrid: list[list[int]]) -> int:
        m = len(obstacleGrid)
        n = len(obstacleGrid[0])
        if obstacleGrid[0][0] == 1:
            return 0
        dp = [0] * n
        dp[0] = 1
        for r in range(m):
            for c in range(n):
                if obstacleGrid[r][c] == 1:
                    dp[c] = 0
                elif c > 0:
                    dp[c] += dp[c - 1]
        return dp[-1]
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Maximal Square (LC #221) ──────────────────────────────────────────────
  {
    slug: 'maximal-square',
    lcNumber: 221,
    title: 'Maximal Square',
    difficulty: 'Medium',
    pattern: 'Grid DP',
    tags: ['dp', 'matrix'],
    descriptionMd: `Given an \`m x n\` binary matrix \`matrix\` of characters \`'0'\` and \`'1'\`,
return the **area** of the largest square containing only \`'1'\`s.`,
    examples: [
      {
        input: 'matrix = [["1", "1"], ["1", "1"]]',
        output: '4',
      },
      {
        input: 'matrix = [["0"]]',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= m, n <= 300`',
      '`matrix[i][j]` is `"0"` or `"1"`.',
    ],
    starterCode: {
      python: `class Solution:
    def maximalSquare(self, matrix: list[list[str]]) -> int:
        # Return the area of the largest all-"1" square in matrix.
        pass
`,
    },
    methodName: 'maximalSquare',
    argKeys: ['matrix'],
    defaultTests: [
      { label: 'Full 2x2', inputJson: '{"matrix":[["1","1"],["1","1"]]}',          expectedJson: '4' },
      { label: 'All zero', inputJson: '{"matrix":[["0"]]}',                         expectedJson: '0' },
      { label: 'Rectangle',inputJson: '{"matrix":[["1","1","1"],["1","1","0"]]}', expectedJson: '4' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Bottom-Up DP',
        intuition: 'dp[i][j] is the side length of the largest all-1 square with bottom-right corner at (i,j). If the cell is 1, it equals 1 + min of the three neighbors (top, left, top-left). The answer is the max side squared.',
        code: `class Solution:
    def maximalSquare(self, matrix: list[list[str]]) -> int:
        m = len(matrix)
        n = len(matrix[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        best = 0
        for r in range(1, m + 1):
            for c in range(1, n + 1):
                if matrix[r - 1][c - 1] == '1':
                    dp[r][c] = 1 + min(dp[r - 1][c - 1], dp[r - 1][c], dp[r][c - 1])
                    if dp[r][c] > best:
                        best = dp[r][c]
        return best * best
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Longest Common Subsequence (LC #1143) ─────────────────────────────────
  {
    slug: 'longest-common-subsequence',
    lcNumber: 1143,
    title: 'Longest Common Subsequence',
    difficulty: 'Medium',
    pattern: 'String DP',
    tags: ['dp', 'string'],
    descriptionMd: `Given two strings \`text1\` and \`text2\`, return the length of their **longest
common subsequence**. If there is no common subsequence, return \`0\`.

A subsequence of a string is formed by deleting some (or no) characters without changing
the order of the remaining characters. A common subsequence of two strings is a subsequence
that appears in both strings.`,
    examples: [
      {
        input: 'text1 = "abcde", text2 = "ace"',
        output: '3',
      },
      {
        input: 'text1 = "abc", text2 = "def"',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= len(text1), len(text2) <= 1000`',
      'Strings consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        # Return the length of the longest common subsequence.
        pass
`,
    },
    methodName: 'longestCommonSubsequence',
    argKeys: ['text1', 'text2'],
    defaultTests: [
      { label: 'Classic', inputJson: '{"text1":"abcde","text2":"ace"}', expectedJson: '3' },
      { label: 'Disjoint',inputJson: '{"text1":"abc","text2":"def"}',   expectedJson: '0' },
      { label: 'Same',    inputJson: '{"text1":"abc","text2":"abc"}',   expectedJson: '3' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'If the current characters match, advance both pointers without cost. Otherwise, try advancing text1 only, text2 only, and take the max + 0 or + 1 accordingly.',
        code: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        memo = {}
        def dp(i, j):
            if i == len(text1) or j == len(text2):
                return 0
            if (i, j) in memo:
                return memo[(i, j)]
            if text1[i] == text2[j]:
                memo[(i, j)] = 1 + dp(i + 1, j + 1)
            else:
                memo[(i, j)] = max(dp(i + 1, j), dp(i, j + 1))
            return memo[(i, j)]
        return dp(0, 0)
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Fill a 2-D table where dp[i][j] is the LCS length of text1[:i] and text2[:j]. If characters match, extend the diagonal; otherwise take the max of skipping one character from either string.',
        code: `class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        m, n = len(text1), len(text2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if text1[i - 1] == text2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + 1
                else:
                    dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
        return dp[m][n]
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Edit Distance (LC #72) ────────────────────────────────────────────────
  {
    slug: 'edit-distance',
    lcNumber: 72,
    title: 'Edit Distance',
    difficulty: 'Medium',
    pattern: 'String DP',
    tags: ['dp', 'string'],
    descriptionMd: `Given two strings \`word1\` and \`word2\`, return the **minimum number of
operations** required to convert \`word1\` into \`word2\`. The allowed operations are:
insert a character, delete a character, or replace a character.`,
    examples: [
      {
        input: 'word1 = "horse", word2 = "ros"',
        output: '3',
      },
      {
        input: 'word1 = "", word2 = "abc"',
        output: '3',
      },
    ],
    constraints: [
      '`0 <= len(word1), len(word2) <= 500`',
      'Strings consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        # Return the Levenshtein distance between word1 and word2.
        pass
`,
    },
    methodName: 'minDistance',
    argKeys: ['word1', 'word2'],
    defaultTests: [
      { label: 'Three edits', inputJson: '{"word1":"horse","word2":"ros"}', expectedJson: '3' },
      { label: 'Empty left',  inputJson: '{"word1":"","word2":"abc"}',      expectedJson: '3' },
      { label: 'Same',        inputJson: '{"word1":"abc","word2":"abc"}',   expectedJson: '0' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'At each pair of indices (i, j), try inserting, deleting, or replacing a character. If characters match, no operation is needed. Memoize to avoid exponential blowup.',
        code: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        memo = {}
        def dp(i, j):
            if i == 0:
                return j
            if j == 0:
                return i
            if (i, j) in memo:
                return memo[(i, j)]
            if word1[i - 1] == word2[j - 1]:
                memo[(i, j)] = dp(i - 1, j - 1)
            else:
                memo[(i, j)] = 1 + min(dp(i - 1, j - 1), dp(i - 1, j), dp(i, j - 1))
            return memo[(i, j)]
        return dp(len(word1), len(word2))
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Fill a 2-D table where dp[i][j] is the edit distance between word1[:i] and word2[:j]. If characters match, copy the diagonal. Otherwise, take 1 + min of replace, delete, or insert.',
        code: `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = i
        for j in range(n + 1):
            dp[0][j] = j
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
                else:
                    dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
        return dp[m][n]
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Interleaving String (LC #97) ──────────────────────────────────────────
  {
    slug: 'interleaving-string',
    lcNumber: 97,
    title: 'Interleaving String',
    difficulty: 'Medium',
    pattern: 'String DP',
    tags: ['dp', 'string'],
    descriptionMd: `Given three strings \`s1\`, \`s2\`, and \`s3\`, return \`True\` if \`s3\` is formed by
**interleaving** \`s1\` and \`s2\`. An interleaving of two strings preserves the left-to-right
order of characters from each of them — every character of \`s1\` and \`s2\` appears in
\`s3\` exactly once, and the relative order within each source string is preserved.`,
    examples: [
      {
        input: 's1 = "ab", s2 = "cd", s3 = "acbd"',
        output: 'True',
      },
      {
        input: 's1 = "a", s2 = "b", s3 = "ab"',
        output: 'True',
      },
      {
        input: 's1 = "a", s2 = "b", s3 = "abc"',
        output: 'False',
      },
    ],
    constraints: [
      '`0 <= len(s1), len(s2) <= 100`',
      '`0 <= len(s3) <= 200`',
    ],
    starterCode: {
      python: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        # Return True if s3 is an interleaving of s1 and s2.
        pass
`,
    },
    methodName: 'isInterleave',
    argKeys: ['s1', 's2', 's3'],
    defaultTests: [
      { label: 'Valid',       inputJson: '{"s1":"ab","s2":"cd","s3":"acbd"}', expectedJson: 'true'  },
      { label: 'Trivial',     inputJson: '{"s1":"a","s2":"b","s3":"ab"}',     expectedJson: 'true'  },
      { label: 'Wrong length',inputJson: '{"s1":"a","s2":"b","s3":"abc"}',    expectedJson: 'false' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'At position k = i + j in s3, either the next character comes from s1[i] or s2[j]. Try both options recursively with memoization.',
        code: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        if len(s1) + len(s2) != len(s3):
            return False
        memo = {}
        def dp(i, j):
            if i == len(s1) and j == len(s2):
                return True
            if (i, j) in memo:
                return memo[(i, j)]
            k = i + j
            res = False
            if i < len(s1) and s1[i] == s3[k]:
                res = dp(i + 1, j)
            if not res and j < len(s2) and s2[j] == s3[k]:
                res = dp(i, j + 1)
            memo[(i, j)] = res
            return res
        return dp(0, 0)
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Build a 2-D boolean table where dp[i][j] is True if s3[:i+j] can be formed by interleaving s1[:i] and s2[:j]. Check if the next character of s3 can come from either s1 or s2.',
        code: `class Solution:
    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:
        if len(s1) + len(s2) != len(s3):
            return False
        m, n = len(s1), len(s2)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for i in range(m + 1):
            for j in range(n + 1):
                k = i + j
                if i > 0 and dp[i - 1][j] and s1[i - 1] == s3[k - 1]:
                    dp[i][j] = True
                if j > 0 and dp[i][j - 1] and s2[j - 1] == s3[k - 1]:
                    dp[i][j] = True
        return dp[m][n]
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Target Sum (LC #494) ──────────────────────────────────────────────────
  {
    slug: 'target-sum',
    lcNumber: 494,
    title: 'Target Sum',
    difficulty: 'Medium',
    pattern: 'Knapsack',
    tags: ['dp'],
    descriptionMd: `Given an integer array \`nums\` and an integer \`target\`, you may prefix each
number with either \`'+'\` or \`'-'\` and then concatenate all the numbers into an
expression. Return the **number of distinct ways** to assign signs so that the expression
evaluates to \`target\`.`,
    examples: [
      {
        input: 'nums = [1, 1, 1, 1, 1], target = 3',
        output: '5',
      },
      {
        input: 'nums = [1], target = 1',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 20`',
      '`0 <= nums[i] <= 1000`',
      '`-1000 <= target <= 1000`',
    ],
    starterCode: {
      python: `class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        # Return the count of +/- assignments whose total equals target.
        pass
`,
    },
    methodName: 'findTargetSumWays',
    argKeys: ['nums', 'target'],
    defaultTests: [
      { label: 'Five ones',  inputJson: '{"nums":[1,1,1,1,1],"target":3}', expectedJson: '5' },
      { label: 'Single',     inputJson: '{"nums":[1],"target":1}',          expectedJson: '1' },
      { label: 'Impossible', inputJson: '{"nums":[1,2],"target":10}',       expectedJson: '0' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Brute Force (Backtracking)',
        intuition: 'For each number, assign either + or -. Recurse through all 2^n assignments and count those that sum to target.',
        code: `class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        def backtrack(i, total):
            if i == len(nums):
                return 1 if total == target else 0
            return backtrack(i + 1, total + nums[i]) + backtrack(i + 1, total - nums[i])
        return backtrack(0, 0)
`,
        timeComplexity: 'O(2^n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Subset Sum DP',
        intuition: 'Reduce to subset sum: find subsets summing to P = (target + sum) / 2. Use a 1-D knapsack DP iterating coins in reverse to avoid double-counting.',
        code: `class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        total = sum(nums)
        if abs(target) > total or (total + target) % 2 != 0:
            return 0
        p = (total + target) // 2
        if p < 0:
            return 0
        dp = [0] * (p + 1)
        dp[0] = 1
        for v in nums:
            for s in range(p, v - 1, -1):
                dp[s] += dp[s - v]
        return dp[p]
`,
        timeComplexity: 'O(n * P) where P = (sum + target) / 2',
        spaceComplexity: 'O(P)',
      },
    ],
  },

  // ─── Partition Equal Subset Sum (LC #416) ─────────────────────────────────
  {
    slug: 'partition-equal-subset-sum',
    lcNumber: 416,
    title: 'Partition Equal Subset Sum',
    difficulty: 'Medium',
    pattern: 'Knapsack',
    tags: ['dp'],
    descriptionMd: `Given an integer array \`nums\`, return \`True\` if you can partition the values
into two subsets whose elements have **equal sum**, and \`False\` otherwise.`,
    examples: [
      {
        input: 'nums = [1, 5, 11, 5]',
        output: 'True',
        explanation: 'The array can be split into [1, 5, 5] and [11], both summing to 11.',
      },
      {
        input: 'nums = [1, 2, 3, 5]',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 200`',
      '`1 <= nums[i] <= 100`',
    ],
    starterCode: {
      python: `class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        # Return True if nums can be split into two subsets with equal sum.
        pass
`,
    },
    methodName: 'canPartition',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Partitionable',    inputJson: '{"nums":[1,5,11,5]}', expectedJson: 'true'  },
      { label: 'Odd total',        inputJson: '{"nums":[1,2,3,5]}',   expectedJson: 'false' },
      { label: 'Two equal values', inputJson: '{"nums":[5,5]}',        expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Subset Sum DP',
        intuition: 'If the total sum is odd, partitioning is impossible. Otherwise, find whether a subset sums to total/2 using a 1-D boolean knapsack DP iterated in reverse.',
        code: `class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        total = sum(nums)
        if total % 2 != 0:
            return False
        target = total // 2
        dp = [False] * (target + 1)
        dp[0] = True
        for v in nums:
            for s in range(target, v - 1, -1):
                if dp[s - v]:
                    dp[s] = True
        return dp[target]
`,
        timeComplexity: 'O(n * target)',
        spaceComplexity: 'O(target)',
      },
    ],
  },

  // ─── Coin Change II (LC #518) ──────────────────────────────────────────────
  {
    slug: 'coin-change-ii',
    lcNumber: 518,
    title: 'Coin Change II',
    difficulty: 'Medium',
    pattern: 'Knapsack',
    tags: ['dp'],
    descriptionMd: `Given an integer \`amount\` and a list of \`coins\`, return the number of distinct
**combinations** (not permutations) of coins that sum to \`amount\`. Each coin denomination
may be used an unlimited number of times. Two combinations are considered the same if they
use the same multiset of coins, regardless of order.

If it is impossible to make \`amount\` with the given coins, return \`0\`.`,
    examples: [
      {
        input: 'amount = 5, coins = [1, 2, 5]',
        output: '4',
        explanation: 'The four combinations are 5, 2+2+1, 2+1+1+1, and 1+1+1+1+1.',
      },
      {
        input: 'amount = 3, coins = [2]',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= len(coins) <= 300`',
      '`1 <= coins[i] <= 5000`',
      '`0 <= amount <= 5000`',
    ],
    starterCode: {
      python: `class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        # Return the number of distinct coin combinations summing to amount.
        pass
`,
    },
    methodName: 'change',
    argKeys: ['amount', 'coins'],
    defaultTests: [
      { label: 'Four combos',  inputJson: '{"amount":5,"coins":[1,2,5]}', expectedJson: '4' },
      { label: 'Impossible',   inputJson: '{"amount":3,"coins":[2]}',      expectedJson: '0' },
      { label: 'Zero amount',  inputJson: '{"amount":0,"coins":[1]}',      expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Unbounded Knapsack DP',
        intuition: 'Iterate coins in the outer loop and amounts in the inner loop. For each coin c, dp[i] += dp[i - c]. Looping coins outer-first counts combinations, not permutations.',
        code: `class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        dp = [0] * (amount + 1)
        dp[0] = 1
        for c in coins:
            for s in range(c, amount + 1):
                dp[s] += dp[s - c]
        return dp[amount]
`,
        timeComplexity: 'O(amount * len(coins))',
        spaceComplexity: 'O(amount)',
      },
    ],
  },

  // ─── Distinct Subsequences (LC #115) ───────────────────────────────────────
  {
    slug: 'distinct-subsequences',
    lcNumber: 115,
    title: 'Distinct Subsequences',
    difficulty: 'Hard',
    pattern: 'String DP',
    tags: ['dp', 'string'],
    descriptionMd: `Given two strings \`s\` and \`t\`, return the number of **distinct subsequences** of
\`s\` that equal \`t\`. A subsequence is formed by deleting zero or more characters from
\`s\` without changing the order of the remaining characters. The answer is guaranteed to
fit in a 32-bit signed integer.`,
    examples: [
      {
        input: 's = "rabbbit", t = "rabbit"',
        output: '3',
      },
      {
        input: 's = "abc", t = "abcd"',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= len(s), len(t) <= 1000`',
      'Strings consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        # Return the number of distinct subsequences of s that equal t.
        pass
`,
    },
    methodName: 'numDistinct',
    argKeys: ['s', 't'],
    defaultTests: [
      { label: 'Classic',    inputJson: '{"s":"rabbbit","t":"rabbit"}', expectedJson: '3' },
      { label: 't longer',   inputJson: '{"s":"abc","t":"abcd"}',        expectedJson: '0' },
      { label: 'Same',       inputJson: '{"s":"abc","t":"abc"}',         expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'If s[i] == t[j], we can either match this character (use dp[i-1][j-1]) or skip it in s (use dp[i-1][j]). If they differ, we can only skip the character in s.',
        code: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        memo = {}
        def dp(i, j):
            if j == 0:
                return 1
            if i == 0:
                return 0
            if (i, j) in memo:
                return memo[(i, j)]
            res = dp(i - 1, j)
            if s[i - 1] == t[j - 1]:
                res += dp(i - 1, j - 1)
            memo[(i, j)] = res
            return res
        return dp(len(s), len(t))
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Fill a 2-D table where dp[i][j] counts distinct subsequences of s[:i] equalling t[:j]. If characters match, add dp[i-1][j-1] (use the match) to dp[i-1][j] (skip it). Otherwise just carry dp[i-1][j] forward.',
        code: `class Solution:
    def numDistinct(self, s: str, t: str) -> int:
        m, n = len(s), len(t)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(m + 1):
            dp[i][0] = 1
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if s[i - 1] == t[j - 1]:
                    dp[i][j] = dp[i - 1][j - 1] + dp[i - 1][j]
                else:
                    dp[i][j] = dp[i - 1][j]
        return dp[m][n]
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Regular Expression Matching (LC #10) ──────────────────────────────────
  {
    slug: 'regular-expression-matching',
    lcNumber: 10,
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    pattern: 'String DP',
    tags: ['dp', 'string'],
    descriptionMd: `Given an input string \`s\` and a pattern \`p\`, implement regular expression
matching with support for:

- \`'.'\` — matches any single character.
- \`'*'\` — matches **zero or more** of the preceding element.

The match must cover the **entire** input string, not a partial match. Return \`True\` if
\`p\` matches \`s\`.`,
    examples: [
      {
        input: 's = "aa", p = "a*"',
        output: 'True',
      },
      {
        input: 's = "ab", p = ".*"',
        output: 'True',
      },
      {
        input: 's = "mississippi", p = "mis*is*p*."',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(s), len(p) <= 20`',
      '`s` contains only lowercase English letters.',
      '`p` contains only lowercase letters, `.`, and `*`.',
      'It is guaranteed `*` is always preceded by a valid character.',
    ],
    starterCode: {
      python: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        # Return True if the pattern p matches the entire string s.
        pass
`,
    },
    methodName: 'isMatch',
    argKeys: ['s', 'p'],
    defaultTests: [
      { label: 'Star',       inputJson: '{"s":"aa","p":"a*"}',                       expectedJson: 'true'  },
      { label: 'Dot star',   inputJson: '{"s":"ab","p":".*"}',                       expectedJson: 'true'  },
      { label: 'Non-match',  inputJson: '{"s":"mississippi","p":"mis*is*p*."}',       expectedJson: 'false' },
      { label: 'Empty star', inputJson: '{"s":"","p":"a*"}',                          expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Memoization',
        intuition: 'If the pattern character is followed by *, either skip the x* pair (zero matches) or consume one character from s if it matches. Otherwise, match the current character directly.',
        code: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        memo = {}
        def dp(i, j):
            if (i, j) in memo:
                return memo[(i, j)]
            if j == len(p):
                return i == len(s)
            match = i < len(s) and (p[j] == '.' or p[j] == s[i])
            if j + 1 < len(p) and p[j + 1] == '*':
                res = dp(i, j + 2) or (match and dp(i + 1, j))
            else:
                res = match and dp(i + 1, j + 1)
            memo[(i, j)] = res
            return res
        return dp(0, 0)
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
      {
        approach: 'Bottom-Up DP',
        intuition: 'Build a 2-D boolean table where dp[i][j] is True if s[:i] matches p[:j]. Handle * by either skipping the pattern pair (dp[i][j-2]) or consuming a character if it matches.',
        code: `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        m, n = len(s), len(p)
        dp = [[False] * (n + 1) for _ in range(m + 1)]
        dp[0][0] = True
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[0][j] = dp[0][j - 2]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                if p[j - 1] == '*':
                    dp[i][j] = dp[i][j - 2]
                    if p[j - 2] == '.' or p[j - 2] == s[i - 1]:
                        dp[i][j] = dp[i][j] or dp[i - 1][j]
                elif p[j - 1] == '.' or p[j - 1] == s[i - 1]:
                    dp[i][j] = dp[i - 1][j - 1]
        return dp[m][n]
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Is Subsequence (LC #392) ───────────────────────────────────────────────
  {
    slug: 'is-subsequence',
    lcNumber: 392,
    title: 'Is Subsequence',
    difficulty: 'Easy',
    pattern: 'Two Pointers',
    tags: ['string', 'two-pointers', 'dp'],
    descriptionMd: `Given two strings \`s\` and \`t\`, return \`True\` if \`s\` is a
**subsequence** of \`t\`, and \`False\` otherwise.

A **subsequence** of a string is formed by deleting zero or more characters from the
string **without changing the relative order** of the remaining characters. For example,
\`"ace"\` is a subsequence of \`"abcde"\`, while \`"aec"\` is not.`,
    examples: [
      {
        input: 's = "abc", t = "ahbgdc"',
        output: 'True',
      },
      {
        input: 's = "axc", t = "ahbgdc"',
        output: 'False',
      },
    ],
    constraints: [
      '`0 <= len(s) <= 100`',
      '`0 <= len(t) <= 10^4`',
      '`s` and `t` consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        # Return True if s is a subsequence of t.
        pass
`,
    },
    methodName: 'isSubsequence',
    argKeys: ['s', 't'],
    defaultTests: [
      { label: 'Simple match',    inputJson: '{"s":"abc","t":"ahbgdc"}', expectedJson: 'true'  },
      { label: 'Wrong order',     inputJson: '{"s":"axc","t":"ahbgdc"}', expectedJson: 'false' },
      { label: 'Empty s',         inputJson: '{"s":"","t":"abc"}',       expectedJson: 'true'  },
      { label: 'Empty t',         inputJson: '{"s":"a","t":""}',         expectedJson: 'false' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Two Pointers',
        intuition: 'Walk a pointer j through t. Every time t[j] equals the current character of s (tracked by pointer i), advance i. If i reaches the end of s, we matched every character in order.',
        code: `class Solution:
    def isSubsequence(self, s: str, t: str) -> bool:
        i = 0
        for ch in t:
            if i < len(s) and s[i] == ch:
                i += 1
        return i == len(s)`,
        timeComplexity: 'O(len(t))',
        spaceComplexity: 'O(1)',
      },
    ],
  },
];
