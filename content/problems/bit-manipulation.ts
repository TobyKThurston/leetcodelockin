// ─── Bit Manipulation problems ──────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const BIT_MANIPULATION_PROBLEMS: ProblemContent[] = [
  // ─── Single Number (LC #136) ───────────────────────────────────────────────
  {
    slug: 'single-number',
    lcNumber: 136,
    title: 'Single Number',
    difficulty: 'Easy',
    pattern: 'XOR',
    tags: ['bit-manipulation'],
    descriptionMd: `Given an integer array \`nums\` in which every value appears **exactly twice** except
for one value that appears once, return the value that appears only once.

Your solution must run in linear time and use constant extra memory. The one-liner: XOR all
the values together. Pairs cancel each other out, leaving the singleton.`,
    examples: [
      { input: 'nums = [4, 1, 2, 1, 2]', output: '4' },
      { input: 'nums = [7]', output: '7' },
    ],
    constraints: [
      '`1 <= len(nums) <= 3 * 10^4`',
      'Each element appears twice, except for one element.',
    ],
    starterCode: {
      python: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        # Return the single value that does not have a duplicate.
        pass
`,
    },
    methodName: 'singleNumber',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Classic', inputJson: '{"nums":[4,1,2,1,2]}', expectedJson: '4' },
      { label: 'Single',  inputJson: '{"nums":[7]}',          expectedJson: '7' },
    ],
    resultCompare: 'exact',
  },

  // ─── Number of 1 Bits (LC #191) ────────────────────────────────────────────
  {
    slug: 'number-of-1-bits',
    lcNumber: 191,
    title: 'Number of 1 Bits',
    difficulty: 'Easy',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Given an unsigned integer \`n\`, return the number of \`1\` bits in its binary
representation (the **Hamming weight**).

The classic trick is \`n & (n - 1)\` which clears the lowest set bit — count how many
times you can apply it before \`n\` becomes zero.`,
    examples: [
      { input: 'n = 11', output: '3' },
      { input: 'n = 0', output: '0' },
    ],
    constraints: [ '`0 <= n <= 2^31 - 1`' ],
    starterCode: {
      python: `class Solution:
    def hammingWeight(self, n: int) -> int:
        # Return the number of set bits in n.
        pass
`,
    },
    methodName: 'hammingWeight',
    argKeys: ['n'],
    defaultTests: [
      { label: 'Three bits', inputJson: '{"n":11}', expectedJson: '3' },
      { label: 'Zero',       inputJson: '{"n":0}',  expectedJson: '0' },
      { label: 'All ones',   inputJson: '{"n":15}', expectedJson: '4' },
    ],
    resultCompare: 'exact',
  },

  // ─── Counting Bits (LC #338) ───────────────────────────────────────────────
  {
    slug: 'counting-bits',
    lcNumber: 338,
    title: 'Counting Bits',
    difficulty: 'Easy',
    pattern: 'DP + Bits',
    tags: ['bit-manipulation', 'dp'],
    descriptionMd: `Given an integer \`n\`, return an array \`out\` of length \`n + 1\` such that
\`out[i]\` is the number of \`1\` bits in the binary representation of \`i\`, for
\`i\` from 0 to \`n\`.

The DP recurrence is \`out[i] = out[i >> 1] + (i & 1)\`: the count for \`i\` is the count
for \`i\` shifted right by one bit, plus an extra 1 if the LSB of \`i\` is set.`,
    examples: [
      { input: 'n = 5', output: '[0, 1, 1, 2, 1, 2]' },
      { input: 'n = 0', output: '[0]' },
    ],
    constraints: [ '`0 <= n <= 10^5`' ],
    starterCode: {
      python: `class Solution:
    def countBits(self, n: int) -> list[int]:
        # Return an array where out[i] is the popcount of i, for i in [0, n].
        pass
`,
    },
    methodName: 'countBits',
    argKeys: ['n'],
    defaultTests: [
      { label: 'n = 5', inputJson: '{"n":5}', expectedJson: '[0,1,1,2,1,2]' },
      { label: 'n = 0', inputJson: '{"n":0}', expectedJson: '[0]'           },
      { label: 'n = 2', inputJson: '{"n":2}', expectedJson: '[0,1,1]'       },
    ],
    resultCompare: 'exact',
  },

  // ─── Reverse Bits (LC #190) ────────────────────────────────────────────────
  {
    slug: 'reverse-bits',
    lcNumber: 190,
    title: 'Reverse Bits',
    difficulty: 'Easy',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Reverse the bits of a given 32-bit unsigned integer and return the result.

Walk 32 iterations, in each one shifting the result left and OR-ing the LSB of the input
(which you then shift right).`,
    examples: [
      { input: 'n = 43261596', output: '964176192' },
      { input: 'n = 0', output: '0' },
    ],
    constraints: [ '`0 <= n <= 2^32 - 1`' ],
    starterCode: {
      python: `class Solution:
    def reverseBits(self, n: int) -> int:
        # Return n's 32-bit reversal.
        pass
`,
    },
    methodName: 'reverseBits',
    argKeys: ['n'],
    defaultTests: [
      { label: 'Classic', inputJson: '{"n":43261596}', expectedJson: '964176192' },
      { label: 'Zero',    inputJson: '{"n":0}',         expectedJson: '0'         },
      { label: 'One',     inputJson: '{"n":1}',         expectedJson: '2147483648' },
    ],
    resultCompare: 'exact',
  },

  // ─── Missing Number (LC #268) ──────────────────────────────────────────────
  {
    slug: 'missing-number',
    lcNumber: 268,
    title: 'Missing Number',
    difficulty: 'Easy',
    pattern: 'XOR',
    tags: ['bit-manipulation', 'math'],
    descriptionMd: `Given an array \`nums\` containing \`n\` distinct numbers taken from the range
\`[0, n]\`, return the single number missing from the range.

XOR solution: XOR together every value in \`nums\` and every value in \`0..n\`. Matching
pairs cancel out, leaving only the missing value. A sum-formula solution (\`n*(n+1)/2 - sum(nums)\`)
also works.`,
    examples: [
      { input: 'nums = [3, 0, 1]', output: '2' },
      { input: 'nums = [0]', output: '1' },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^4`',
      '`0 <= nums[i] <= n`',
      'All values in `nums` are unique.',
    ],
    starterCode: {
      python: `class Solution:
    def missingNumber(self, nums: list[int]) -> int:
        # Return the single missing value from [0, n].
        pass
`,
    },
    methodName: 'missingNumber',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Mid missing', inputJson: '{"nums":[3,0,1]}', expectedJson: '2' },
      { label: 'One missing', inputJson: '{"nums":[0]}',     expectedJson: '1' },
      { label: 'Zero missing',inputJson: '{"nums":[1,2,3]}', expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Power of Two (LC #231) ────────────────────────────────────────────────
  {
    slug: 'power-of-two',
    lcNumber: 231,
    title: 'Power of Two',
    difficulty: 'Easy',
    pattern: 'Bits',
    tags: ['bit-manipulation', 'math'],
    descriptionMd: `Given an integer \`n\`, return \`True\` if it is a power of two (\`1\`, \`2\`, \`4\`,
\`8\`, ...) and \`False\` otherwise.

A power of two has exactly one set bit, so \`n > 0 and n & (n - 1) == 0\`.`,
    examples: [
      { input: 'n = 16', output: 'True' },
      { input: 'n = 3', output: 'False' },
    ],
    constraints: [ '`-2^31 <= n <= 2^31 - 1`' ],
    starterCode: {
      python: `class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        # Return True if n is a power of two.
        pass
`,
    },
    methodName: 'isPowerOfTwo',
    argKeys: ['n'],
    defaultTests: [
      { label: 'Power',    inputJson: '{"n":16}', expectedJson: 'true'  },
      { label: 'Not power',inputJson: '{"n":3}',  expectedJson: 'false' },
      { label: 'Zero',     inputJson: '{"n":0}',  expectedJson: 'false' },
      { label: 'One',      inputJson: '{"n":1}',  expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Hamming Distance (LC #461) ────────────────────────────────────────────
  {
    slug: 'hamming-distance',
    lcNumber: 461,
    title: 'Hamming Distance',
    difficulty: 'Easy',
    pattern: 'XOR',
    tags: ['bit-manipulation'],
    descriptionMd: `The **Hamming distance** between two integers is the number of positions at which
their binary representations differ. Given two integers \`x\` and \`y\`, return their
Hamming distance.

One-liner: popcount of \`x XOR y\`.`,
    examples: [
      { input: 'x = 1, y = 4', output: '2' },
      { input: 'x = 3, y = 1', output: '1' },
    ],
    constraints: [ '`0 <= x, y <= 2^31 - 1`' ],
    starterCode: {
      python: `class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        # Return the Hamming distance between x and y.
        pass
`,
    },
    methodName: 'hammingDistance',
    argKeys: ['x', 'y'],
    defaultTests: [
      { label: 'Two bits',  inputJson: '{"x":1,"y":4}', expectedJson: '2' },
      { label: 'One bit',   inputJson: '{"x":3,"y":1}', expectedJson: '1' },
      { label: 'Same',      inputJson: '{"x":5,"y":5}', expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Bitwise AND of Numbers Range (LC #201) ───────────────────────────────
  {
    slug: 'bitwise-and-of-numbers-range',
    lcNumber: 201,
    title: 'Bitwise AND of Numbers Range',
    difficulty: 'Medium',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Given two integers \`left\` and \`right\`, return the bitwise AND of all integers in
the inclusive range \`[left, right]\`.

The answer is the **common prefix** of the binary representations of \`left\` and
\`right\`, because any bit that differs within the range gets zeroed once a \`0\` appears
somewhere for it. Repeatedly shift both right until they're equal, then shift back by the
same amount.`,
    examples: [
      { input: 'left = 5, right = 7', output: '4' },
      { input: 'left = 1, right = 1', output: '1' },
    ],
    constraints: [
      '`0 <= left <= right <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        # Return the bitwise AND of every integer in [left, right].
        pass
`,
    },
    methodName: 'rangeBitwiseAnd',
    argKeys: ['left', 'right'],
    defaultTests: [
      { label: 'Classic', inputJson: '{"left":5,"right":7}', expectedJson: '4' },
      { label: 'Same',    inputJson: '{"left":1,"right":1}', expectedJson: '1' },
      { label: 'Wide',    inputJson: '{"left":0,"right":5}', expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Single Number III (LC #260) ───────────────────────────────────────────
  {
    slug: 'single-number-iii',
    lcNumber: 260,
    title: 'Single Number III',
    difficulty: 'Medium',
    pattern: 'XOR',
    tags: ['bit-manipulation'],
    descriptionMd: `Given an array \`nums\` where exactly two distinct values each appear once and
every other value appears exactly twice, return those **two singleton values**. The result
can be returned in any order.

Trick: the XOR of all values equals \`a XOR b\` (where \`a\` and \`b\` are the singletons).
Pick any bit where \`a\` and \`b\` differ (e.g. the lowest set bit of \`a XOR b\`). Partition
\`nums\` into the two groups according to that bit, and XOR each group to isolate \`a\`
and \`b\`.`,
    examples: [
      { input: 'nums = [1, 2, 1, 3, 2, 5]', output: '[3, 5]' },
      { input: 'nums = [-1, 0]', output: '[-1, 0]' },
    ],
    constraints: [
      '`2 <= len(nums) <= 3 * 10^4`',
      '`-2^31 <= nums[i] <= 2^31 - 1`',
      'Exactly two values appear once; every other value appears twice.',
    ],
    starterCode: {
      python: `class Solution:
    def singleNumber(self, nums: list[int]) -> list[int]:
        # Return the two values that appear exactly once.
        pass
`,
    },
    methodName: 'singleNumber',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Classic',      inputJson: '{"nums":[1,2,1,3,2,5]}', expectedJson: '[3,5]'   },
      { label: 'Negative zero',inputJson: '{"nums":[-1,0]}',         expectedJson: '[-1,0]' },
    ],
    resultCompare: 'set',
  },

  // ─── Minimum Flips to Make a OR b Equal to c (LC #1318) ───────────────────
  {
    slug: 'minimum-flips-to-make-a-or-b-equal-to-c',
    lcNumber: 1318,
    title: 'Minimum Flips to Make a OR b Equal to c',
    difficulty: 'Medium',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Given three positive integers \`a\`, \`b\`, and \`c\`, return the minimum number of
bit flips required in \`a\` and \`b\` so that \`(a OR b) == c\`.

Walk the bit positions: at each bit, look at \`ab = a_bit | b_bit\` and \`c_bit\`. If
\`ab != c_bit\`, you need a flip — and if the target bit is 0 but both input bits are set,
that's **two** flips.`,
    examples: [
      { input: 'a = 2, b = 6, c = 5', output: '3' },
      { input: 'a = 4, b = 2, c = 7', output: '1' },
    ],
    constraints: [
      '`1 <= a, b, c <= 10^9`',
    ],
    starterCode: {
      python: `class Solution:
    def minFlips(self, a: int, b: int, c: int) -> int:
        # Return the minimum number of bit flips in a and b to make (a | b) == c.
        pass
`,
    },
    methodName: 'minFlips',
    argKeys: ['a', 'b', 'c'],
    defaultTests: [
      { label: 'Three flips', inputJson: '{"a":2,"b":6,"c":5}', expectedJson: '3' },
      { label: 'Single flip', inputJson: '{"a":4,"b":2,"c":7}', expectedJson: '1' },
      { label: 'No flips',    inputJson: '{"a":1,"b":2,"c":3}', expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Sum of Two Integers (LC #371) ─────────────────────────────────────────
  {
    slug: 'sum-of-two-integers',
    lcNumber: 371,
    title: 'Sum of Two Integers',
    difficulty: 'Medium',
    pattern: 'Bits',
    tags: ['bit-manipulation', 'math'],
    descriptionMd: `Given two integers \`a\` and \`b\`, return \`a + b\` **without using the \`+\` or
\`-\` operators**.

The bitwise trick:
- \`a XOR b\` is the sum ignoring carries.
- \`(a AND b) << 1\` is the carry.

Repeat until the carry is zero. In Python, because integers are arbitrary precision, you
need to mask to 32 bits each iteration and handle the sign at the end.`,
    examples: [
      { input: 'a = 1, b = 2', output: '3' },
      { input: 'a = 0, b = 0', output: '0' },
    ],
    constraints: [ '`-1000 <= a, b <= 1000`' ],
    starterCode: {
      python: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        # Return a + b using only bitwise operations.
        pass
`,
    },
    methodName: 'getSum',
    argKeys: ['a', 'b'],
    defaultTests: [
      { label: 'Simple',   inputJson: '{"a":1,"b":2}',  expectedJson: '3'  },
      { label: 'Zero',     inputJson: '{"a":0,"b":0}',  expectedJson: '0'  },
      { label: 'Negative', inputJson: '{"a":-1,"b":1}', expectedJson: '0'  },
      { label: 'Larger',   inputJson: '{"a":20,"b":22}',expectedJson: '42' },
    ],
    resultCompare: 'exact',
  },

  // ─── Single Number II (LC #137) ────────────────────────────────────────────
  {
    slug: 'single-number-ii',
    lcNumber: 137,
    title: 'Single Number II',
    difficulty: 'Medium',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Given an integer array \`nums\` where every value appears **exactly three times**
except for one value which appears once, return that singleton. You must run in linear time
and constant extra memory.

The elegant bit trick: for each bit position, the count of set bits modulo 3 gives the
corresponding bit of the singleton. Simpler bookkeeping uses two state variables \`ones\`
and \`twos\` that track bits seen once and twice (mod 3) respectively.`,
    examples: [
      { input: 'nums = [2, 2, 3, 2]', output: '3' },
      { input: 'nums = [0, 1, 0, 1, 0, 1, 99]', output: '99' },
    ],
    constraints: [
      '`1 <= len(nums) <= 3 * 10^4`',
      '`-2^31 <= nums[i] <= 2^31 - 1`',
      'Each value except one appears three times; the remaining one appears once.',
    ],
    starterCode: {
      python: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        # Return the single value that appears once among triples.
        pass
`,
    },
    methodName: 'singleNumber',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Classic',   inputJson: '{"nums":[2,2,3,2]}',         expectedJson: '3'  },
      { label: 'Bigger',    inputJson: '{"nums":[0,1,0,1,0,1,99]}',   expectedJson: '99' },
      { label: 'Singleton', inputJson: '{"nums":[42]}',                expectedJson: '42' },
    ],
    resultCompare: 'exact',
  },
];
