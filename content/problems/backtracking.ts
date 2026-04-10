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
  },
];
