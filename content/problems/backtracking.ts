// ─── Backtracking problems ──────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const BACKTRACKING_PROBLEMS: ProblemContent[] = [
  // ─── Subsets (LC #78) ──────────────────────────────────────────────────────
  {
    slug: 'subsets',
    lcNumber: 78,
    title: 'Subsets',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking'],
    descriptionMd: `Given an array of **distinct** integers \`nums\`, return every possible subset (the
power set). Each inner subset must be in the same order as it appears in \`nums\`.

> To make grading deterministic, please **sort the outer list of subsets lexicographically**
> before returning.

The standard backtracking template walks \`nums\` and at each step either includes or
excludes the current element.`,
    examples: [
      {
        input: 'nums = [1, 2, 3]',
        output: '[[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]',
      },
      {
        input: 'nums = [9]',
        output: '[[], [9]]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10`',
      '`-10 <= nums[i] <= 10`',
      'All values in `nums` are distinct.',
    ],
    starterCode: {
      python: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        # Return every subset of nums; outer list sorted lexicographically.
        pass
`,
    },
    methodName: 'subsets',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Three values', inputJson: '{"nums":[1,2,3]}', expectedJson: '[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]' },
      { label: 'Single',       inputJson: '{"nums":[9]}',     expectedJson: '[[],[9]]' },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking',
        intuition: 'At each index, decide to either include or exclude the current element, then recurse. Collect the current subset when you reach the end of the array.',
        code: `class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        out = []
        cur = []

        def backtrack(i: int):
            if i == len(nums):
                out.append(list(cur))
                return
            backtrack(i + 1)
            cur.append(nums[i])
            backtrack(i + 1)
            cur.pop()

        backtrack(0)
        out.sort()
        return out`,
        timeComplexity: 'O(n * 2^n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Subsets II (LC #90) ───────────────────────────────────────────────────
  {
    slug: 'subsets-ii',
    lcNumber: 90,
    title: 'Subsets II',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking'],
    descriptionMd: `Given an integer array \`nums\` that **may contain duplicates**, return all possible
subsets (the power set) **without any duplicate subsets**.

> Please **sort \`nums\` first** so inner subsets are in non-decreasing order, and
> **sort the outer list lexicographically** before returning.

The idiomatic approach sorts \`nums\` and then backtracks, skipping a value \`nums[i]\` if
\`i > start and nums[i] == nums[i - 1]\`.`,
    examples: [
      {
        input: 'nums = [1, 2, 2]',
        output: '[[], [1], [1,2], [1,2,2], [2], [2,2]]',
      },
      {
        input: 'nums = [4, 4, 4]',
        output: '[[], [4], [4,4], [4,4,4]]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10`',
      '`-10 <= nums[i] <= 10`',
    ],
    starterCode: {
      python: `class Solution:
    def subsetsWithDup(self, nums: list[int]) -> list[list[int]]:
        # Return all unique subsets, with inner lists sorted and outer list sorted.
        pass
`,
    },
    methodName: 'subsetsWithDup',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Has dup',  inputJson: '{"nums":[1,2,2]}', expectedJson: '[[],[1],[1,2],[1,2,2],[2],[2,2]]' },
      { label: 'All same', inputJson: '{"nums":[4,4,4]}', expectedJson: '[[],[4],[4,4],[4,4,4]]'            },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking with Duplicate Skipping',
        intuition: 'Sort the array first, then use the standard subset backtracking template but skip nums[i] when it equals nums[i-1] and i > start. This avoids generating duplicate subsets.',
        code: `class Solution:
    def subsetsWithDup(self, nums: list[int]) -> list[list[int]]:
        nums = sorted(nums)
        out = []
        cur = []

        def backtrack(start: int):
            out.append(list(cur))
            for i in range(start, len(nums)):
                if i > start and nums[i] == nums[i - 1]:
                    continue
                cur.append(nums[i])
                backtrack(i + 1)
                cur.pop()

        backtrack(0)
        out.sort()
        return out`,
        timeComplexity: 'O(n * 2^n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Permutations (LC #46) ─────────────────────────────────────────────────
  {
    slug: 'permutations',
    lcNumber: 46,
    title: 'Permutations',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking'],
    descriptionMd: `Given an array of **distinct** integers \`nums\`, return **all** their distinct
permutations.

> Please **sort the outer list of permutations lexicographically** before returning.

The canonical solution swaps each remaining element into the current position and recurses,
or equivalently maintains a "used" set and picks each unused element in turn.`,
    examples: [
      {
        input: 'nums = [7, 8]',
        output: '[[7, 8], [8, 7]]',
      },
      {
        input: 'nums = [5]',
        output: '[[5]]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 6`',
      '`-10 <= nums[i] <= 10`',
      'All values in `nums` are distinct.',
    ],
    starterCode: {
      python: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        # Return all permutations of nums, sorted lexicographically.
        pass
`,
    },
    methodName: 'permute',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Two values',   inputJson: '{"nums":[7,8]}',   expectedJson: '[[7,8],[8,7]]' },
      { label: 'Three values', inputJson: '{"nums":[1,2,3]}', expectedJson: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
      { label: 'Single',       inputJson: '{"nums":[5]}',     expectedJson: '[[5]]' },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking',
        intuition: 'Build each permutation by picking one unused element at a time. For each recursive call, try every remaining element, append it, recurse, then remove it to try the next.',
        code: `class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        out = []

        def backtrack(cur: list[int], remaining: list[int]):
            if not remaining:
                out.append(list(cur))
                return
            for i in range(len(remaining)):
                cur.append(remaining[i])
                backtrack(cur, remaining[:i] + remaining[i + 1:])
                cur.pop()

        backtrack([], nums)
        out.sort()
        return out`,
        timeComplexity: 'O(n! * n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Permutations II (LC #47) ──────────────────────────────────────────────
  {
    slug: 'permutations-ii',
    lcNumber: 47,
    title: 'Permutations II',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking'],
    descriptionMd: `Given an integer array \`nums\` that **may contain duplicates**, return all possible
**unique** permutations.

> Please **sort the outer list of permutations lexicographically** before returning.

The trick is to sort \`nums\`, use a "used" boolean array, and skip a candidate
\`nums[i]\` when \`i > 0\` and \`nums[i] == nums[i - 1]\` **and** \`not used[i - 1]\` — this
avoids picking the same value in the same position via a different "copy".`,
    examples: [
      {
        input: 'nums = [1, 1, 2]',
        output: '[[1, 1, 2], [1, 2, 1], [2, 1, 1]]',
      },
      {
        input: 'nums = [1, 2]',
        output: '[[1, 2], [2, 1]]',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 8`',
      '`-10 <= nums[i] <= 10`',
    ],
    starterCode: {
      python: `class Solution:
    def permuteUnique(self, nums: list[int]) -> list[list[int]]:
        # Return all unique permutations of nums, sorted lexicographically.
        pass
`,
    },
    methodName: 'permuteUnique',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'With dup',  inputJson: '{"nums":[1,1,2]}', expectedJson: '[[1,1,2],[1,2,1],[2,1,1]]' },
      { label: 'Distinct',  inputJson: '{"nums":[1,2]}',   expectedJson: '[[1,2],[2,1]]'             },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking with Duplicate Skipping',
        intuition: 'Sort nums, then use a used-array to track which elements are placed. Skip nums[i] when it equals nums[i-1] and used[i-1] is false -- this prevents placing the same value at the same position via a different copy.',
        code: `class Solution:
    def permuteUnique(self, nums: list[int]) -> list[list[int]]:
        nums = sorted(nums)
        out = []
        used = [False] * len(nums)
        cur = []

        def backtrack():
            if len(cur) == len(nums):
                out.append(list(cur))
                return
            for i in range(len(nums)):
                if used[i]:
                    continue
                if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                    continue
                used[i] = True
                cur.append(nums[i])
                backtrack()
                cur.pop()
                used[i] = False

        backtrack()
        out.sort()
        return out`,
        timeComplexity: 'O(n! * n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Combinations (LC #77) ─────────────────────────────────────────────────
  {
    slug: 'combinations',
    lcNumber: 77,
    title: 'Combinations',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking'],
    descriptionMd: `Given two integers \`n\` and \`k\`, return every possible combination of exactly
\`k\` distinct numbers chosen from the range \`[1, n]\`.

> Please put each inner combination in ascending order and **sort the outer list
> lexicographically** before returning.

The standard backtracking template chooses a starting index and recurses over larger
indices, only allowing values larger than the one just picked.`,
    examples: [
      {
        input: 'n = 4, k = 2',
        output: '[[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]',
      },
      {
        input: 'n = 3, k = 3',
        output: '[[1,2,3]]',
      },
    ],
    constraints: [
      '`1 <= k <= n <= 20`',
    ],
    starterCode: {
      python: `class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        # Return all k-length combinations of [1, n], sorted lexicographically.
        pass
`,
    },
    methodName: 'combine',
    argKeys: ['n', 'k'],
    defaultTests: [
      { label: 'C(4,2)', inputJson: '{"n":4,"k":2}', expectedJson: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]' },
      { label: 'C(3,3)', inputJson: '{"n":3,"k":3}', expectedJson: '[[1,2,3]]' },
      { label: 'C(1,1)', inputJson: '{"n":1,"k":1}', expectedJson: '[[1]]'    },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking',
        intuition: 'Iterate from a start index through n, appending each value and recursing with start = i+1 to avoid duplicates. Stop when the current list reaches length k.',
        code: `class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        out = []
        cur = []

        def backtrack(start: int):
            if len(cur) == k:
                out.append(list(cur))
                return
            for i in range(start, n + 1):
                cur.append(i)
                backtrack(i + 1)
                cur.pop()

        backtrack(1)
        out.sort()
        return out`,
        timeComplexity: 'O(k * C(n, k))',
        spaceComplexity: 'O(k)',
      },
    ],
  },

  // ─── Combination Sum (LC #39) ──────────────────────────────────────────────
  {
    slug: 'combination-sum',
    lcNumber: 39,
    title: 'Combination Sum',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking'],
    descriptionMd: `Given an array of **distinct** positive integers \`candidates\` and an integer
\`target\`, return every unique combination of values from \`candidates\` whose sum equals
\`target\`. Each candidate may be used **an unlimited number of times**.

> Please sort each inner combination in non-decreasing order and **sort the outer list
> lexicographically** before returning.`,
    examples: [
      {
        input: 'candidates = [2, 3], target = 6',
        output: '[[2, 2, 2], [3, 3]]',
      },
      {
        input: 'candidates = [5], target = 6',
        output: '[]',
      },
    ],
    constraints: [
      '`1 <= len(candidates) <= 30`',
      '`1 <= candidates[i] <= 200`',
      '`1 <= target <= 500`',
      'All values in `candidates` are distinct.',
    ],
    starterCode: {
      python: `class Solution:
    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:
        # Return all combinations summing to target (values may repeat).
        pass
`,
    },
    methodName: 'combinationSum',
    argKeys: ['candidates', 'target'],
    defaultTests: [
      { label: 'Two answers', inputJson: '{"candidates":[2,3],"target":6}', expectedJson: '[[2,2,2],[3,3]]' },
      { label: 'Impossible',  inputJson: '{"candidates":[5],"target":6}',   expectedJson: '[]'              },
      { label: 'Ones',        inputJson: '{"candidates":[1],"target":3}',   expectedJson: '[[1,1,1]]'       },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking',
        intuition: 'Sort candidates, then backtrack from a start index. At each step, try each candidate (allowing reuse by recursing with the same index i). Prune early when the candidate exceeds the remaining target.',
        code: `class Solution:
    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:
        candidates = sorted(candidates)
        out = []
        cur = []

        def backtrack(start: int, remaining: int):
            if remaining == 0:
                out.append(list(cur))
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break
                cur.append(candidates[i])
                backtrack(i, remaining - candidates[i])
                cur.pop()

        backtrack(0, target)
        out.sort()
        return out`,
        timeComplexity: 'O(n^(target/min))',
        spaceComplexity: 'O(target/min)',
      },
    ],
  },

  // ─── Combination Sum II (LC #40) ───────────────────────────────────────────
  {
    slug: 'combination-sum-ii',
    lcNumber: 40,
    title: 'Combination Sum II',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking'],
    descriptionMd: `Given a collection of candidate numbers \`candidates\` (which **may contain
duplicates**) and a target number \`target\`, return every unique combination of values in
\`candidates\` whose sum equals \`target\`. Each number in \`candidates\` may be used
**at most once** per combination.

> Please sort each inner combination in non-decreasing order and **sort the outer list
> lexicographically** before returning.`,
    examples: [
      {
        input: 'candidates = [2, 5, 2, 1, 2], target = 5',
        output: '[[1, 2, 2], [5]]',
      },
      {
        input: 'candidates = [1, 1], target = 3',
        output: '[]',
      },
    ],
    constraints: [
      '`1 <= len(candidates) <= 100`',
      '`1 <= candidates[i] <= 50`',
      '`1 <= target <= 30`',
    ],
    starterCode: {
      python: `class Solution:
    def combinationSum2(self, candidates: list[int], target: int) -> list[list[int]]:
        # Return all unique combinations summing to target, each number used at most once.
        pass
`,
    },
    methodName: 'combinationSum2',
    argKeys: ['candidates', 'target'],
    defaultTests: [
      { label: 'With dup',  inputJson: '{"candidates":[2,5,2,1,2],"target":5}', expectedJson: '[[1,2,2],[5]]' },
      { label: 'No match',  inputJson: '{"candidates":[1,1],"target":3}',       expectedJson: '[]'            },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking with Duplicate Skipping',
        intuition: 'Sort candidates, then backtrack similarly to Combination Sum but advance to i+1 (each element used at most once). Skip candidates[i] when it equals candidates[i-1] and i > start to avoid duplicate combinations.',
        code: `class Solution:
    def combinationSum2(self, candidates: list[int], target: int) -> list[list[int]]:
        candidates = sorted(candidates)
        out = []
        cur = []

        def backtrack(start: int, remaining: int):
            if remaining == 0:
                out.append(list(cur))
                return
            for i in range(start, len(candidates)):
                if i > start and candidates[i] == candidates[i - 1]:
                    continue
                if candidates[i] > remaining:
                    break
                cur.append(candidates[i])
                backtrack(i + 1, remaining - candidates[i])
                cur.pop()

        backtrack(0, target)
        out.sort()
        return out`,
        timeComplexity: 'O(2^n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Palindrome Partitioning (LC #131) ─────────────────────────────────────
  {
    slug: 'palindrome-partitioning',
    lcNumber: 131,
    title: 'Palindrome Partitioning',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking', 'string'],
    descriptionMd: `Given a lowercase string \`s\`, partition \`s\` into contiguous substrings such that
**every substring is a palindrome**. Return a list of every valid partitioning.

> Please **sort the outer list lexicographically** before returning. Inner lists are in
> left-to-right order as they appear in \`s\`.

A DFS over starting positions plus an inline palindrome check is the idiomatic solution.`,
    examples: [
      {
        input: 's = "abba"',
        output: '[["a","b","b","a"], ["a","bb","a"], ["abba"]]',
      },
      {
        input: 's = "a"',
        output: '[["a"]]',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 16`',
      '`s` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def partition(self, s: str) -> list[list[str]]:
        # Return every palindrome partitioning of s, outer list sorted lexicographically.
        pass
`,
    },
    methodName: 'partition',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Three partitions', inputJson: '{"s":"abba"}', expectedJson: '[["a","b","b","a"],["a","bb","a"],["abba"]]' },
      { label: 'Single char',      inputJson: '{"s":"a"}',    expectedJson: '[["a"]]' },
      { label: 'Non-palindrome pair', inputJson: '{"s":"ab"}', expectedJson: '[["a","b"]]' },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking',
        intuition: 'DFS over starting positions in the string. At each position, try every substring ending beyond it; if the substring is a palindrome, include it and recurse on the remainder.',
        code: `class Solution:
    def partition(self, s: str) -> list[list[str]]:
        out = []
        cur = []

        def is_pal(a: str) -> bool:
            return a == a[::-1]

        def backtrack(start: int):
            if start == len(s):
                out.append(list(cur))
                return
            for end in range(start + 1, len(s) + 1):
                piece = s[start:end]
                if is_pal(piece):
                    cur.append(piece)
                    backtrack(end)
                    cur.pop()

        backtrack(0)
        out.sort()
        return out`,
        timeComplexity: 'O(n * 2^n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Letter Combinations of a Phone Number (LC #17) ───────────────────────
  {
    slug: 'letter-combinations-of-a-phone-number',
    lcNumber: 17,
    title: 'Letter Combinations of a Phone Number',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking', 'string'],
    descriptionMd: `Given a string \`digits\` containing the characters \`'2'\` through \`'9'\`
inclusive, return every possible letter combination that the number could spell on an
old-school phone keypad:

- \`2 → abc\`, \`3 → def\`, \`4 → ghi\`, \`5 → jkl\`, \`6 → mno\`,
- \`7 → pqrs\`, \`8 → tuv\`, \`9 → wxyz\`

Return the empty list if \`digits\` is empty.

> Please **sort the output list lexicographically** before returning.`,
    examples: [
      {
        input: 'digits = "5"',
        output: '["j", "k", "l"]',
      },
      {
        input: 'digits = ""',
        output: '[]',
      },
    ],
    constraints: [
      '`0 <= len(digits) <= 4`',
      '`digits` consists of digits from `2` to `9` only.',
    ],
    starterCode: {
      python: `class Solution:
    def letterCombinations(self, digits: str) -> list[str]:
        # Return all letter combinations; sort lexicographically.
        pass
`,
    },
    methodName: 'letterCombinations',
    argKeys: ['digits'],
    defaultTests: [
      { label: 'Single digit',  inputJson: '{"digits":"5"}', expectedJson: '["j","k","l"]' },
      { label: 'Empty',         inputJson: '{"digits":""}',  expectedJson: '[]'             },
      {
        label: 'Two digits',
        inputJson: '{"digits":"23"}',
        expectedJson: '["ad","ae","af","bd","be","bf","cd","ce","cf"]',
      },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking',
        intuition: 'Map each digit to its letters. Recursively build combinations by picking one letter for each digit and appending it to the current path.',
        code: `class Solution:
    def letterCombinations(self, digits: str) -> list[str]:
        if not digits:
            return []
        mapping = {
            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz',
        }
        out = []

        def backtrack(i: int, path: list[str]):
            if i == len(digits):
                out.append(''.join(path))
                return
            for ch in mapping[digits[i]]:
                path.append(ch)
                backtrack(i + 1, path)
                path.pop()

        backtrack(0, [])
        out.sort()
        return out`,
        timeComplexity: 'O(4^n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Word Search (LC #79) ──────────────────────────────────────────────────
  {
    slug: 'word-search',
    lcNumber: 79,
    title: 'Word Search',
    difficulty: 'Medium',
    pattern: 'Backtracking',
    tags: ['backtracking', 'matrix'],
    descriptionMd: `Given an \`m x n\` character grid \`board\` and a string \`word\`, return \`True\` if
\`word\` can be assembled by walking from cell to adjacent cell (up / down / left / right)
without reusing any cell twice. Return \`False\` otherwise.

The standard backtracking approach runs a DFS from every cell, marking visited cells in
place (e.g. overwriting with \`'#'\`) and restoring them on return.`,
    examples: [
      {
        input: 'board = [["a","b"],["c","d"]], word = "abdc"',
        output: 'True',
        explanation: 'Path a(0,0) → b(0,1) → d(1,1) → c(1,0) traces the word.',
      },
      {
        input: 'board = [["a","b"],["c","d"]], word = "abcd"',
        output: 'False',
        explanation: 'After "ab" there is no adjacent "c" to (0,1).',
      },
    ],
    constraints: [
      '`1 <= m, n <= 6`',
      '`1 <= len(word) <= 15`',
      'Cells and the word contain lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        # Return True if word can be traced on the board without reusing cells.
        pass
`,
    },
    methodName: 'exist',
    argKeys: ['board', 'word'],
    defaultTests: [
      { label: 'Found',     inputJson: '{"board":[["a","b"],["c","d"]],"word":"abdc"}', expectedJson: 'true'  },
      { label: 'Not found', inputJson: '{"board":[["a","b"],["c","d"]],"word":"abcd"}', expectedJson: 'false' },
      { label: 'Single yes',inputJson: '{"board":[["a"]],"word":"a"}',                  expectedJson: 'true'  },
      { label: 'Single no', inputJson: '{"board":[["a"]],"word":"b"}',                  expectedJson: 'false' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Backtracking (DFS)',
        intuition: 'Try every cell as a starting point. DFS along the word, marking cells as visited by overwriting with "#" and restoring on backtrack. Check bounds and character match at each step.',
        code: `class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        m = len(board)
        n = len(board[0]) if m else 0

        def dfs(r: int, c: int, i: int) -> bool:
            if i == len(word):
                return True
            if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != word[i]:
                return False
            saved = board[r][c]
            board[r][c] = '#'
            found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)
                     or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
            board[r][c] = saved
            return found

        for r in range(m):
            for c in range(n):
                if dfs(r, c, 0):
                    return True
        return False`,
        timeComplexity: 'O(m * n * 4^L) where L is word length',
        spaceComplexity: 'O(L)',
      },
    ],
  },

  // ─── N-Queens (LC #51) ─────────────────────────────────────────────────────
  {
    slug: 'n-queens',
    lcNumber: 51,
    title: 'N-Queens',
    difficulty: 'Hard',
    pattern: 'Backtracking',
    tags: ['backtracking'],
    descriptionMd: `The N-Queens puzzle asks you to place \`n\` queens on an \`n x n\` chessboard so
that no two queens attack each other (same row, same column, or same diagonal). Return **all
distinct solutions**, where each solution is a list of \`n\` strings of length \`n\`, each
containing \`'Q'\` for a queen and \`'.'\` for an empty square.

> Please **sort the outer list of solutions lexicographically** before returning.

The classic approach is a row-by-row DFS that tracks which columns and which diagonals are
already occupied by a queen.`,
    examples: [
      {
        input: 'n = 1',
        output: '[["Q"]]',
      },
      {
        input: 'n = 2',
        output: '[]',
      },
    ],
    constraints: [
      '`1 <= n <= 9`',
    ],
    starterCode: {
      python: `class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        # Return all valid N-queens placements, outer list sorted.
        pass
`,
    },
    methodName: 'solveNQueens',
    argKeys: ['n'],
    defaultTests: [
      { label: 'n = 1', inputJson: '{"n":1}', expectedJson: '[["Q"]]' },
      { label: 'n = 2', inputJson: '{"n":2}', expectedJson: '[]'      },
      { label: 'n = 3', inputJson: '{"n":3}', expectedJson: '[]'      },
      {
        label: 'n = 4',
        inputJson: '{"n":4}',
        expectedJson: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]',
      },
    ],
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Backtracking',
        intuition: 'Place queens row by row. Track occupied columns and both diagonals (r-c and r+c) with sets. For each row, try every column that is not attacked, place the queen, recurse, then undo.',
        code: `class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        out = []
        cols = set()
        diag1 = set()  # r - c
        diag2 = set()  # r + c
        queens = []

        def backtrack(r: int):
            if r == n:
                board = []
                for col in queens:
                    row = ['.'] * n
                    row[col] = 'Q'
                    board.append(''.join(row))
                out.append(board)
                return
            for c in range(n):
                if c in cols or (r - c) in diag1 or (r + c) in diag2:
                    continue
                cols.add(c)
                diag1.add(r - c)
                diag2.add(r + c)
                queens.append(c)
                backtrack(r + 1)
                queens.pop()
                cols.remove(c)
                diag1.remove(r - c)
                diag2.remove(r + c)

        backtrack(0)
        out.sort()
        return out`,
        timeComplexity: 'O(n!)',
        spaceComplexity: 'O(n^2)',
      },
    ],
  },

  // ─── Sudoku Solver (LC #37) ────────────────────────────────────────────────
  {
    slug: 'sudoku-solver',
    lcNumber: 37,
    title: 'Sudoku Solver',
    difficulty: 'Hard',
    pattern: 'Backtracking',
    tags: ['backtracking', 'matrix'],
    descriptionMd: `Given a \`9 x 9\` sudoku \`board\` (with \`'.'\` marking empty cells), fill in all
the empty cells so the resulting board satisfies the standard sudoku rules:

- Each row contains the digits \`1\`..\`9\` exactly once.
- Each column contains the digits \`1\`..\`9\` exactly once.
- Each of the nine \`3 x 3\` sub-grids contains the digits \`1\`..\`9\` exactly once.

Return the completed board. The puzzle is guaranteed to have exactly one solution.

> Note: our grader's test boards all have a unique solution. Internally LeetCode asks you to
> mutate the board in place; you can still return the (mutated) board at the end.

The classic backtracking solution walks empty cells in order, trying digits \`1\`..\`9\`,
and backtracking whenever a digit would violate one of the three constraints.`,
    examples: [
      {
        input: 'board = an almost-solved grid with one "." at (0, 0)',
        output: 'The same board with "1" at (0, 0)',
      },
    ],
    constraints: [
      '`board.length == 9`',
      '`board[i].length == 9`',
      'Each cell is either a digit `"1"`..`"9"` or `"."`.',
      'The puzzle has exactly one solution.',
    ],
    starterCode: {
      python: `class Solution:
    def solveSudoku(self, board: list[list[str]]) -> list[list[str]]:
        # Fill every "." cell to complete the sudoku, then return the board.
        pass
`,
    },
    methodName: 'solveSudoku',
    argKeys: ['board'],
    defaultTests: [
      {
        label: 'Near-solved: corner',
        inputJson: '{"board":[[".","2","3","4","5","6","7","8","9"],["4","5","6","7","8","9","1","2","3"],["7","8","9","1","2","3","4","5","6"],["2","3","4","5","6","7","8","9","1"],["5","6","7","8","9","1","2","3","4"],["8","9","1","2","3","4","5","6","7"],["3","4","5","6","7","8","9","1","2"],["6","7","8","9","1","2","3","4","5"],["9","1","2","3","4","5","6","7","8"]]}',
        expectedJson: '[["1","2","3","4","5","6","7","8","9"],["4","5","6","7","8","9","1","2","3"],["7","8","9","1","2","3","4","5","6"],["2","3","4","5","6","7","8","9","1"],["5","6","7","8","9","1","2","3","4"],["8","9","1","2","3","4","5","6","7"],["3","4","5","6","7","8","9","1","2"],["6","7","8","9","1","2","3","4","5"],["9","1","2","3","4","5","6","7","8"]]',
      },
      {
        label: 'Near-solved: middle',
        inputJson: '{"board":[["1","2","3","4","5","6","7","8","9"],["4","5","6","7","8","9","1","2","3"],["7","8","9","1","2","3","4","5","6"],["2","3","4","5","6","7","8","9","1"],["5","6","7","8",".","1","2","3","4"],["8","9","1","2","3","4","5","6","7"],["3","4","5","6","7","8","9","1","2"],["6","7","8","9","1","2","3","4","5"],["9","1","2","3","4","5","6","7","8"]]}',
        expectedJson: '[["1","2","3","4","5","6","7","8","9"],["4","5","6","7","8","9","1","2","3"],["7","8","9","1","2","3","4","5","6"],["2","3","4","5","6","7","8","9","1"],["5","6","7","8","9","1","2","3","4"],["8","9","1","2","3","4","5","6","7"],["3","4","5","6","7","8","9","1","2"],["6","7","8","9","1","2","3","4","5"],["9","1","2","3","4","5","6","7","8"]]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Backtracking',
        intuition: 'Collect all empty cells, then try digits 1-9 in each. Use sets for each row, column, and 3x3 box to check validity in O(1). If a digit leads to a dead end, undo and try the next.',
        code: `class Solution:
    def solveSudoku(self, board: list[list[str]]) -> list[list[str]]:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        empties = []
        for r in range(9):
            for c in range(9):
                ch = board[r][c]
                if ch == '.':
                    empties.append((r, c))
                else:
                    rows[r].add(ch)
                    cols[c].add(ch)
                    boxes[(r // 3) * 3 + (c // 3)].add(ch)

        def backtrack(i: int) -> bool:
            if i == len(empties):
                return True
            r, c = empties[i]
            b = (r // 3) * 3 + (c // 3)
            for d in '123456789':
                if d in rows[r] or d in cols[c] or d in boxes[b]:
                    continue
                rows[r].add(d)
                cols[c].add(d)
                boxes[b].add(d)
                board[r][c] = d
                if backtrack(i + 1):
                    return True
                rows[r].remove(d)
                cols[c].remove(d)
                boxes[b].remove(d)
                board[r][c] = '.'
            return False

        backtrack(0)
        return board`,
        timeComplexity: 'O(9^E) where E is number of empty cells',
        spaceComplexity: 'O(E)',
      },
    ],
  },
];
