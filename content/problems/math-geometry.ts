// ─── Math & Geometry problems ───────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const MATH_GEOMETRY_PROBLEMS: ProblemContent[] = [
  // ─── Palindrome Number (LC #9) ─────────────────────────────────────────────
  {
    slug: 'palindrome-number',
    lcNumber: 9,
    title: 'Palindrome Number',
    difficulty: 'Easy',
    pattern: 'Math',
    tags: ['math'],
    descriptionMd: `Given an integer \`x\`, return \`True\` if it reads the same forwards and backwards
(i.e., is a palindrome), and \`False\` otherwise. Negative numbers are **not**
palindromic because of the leading \`-\`.

You are encouraged to solve this without converting to a string — the classic approach
reverses the second half of the digits and compares to the first half.`,
    examples: [
      { input: 'x = 121', output: 'True' },
      { input: 'x = -121', output: 'False' },
      { input: 'x = 10', output: 'False' },
    ],
    constraints: [ '`-2^31 <= x <= 2^31 - 1`' ],
    starterCode: {
      python: `class Solution:
    def isPalindrome(self, x: int) -> bool:
        # Return True if the integer x is a palindrome.
        pass
`,
    },
    methodName: 'isPalindrome',
    argKeys: ['x'],
    defaultTests: [
      { label: 'Positive palindrome', inputJson: '{"x":121}',  expectedJson: 'true'  },
      { label: 'Negative',            inputJson: '{"x":-121}', expectedJson: 'false' },
      { label: 'Trailing zero',       inputJson: '{"x":10}',   expectedJson: 'false' },
      { label: 'Zero',                inputJson: '{"x":0}',    expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Plus One (LC #66) ─────────────────────────────────────────────────────
  {
    slug: 'plus-one',
    lcNumber: 66,
    title: 'Plus One',
    difficulty: 'Easy',
    pattern: 'Array',
    tags: ['array', 'math'],
    descriptionMd: `You are given a non-negative integer represented as the digit array \`digits\`
(most-significant digit first). Add one to the number it represents and return the result as
a digit array with no leading zeros.

Walk from the least-significant digit, adding one with carry; if the carry still exists
when you fall off the left, prepend a \`1\`.`,
    examples: [
      { input: 'digits = [1, 2, 3]', output: '[1, 2, 4]' },
      { input: 'digits = [9, 9]', output: '[1, 0, 0]' },
    ],
    constraints: [
      '`1 <= len(digits) <= 100`',
      '`0 <= digits[i] <= 9`',
      '`digits` has no leading zeros unless the number is 0.',
    ],
    starterCode: {
      python: `class Solution:
    def plusOne(self, digits: list[int]) -> list[int]:
        # Return digits representing the original integer plus one.
        pass
`,
    },
    methodName: 'plusOne',
    argKeys: ['digits'],
    defaultTests: [
      { label: 'No carry',  inputJson: '{"digits":[1,2,3]}', expectedJson: '[1,2,4]' },
      { label: 'Full carry',inputJson: '{"digits":[9,9]}',   expectedJson: '[1,0,0]' },
      { label: 'Zero',      inputJson: '{"digits":[0]}',      expectedJson: '[1]'     },
    ],
    resultCompare: 'exact',
  },

  // ─── Happy Number (LC #202) ────────────────────────────────────────────────
  {
    slug: 'happy-number',
    lcNumber: 202,
    title: 'Happy Number',
    difficulty: 'Easy',
    pattern: 'Math',
    tags: ['math', 'hash-set'],
    descriptionMd: `A **happy number** is defined by the following process: starting with \`n\`, replace
it with the sum of the squares of its digits; repeat. The number is happy if the process
eventually reaches \`1\`, otherwise it loops forever.

Return \`True\` if \`n\` is happy. Either keep a set of seen values to detect the loop, or
use Floyd's cycle-detection with two pointers.`,
    examples: [
      { input: 'n = 19', output: 'True' },
      { input: 'n = 2', output: 'False' },
    ],
    constraints: [ '`1 <= n <= 2^31 - 1`' ],
    starterCode: {
      python: `class Solution:
    def isHappy(self, n: int) -> bool:
        # Return True if repeatedly replacing n with the sum of squares of its digits reaches 1.
        pass
`,
    },
    methodName: 'isHappy',
    argKeys: ['n'],
    defaultTests: [
      { label: 'Happy',     inputJson: '{"n":19}', expectedJson: 'true'  },
      { label: 'Not happy', inputJson: '{"n":2}',  expectedJson: 'false' },
      { label: 'One',       inputJson: '{"n":1}',  expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Ugly Number (LC #263) ─────────────────────────────────────────────────
  {
    slug: 'ugly-number',
    lcNumber: 263,
    title: 'Ugly Number',
    difficulty: 'Easy',
    pattern: 'Math',
    tags: ['math'],
    descriptionMd: `An **ugly number** is a positive integer whose prime factors are only \`2\`, \`3\`,
or \`5\`. Given an integer \`n\`, return \`True\` if it is ugly.

Repeatedly divide \`n\` by \`2\`, \`3\`, and \`5\` while divisible; if the final value is
\`1\` it is ugly, otherwise it has another prime factor.`,
    examples: [
      { input: 'n = 6', output: 'True' },
      { input: 'n = 14', output: 'False' },
    ],
    constraints: [ '`-2^31 <= n <= 2^31 - 1`' ],
    starterCode: {
      python: `class Solution:
    def isUgly(self, n: int) -> bool:
        # Return True if n > 0 and its only prime factors are 2, 3, 5.
        pass
`,
    },
    methodName: 'isUgly',
    argKeys: ['n'],
    defaultTests: [
      { label: 'Six',   inputJson: '{"n":6}',  expectedJson: 'true'  },
      { label: 'Has 7', inputJson: '{"n":14}', expectedJson: 'false' },
      { label: 'Zero',  inputJson: '{"n":0}',  expectedJson: 'false' },
      { label: 'One',   inputJson: '{"n":1}',  expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Rotate Image (LC #48) ─────────────────────────────────────────────────
  {
    slug: 'rotate-image',
    lcNumber: 48,
    title: 'Rotate Image',
    difficulty: 'Medium',
    pattern: 'Matrix',
    tags: ['matrix'],
    descriptionMd: `Given an \`n x n\` 2-D matrix \`matrix\` representing an image, rotate the image by
**90 degrees clockwise** in place. Return the rotated matrix.

The classic trick is **transpose + reverse each row**. Transposing swaps \`matrix[i][j]\`
with \`matrix[j][i]\` (for \`j > i\`), after which reversing every row gives the 90° CW
rotation.`,
    examples: [
      { input: 'matrix = [[1, 2], [3, 4]]', output: '[[3, 1], [4, 2]]' },
      { input: 'matrix = [[5]]', output: '[[5]]' },
    ],
    constraints: [
      '`1 <= n <= 20`',
      '`-1000 <= matrix[i][j] <= 1000`',
    ],
    starterCode: {
      python: `class Solution:
    def rotate(self, matrix: list[list[int]]) -> list[list[int]]:
        # Rotate matrix 90 degrees clockwise in place, then return it.
        pass
`,
    },
    methodName: 'rotate',
    argKeys: ['matrix'],
    defaultTests: [
      { label: '2x2',    inputJson: '{"matrix":[[1,2],[3,4]]}',          expectedJson: '[[3,1],[4,2]]' },
      { label: 'Single', inputJson: '{"matrix":[[5]]}',                   expectedJson: '[[5]]'         },
      {
        label: '3x3',
        inputJson: '{"matrix":[[1,2,3],[4,5,6],[7,8,9]]}',
        expectedJson: '[[7,4,1],[8,5,2],[9,6,3]]',
      },
    ],
    resultCompare: 'exact',
  },

  // ─── Spiral Matrix (LC #54) ────────────────────────────────────────────────
  {
    slug: 'spiral-matrix',
    lcNumber: 54,
    title: 'Spiral Matrix',
    difficulty: 'Medium',
    pattern: 'Matrix',
    tags: ['matrix'],
    descriptionMd: `Given an \`m x n\` matrix, return all its elements in **spiral order** —
right along the top, down the right edge, left along the bottom, up the left edge, then
repeat for the inner submatrix.

Keep four bounds (\`top\`, \`bottom\`, \`left\`, \`right\`) and shrink each after its edge is
traversed.`,
    examples: [
      { input: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '[1, 2, 3, 6, 9, 8, 7, 4, 5]' },
      { input: 'matrix = [[1]]', output: '[1]' },
    ],
    constraints: [
      '`1 <= m, n <= 10`',
      '`-100 <= matrix[i][j] <= 100`',
    ],
    starterCode: {
      python: `class Solution:
    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:
        # Return the matrix elements in spiral order.
        pass
`,
    },
    methodName: 'spiralOrder',
    argKeys: ['matrix'],
    defaultTests: [
      {
        label: '3x3',
        inputJson: '{"matrix":[[1,2,3],[4,5,6],[7,8,9]]}',
        expectedJson: '[1,2,3,6,9,8,7,4,5]',
      },
      { label: 'Single', inputJson: '{"matrix":[[1]]}',     expectedJson: '[1]' },
      { label: 'Row',    inputJson: '{"matrix":[[1,2,3]]}', expectedJson: '[1,2,3]' },
    ],
    resultCompare: 'exact',
  },

  // ─── Spiral Matrix II (LC #59) ─────────────────────────────────────────────
  {
    slug: 'spiral-matrix-ii',
    lcNumber: 59,
    title: 'Spiral Matrix II',
    difficulty: 'Medium',
    pattern: 'Matrix',
    tags: ['matrix'],
    descriptionMd: `Given a positive integer \`n\`, generate an \`n x n\` matrix filled with the values
\`1\` through \`n^2\` in **spiral order**, starting at the top-left.

Same four-boundary sweep as "Spiral Matrix", only writing values instead of reading them.`,
    examples: [
      { input: 'n = 3', output: '[[1, 2, 3], [8, 9, 4], [7, 6, 5]]' },
      { input: 'n = 1', output: '[[1]]' },
    ],
    constraints: [ '`1 <= n <= 20`' ],
    starterCode: {
      python: `class Solution:
    def generateMatrix(self, n: int) -> list[list[int]]:
        # Return an n x n matrix filled 1..n^2 in spiral order.
        pass
`,
    },
    methodName: 'generateMatrix',
    argKeys: ['n'],
    defaultTests: [
      { label: 'n = 3', inputJson: '{"n":3}', expectedJson: '[[1,2,3],[8,9,4],[7,6,5]]' },
      { label: 'n = 1', inputJson: '{"n":1}', expectedJson: '[[1]]' },
      { label: 'n = 2', inputJson: '{"n":2}', expectedJson: '[[1,2],[4,3]]' },
    ],
    resultCompare: 'exact',
  },

  // ─── Set Matrix Zeroes (LC #73) ────────────────────────────────────────────
  {
    slug: 'set-matrix-zeroes',
    lcNumber: 73,
    title: 'Set Matrix Zeroes',
    difficulty: 'Medium',
    pattern: 'Matrix',
    tags: ['matrix'],
    descriptionMd: `Given an \`m x n\` integer matrix, if a cell contains \`0\`, set its entire row and
column to \`0\`. Return the modified matrix.

A simple approach records which rows and columns contain zero in two extra arrays and then
walks the matrix a second time. An \`O(1)\` extra-memory approach uses the first row and
first column themselves as the record.`,
    examples: [
      { input: 'matrix = [[1, 1, 1], [1, 0, 1], [1, 1, 1]]', output: '[[1, 0, 1], [0, 0, 0], [1, 0, 1]]' },
      { input: 'matrix = [[0]]', output: '[[0]]' },
    ],
    constraints: [
      '`1 <= m, n <= 200`',
      '`-2^31 <= matrix[i][j] <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def setZeroes(self, matrix: list[list[int]]) -> list[list[int]]:
        # Zero out rows and columns touching any original zero; return the matrix.
        pass
`,
    },
    methodName: 'setZeroes',
    argKeys: ['matrix'],
    defaultTests: [
      {
        label: 'Centre zero',
        inputJson: '{"matrix":[[1,1,1],[1,0,1],[1,1,1]]}',
        expectedJson: '[[1,0,1],[0,0,0],[1,0,1]]',
      },
      { label: 'Single zero', inputJson: '{"matrix":[[0]]}',      expectedJson: '[[0]]' },
      {
        label: 'No zero',
        inputJson: '{"matrix":[[1,2],[3,4]]}',
        expectedJson: '[[1,2],[3,4]]',
      },
    ],
    resultCompare: 'exact',
  },

  // ─── Multiply Strings (LC #43) ─────────────────────────────────────────────
  {
    slug: 'multiply-strings',
    lcNumber: 43,
    title: 'Multiply Strings',
    difficulty: 'Medium',
    pattern: 'Math',
    tags: ['string', 'math'],
    descriptionMd: `Given two non-negative integers \`num1\` and \`num2\` represented as strings, return
their product also as a string. You must not use any built-in BigInteger or large-integer
type — implement the multiplication digit-by-digit.

The classical "schoolbook" algorithm: multiply each digit of \`num1\` by each digit of
\`num2\`, accumulate into a buffer at the correct offset, then carry-propagate and strip
leading zeros.`,
    examples: [
      { input: 'num1 = "2", num2 = "3"', output: '"6"' },
      { input: 'num1 = "123", num2 = "45"', output: '"5535"' },
    ],
    constraints: [
      '`1 <= len(num1), len(num2) <= 200`',
      '`num1` and `num2` consist of digits only.',
      'Neither has leading zeros except the single `"0"` case.',
    ],
    starterCode: {
      python: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        # Return the product of num1 and num2 as a string (no big-int built-ins).
        pass
`,
    },
    methodName: 'multiply',
    argKeys: ['num1', 'num2'],
    defaultTests: [
      { label: 'Single digits', inputJson: '{"num1":"2","num2":"3"}',     expectedJson: '"6"'    },
      { label: 'Longer',        inputJson: '{"num1":"123","num2":"45"}',  expectedJson: '"5535"' },
      { label: 'Zero',          inputJson: '{"num1":"0","num2":"99"}',    expectedJson: '"0"'    },
    ],
    resultCompare: 'exact',
  },

  // ─── Max Points on a Line (LC #149) ────────────────────────────────────────
  {
    slug: 'max-points-on-a-line',
    lcNumber: 149,
    title: 'Max Points on a Line',
    difficulty: 'Hard',
    pattern: 'Geometry',
    tags: ['geometry', 'hash-map', 'math'],
    descriptionMd: `Given an array of \`points\` on a 2D plane where \`points[i] = [xi, yi]\`, return
the **maximum number of points** that lie on the same straight line.

The canonical solution loops over each point \`p\` and groups the other points by the
**slope** of the line through \`p\`. Use a reduced fraction as the hash key to dodge
floating-point error, and handle vertical lines as a special slope.`,
    examples: [
      { input: 'points = [[1, 1], [2, 2], [3, 3]]', output: '3' },
      { input: 'points = [[0, 0], [1, 1], [0, 1], [1, 0]]', output: '2' },
    ],
    constraints: [
      '`1 <= len(points) <= 300`',
      '`-10^4 <= xi, yi <= 10^4`',
      'All points are distinct.',
    ],
    starterCode: {
      python: `class Solution:
    def maxPoints(self, points: list[list[int]]) -> int:
        # Return the most points that lie on a single straight line.
        pass
`,
    },
    methodName: 'maxPoints',
    argKeys: ['points'],
    defaultTests: [
      { label: 'Diagonal', inputJson: '{"points":[[1,1],[2,2],[3,3]]}',       expectedJson: '3' },
      { label: 'Square',   inputJson: '{"points":[[0,0],[1,1],[0,1],[1,0]]}', expectedJson: '2' },
      { label: 'Single',   inputJson: '{"points":[[5,5]]}',                    expectedJson: '1' },
    ],
    resultCompare: 'exact',
  },

  // ─── Rectangle Area (LC #223) ──────────────────────────────────────────────
  {
    slug: 'rectangle-area',
    lcNumber: 223,
    title: 'Rectangle Area',
    difficulty: 'Medium',
    pattern: 'Geometry',
    tags: ['geometry', 'math'],
    descriptionMd: `Given the corners of two axis-aligned rectangles — the first has bottom-left
\`(ax1, ay1)\` and top-right \`(ax2, ay2)\`, the second has bottom-left \`(bx1, by1)\` and
top-right \`(bx2, by2)\` — return the **total area** covered by the two rectangles (union).

Compute the area of each rectangle, then subtract the area of their intersection
(zero if they don't overlap).`,
    examples: [
      {
        input: 'ax1 = -3, ay1 = 0, ax2 = 3, ay2 = 4, bx1 = 0, by1 = -1, bx2 = 9, by2 = 2',
        output: '45',
      },
      {
        input: 'ax1 = 0, ay1 = 0, ax2 = 1, ay2 = 1, bx1 = 10, by1 = 10, bx2 = 11, by2 = 11',
        output: '2',
      },
    ],
    constraints: [
      '`-10^4 <= ax1 <= ax2 <= 10^4`',
      '`-10^4 <= ay1 <= ay2 <= 10^4`',
      'Same for the second rectangle.',
    ],
    starterCode: {
      python: `class Solution:
    def computeArea(self, ax1: int, ay1: int, ax2: int, ay2: int, bx1: int, by1: int, bx2: int, by2: int) -> int:
        # Return the total area covered by the two axis-aligned rectangles.
        pass
`,
    },
    methodName: 'computeArea',
    argKeys: ['ax1', 'ay1', 'ax2', 'ay2', 'bx1', 'by1', 'bx2', 'by2'],
    defaultTests: [
      {
        label: 'Overlapping',
        inputJson: '{"ax1":-3,"ay1":0,"ax2":3,"ay2":4,"bx1":0,"by1":-1,"bx2":9,"by2":2}',
        expectedJson: '45',
      },
      {
        label: 'Disjoint',
        inputJson: '{"ax1":0,"ay1":0,"ax2":1,"ay2":1,"bx1":10,"by1":10,"bx2":11,"by2":11}',
        expectedJson: '2',
      },
      {
        label: 'Identical',
        inputJson: '{"ax1":0,"ay1":0,"ax2":2,"ay2":2,"bx1":0,"by1":0,"bx2":2,"by2":2}',
        expectedJson: '4',
      },
    ],
    resultCompare: 'exact',
  },

  // ─── Best Meeting Point (LC #296) ──────────────────────────────────────────
  {
    slug: 'best-meeting-point',
    lcNumber: 296,
    title: 'Best Meeting Point',
    difficulty: 'Hard',
    pattern: 'Math',
    tags: ['matrix', 'math'],
    descriptionMd: `Given an \`m x n\` grid where a \`1\` marks a friend's house and a \`0\` is empty,
find the **minimum total Manhattan distance** that every friend needs to travel to meet at
a single point on the grid.

Key insight: Manhattan distances decompose into independent \`x\` and \`y\` coordinates,
and the 1-D "minimum sum of absolute differences" meeting point is the **median**. Collect
all row indices of the 1s and all column indices of the 1s, sort each, and the answer is
the total distance from every friend to the median row and median column.`,
    examples: [
      {
        input: 'grid = [[1, 0, 0, 0, 1], [0, 0, 0, 0, 0], [0, 0, 1, 0, 0]]',
        output: '6',
      },
      { input: 'grid = [[1, 1]]', output: '1' },
    ],
    constraints: [
      '`1 <= m, n <= 200`',
      '`grid[i][j]` is `0` or `1`.',
      'At least one friend is present on the grid.',
    ],
    starterCode: {
      python: `class Solution:
    def minTotalDistance(self, grid: list[list[int]]) -> int:
        # Return the minimum total Manhattan distance for every friend to meet at one cell.
        pass
`,
    },
    methodName: 'minTotalDistance',
    argKeys: ['grid'],
    defaultTests: [
      {
        label: 'Three friends',
        inputJson: '{"grid":[[1,0,0,0,1],[0,0,0,0,0],[0,0,1,0,0]]}',
        expectedJson: '6',
      },
      { label: 'Two adjacent', inputJson: '{"grid":[[1,1]]}', expectedJson: '1' },
      { label: 'Single',       inputJson: '{"grid":[[1]]}',    expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },
];
