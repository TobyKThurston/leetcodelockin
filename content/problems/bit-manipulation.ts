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
    descriptionMd: `Given a **non-empty** array of integers \`nums\`, every element appears **twice**
except for one. Find that single one.

You must implement a solution with linear runtime complexity and use only constant extra
space.`,
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
    solutions: [
      {
        approach: 'XOR All Values',
        intuition: 'XOR is self-inverse: a ^ a = 0. XOR-ing all values cancels out every pair, leaving only the singleton.',
        code: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        result = 0
        for v in nums:
            result ^= v
        return result`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Number of 1 Bits (LC #191) ────────────────────────────────────────────
  {
    slug: 'number-of-1-bits',
    lcNumber: 191,
    title: 'Number of 1 Bits',
    difficulty: 'Easy',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Write a function that takes an unsigned integer \`n\` and returns the number of
\`1\` bits it has in its binary representation (also known as the **Hamming weight**).`,
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
    solutions: [
      {
        approach: 'Brian Kernighan (n & (n-1))',
        intuition: 'The expression n & (n - 1) clears the lowest set bit. Count how many times you can apply it before n becomes zero.',
        code: `class Solution:
    def hammingWeight(self, n: int) -> int:
        count = 0
        while n:
            n &= n - 1
            count += 1
        return count`,
        timeComplexity: 'O(k) where k is the number of set bits',
        spaceComplexity: 'O(1)',
      },
    ],
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
for each \`i\` (\`0 <= i <= n\`), \`out[i]\` is the number of \`1\` bits in the binary
representation of \`i\`.`,
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
    solutions: [
      {
        approach: 'DP (Bit Shift Recurrence)',
        intuition: 'The popcount of i equals the popcount of i >> 1 (drop the LSB) plus i & 1 (whether the LSB was set). Build the table bottom-up.',
        code: `class Solution:
    def countBits(self, n: int) -> list[int]:
        out = [0] * (n + 1)
        for i in range(1, n + 1):
            out[i] = out[i >> 1] + (i & 1)
        return out`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Reverse Bits (LC #190) ────────────────────────────────────────────────
  {
    slug: 'reverse-bits',
    lcNumber: 190,
    title: 'Reverse Bits',
    difficulty: 'Easy',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Reverse the bits of a given 32-bit unsigned integer and return the result.`,
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
    solutions: [
      {
        approach: 'Bit-by-Bit Reversal',
        intuition: 'Iterate 32 times. Each step, shift result left and OR the LSB of n, then shift n right. This builds the reversed 32-bit number.',
        code: `class Solution:
    def reverseBits(self, n: int) -> int:
        result = 0
        for _ in range(32):
            result = (result << 1) | (n & 1)
            n >>= 1
        return result`,
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Missing Number (LC #268) ──────────────────────────────────────────────
  {
    slug: 'missing-number',
    lcNumber: 268,
    title: 'Missing Number',
    difficulty: 'Easy',
    pattern: 'XOR',
    tags: ['bit-manipulation', 'math'],
    descriptionMd: `Given an array \`nums\` containing \`n\` distinct numbers in the range
\`[0, n]\`, return the only number in the range that is missing from the array.`,
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
    solutions: [
      {
        approach: 'Sum Formula',
        intuition: 'The expected sum of 0..n is n*(n+1)/2. Subtract the actual sum of nums to get the missing value.',
        code: `class Solution:
    def missingNumber(self, nums: list[int]) -> int:
        n = len(nums)
        return n * (n + 1) // 2 - sum(nums)`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'XOR',
        intuition: 'XOR all values in nums with all indices 0..n. Pairs cancel out, leaving only the missing number.',
        code: `class Solution:
    def missingNumber(self, nums: list[int]) -> int:
        n = len(nums)
        result = n
        for i, v in enumerate(nums):
            result ^= i ^ v
        return result`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Power of Two (LC #231) ────────────────────────────────────────────────
  {
    slug: 'power-of-two',
    lcNumber: 231,
    title: 'Power of Two',
    difficulty: 'Easy',
    pattern: 'Bits',
    tags: ['bit-manipulation', 'math'],
    descriptionMd: `Given an integer \`n\`, return \`True\` if it is a power of two, and \`False\`
otherwise.

An integer \`n\` is a power of two if there exists an integer \`x\` such that \`n == 2^x\`.`,
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
    solutions: [
      {
        approach: 'Bit Trick (n & (n-1))',
        intuition: 'A power of two has exactly one set bit. The expression n & (n - 1) clears the lowest set bit, so if it equals 0 and n > 0, there was exactly one bit set.',
        code: `class Solution:
    def isPowerOfTwo(self, n: int) -> bool:
        return n > 0 and (n & (n - 1)) == 0`,
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
      },
    ],
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
the corresponding bits are different.

Given two integers \`x\` and \`y\`, return the Hamming distance between them.`,
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
    solutions: [
      {
        approach: 'XOR + Popcount',
        intuition: 'XOR x and y to get a number with 1s only where the bits differ. Count those 1s using Brian Kernighan\'s trick.',
        code: `class Solution:
    def hammingDistance(self, x: int, y: int) -> int:
        z = x ^ y
        count = 0
        while z:
            z &= z - 1
            count += 1
        return count`,
        timeComplexity: 'O(k) where k is the number of differing bits',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Bitwise AND of Numbers Range (LC #201) ───────────────────────────────
  {
    slug: 'bitwise-and-of-numbers-range',
    lcNumber: 201,
    title: 'Bitwise AND of Numbers Range',
    difficulty: 'Medium',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Given two integers \`left\` and \`right\` that represent the range
\`[left, right]\`, return the bitwise AND of all numbers in this range, inclusive.`,
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
    solutions: [
      {
        approach: 'Common Prefix (Shift Until Equal)',
        intuition: 'The AND of a range keeps only the common prefix of left and right. Shift both right until they are equal (discarding differing lower bits), then shift back.',
        code: `class Solution:
    def rangeBitwiseAnd(self, left: int, right: int) -> int:
        shift = 0
        while left != right:
            left >>= 1
            right >>= 1
            shift += 1
        return left << shift`,
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Single Number III (LC #260) ───────────────────────────────────────────
  {
    slug: 'single-number-iii',
    lcNumber: 260,
    title: 'Single Number III',
    difficulty: 'Medium',
    pattern: 'XOR',
    tags: ['bit-manipulation'],
    descriptionMd: `Given an integer array \`nums\`, in which exactly two elements appear only
**once** and all the other elements appear exactly **twice**, find the two elements that
appear only once. You can return the answer in **any order**.

You must write an algorithm that runs in linear runtime complexity and uses only constant
extra space.`,
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
    solutions: [
      {
        approach: 'XOR + Isolate Differing Bit',
        intuition: 'XOR all values to get a ^ b. Pick any bit where a and b differ (lowest set bit of the XOR). Partition nums by that bit and XOR each group separately to isolate a and b.',
        code: `class Solution:
    def singleNumber(self, nums: list[int]) -> list[int]:
        xor_all = 0
        for v in nums:
            xor_all ^= v
        diff_bit = xor_all & -xor_all
        a = b = 0
        for v in nums:
            if v & diff_bit:
                a ^= v
            else:
                b ^= v
        return [a, b]`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Minimum Flips to Make a OR b Equal to c (LC #1318) ───────────────────
  {
    slug: 'minimum-flips-to-make-a-or-b-equal-to-c',
    lcNumber: 1318,
    title: 'Minimum Flips to Make a OR b Equal to c',
    difficulty: 'Medium',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Given three positive integers \`a\`, \`b\`, and \`c\`, return the **minimum
number of bit flips** required in some bits of \`a\` and \`b\` to make
\`(a OR b) == c\`.

A flip operation consists of changing any single bit from \`1\` to \`0\` or from \`0\` to
\`1\` in the binary representation of a number.`,
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
    solutions: [
      {
        approach: 'Bit-by-Bit Comparison',
        intuition: 'Walk each bit position. Compare a_bit | b_bit with c_bit. If they differ and the target bit is 0, you need to flip every set input bit (could be 2 flips). If the target is 1 and OR is 0, one flip suffices.',
        code: `class Solution:
    def minFlips(self, a: int, b: int, c: int) -> int:
        flips = 0
        while a or b or c:
            ab = (a & 1) | (b & 1)
            cb = c & 1
            if ab != cb:
                if cb == 0:
                    flips += (a & 1) + (b & 1)
                else:
                    flips += 1
            a >>= 1
            b >>= 1
            c >>= 1
        return flips`,
        timeComplexity: 'O(log(max(a, b, c)))',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Sum of Two Integers (LC #371) ─────────────────────────────────────────
  {
    slug: 'sum-of-two-integers',
    lcNumber: 371,
    title: 'Sum of Two Integers',
    difficulty: 'Medium',
    pattern: 'Bits',
    tags: ['bit-manipulation', 'math'],
    descriptionMd: `Given two integers \`a\` and \`b\`, return the sum of the two integers
**without using the operators \`+\` and \`-\`**.`,
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
    solutions: [
      {
        approach: 'Bitwise XOR + Carry with 32-bit Mask',
        intuition: 'XOR gives the sum without carries; AND shifted left gives the carry. Repeat until carry is zero. Mask to 32 bits each iteration to handle Python\'s arbitrary-precision integers, and convert back from two\'s complement at the end.',
        code: `class Solution:
    def getSum(self, a: int, b: int) -> int:
        MASK = 0xFFFFFFFF
        SIGN = 0x80000000
        while b & MASK:
            carry = (a & b) << 1
            a = (a ^ b) & MASK
            b = carry & MASK
        if a & SIGN:
            return a - (1 << 32)
        return a`,
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Single Number II (LC #137) ────────────────────────────────────────────
  {
    slug: 'single-number-ii',
    lcNumber: 137,
    title: 'Single Number II',
    difficulty: 'Medium',
    pattern: 'Bits',
    tags: ['bit-manipulation'],
    descriptionMd: `Given an integer array \`nums\` where every element appears **three times**
except for one, which appears **exactly once**, find the single element and return it.

You must implement a solution with a linear runtime complexity and use only constant extra
space.`,
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
    solutions: [
      {
        approach: 'Ones/Twos State Machine',
        intuition: 'Use two variables ones and twos to track bits seen once and twice (mod 3). For each value, update ones then twos with XOR and mask. After processing all values, ones holds the singleton.',
        code: `class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ones = twos = 0
        for v in nums:
            ones = (ones ^ v) & ~twos
            twos = (twos ^ v) & ~ones
        return ones`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },
];
