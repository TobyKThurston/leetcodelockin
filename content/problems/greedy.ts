// ─── Greedy problems ─────────────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const GREEDY_PROBLEMS: ProblemContent[] = [
  // ─── Maximum Subarray (LC #53) ─────────────────────────────────────────────
  {
    slug: 'maximum-subarray',
    lcNumber: 53,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    pattern: "Kadane's Algorithm",
    tags: ['array', 'dp'],
    descriptionMd: `Given an integer array \`nums\`, find the contiguous **non-empty** subarray with the
largest sum and return that sum.

Kadane's algorithm walks the array once, keeping a running "best sum that ends at the current
index". At each step you decide whether to extend the previous subarray or start a fresh one
at \`nums[i]\`.`,
    examples: [
      {
        input: 'nums = [-3, 2, 5, -1, 3, -4, 2]',
        output: '9',
        explanation: 'The best subarray is [2, 5, -1, 3] with sum 9.',
      },
      {
        input: 'nums = [-7, -2, -5]',
        output: '-2',
        explanation: 'When every value is negative, the answer is the largest single element.',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^5`',
      '`-10^4 <= nums[i] <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        # Return the largest possible sum of a contiguous non-empty subarray.
        pass
`,
    },
    methodName: 'maxSubArray',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Mixed',       inputJson: '{"nums":[-3,2,5,-1,3,-4,2]}', expectedJson: '9'  },
      { label: 'All negative',inputJson: '{"nums":[-7,-2,-5]}',         expectedJson: '-2' },
      { label: 'Single',      inputJson: '{"nums":[6]}',                expectedJson: '6'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Assign Cookies (LC #455) ──────────────────────────────────────────────
  {
    slug: 'assign-cookies',
    lcNumber: 455,
    title: 'Assign Cookies',
    difficulty: 'Easy',
    pattern: 'Greedy',
    tags: ['greedy', 'sorting'],
    descriptionMd: `You are given an array \`g\` of children's greed factors and an array \`s\` of cookie
sizes. A child with greed \`g[i]\` is satisfied if you give them a cookie with size
\`>= g[i]\`, and each cookie goes to at most one child. Return the **maximum number of
children** you can satisfy.

Sort both arrays, then sweep with two pointers: give the smallest cookie that will satisfy
the greediest-still-unsatisfied child.`,
    examples: [
      {
        input: 'g = [1, 2], s = [1, 2, 3]',
        output: '2',
      },
      {
        input: 'g = [1, 2, 3], s = [1, 1]',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(g) <= 3 * 10^4`',
      '`0 <= len(s) <= 3 * 10^4`',
      '`1 <= g[i], s[j] <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def findContentChildren(self, g: list[int], s: list[int]) -> int:
        # Return the max children that can be satisfied with the cookie sizes.
        pass
`,
    },
    methodName: 'findContentChildren',
    argKeys: ['g', 's'],
    defaultTests: [
      { label: 'Enough cookies', inputJson: '{"g":[1,2],"s":[1,2,3]}',   expectedJson: '2' },
      { label: 'Not enough',     inputJson: '{"g":[1,2,3],"s":[1,1]}',    expectedJson: '1' },
      { label: 'No cookies',     inputJson: '{"g":[1,2],"s":[]}',          expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Can Place Flowers (LC #605) ───────────────────────────────────────────
  {
    slug: 'can-place-flowers',
    lcNumber: 605,
    title: 'Can Place Flowers',
    difficulty: 'Easy',
    pattern: 'Greedy',
    tags: ['greedy', 'array'],
    descriptionMd: `You have a long flowerbed represented by an integer array \`flowerbed\` where
\`0\` is empty and \`1\` is already planted. No two flowers may be adjacent. Return \`True\`
if you can plant exactly \`n\` new flowers without violating the adjacency rule.

The greedy walk: at every empty cell whose neighbours are also empty (or at the edge),
plant a flower and skip the next cell.`,
    examples: [
      {
        input: 'flowerbed = [1, 0, 0, 0, 1], n = 1',
        output: 'True',
      },
      {
        input: 'flowerbed = [1, 0, 0, 0, 1], n = 2',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(flowerbed) <= 2 * 10^4`',
      '`flowerbed[i]` is `0` or `1`.',
      '`0 <= n <= len(flowerbed)`',
    ],
    starterCode: {
      python: `class Solution:
    def canPlaceFlowers(self, flowerbed: list[int], n: int) -> bool:
        # Return True if n new flowers can be planted with no adjacency violations.
        pass
`,
    },
    methodName: 'canPlaceFlowers',
    argKeys: ['flowerbed', 'n'],
    defaultTests: [
      { label: 'One fits',   inputJson: '{"flowerbed":[1,0,0,0,1],"n":1}', expectedJson: 'true'  },
      { label: 'Two no',     inputJson: '{"flowerbed":[1,0,0,0,1],"n":2}', expectedJson: 'false' },
      { label: 'Empty bed',  inputJson: '{"flowerbed":[0,0,0],"n":2}',     expectedJson: 'true'  },
      { label: 'Zero ask',   inputJson: '{"flowerbed":[1],"n":0}',         expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Jump Game (LC #55) ────────────────────────────────────────────────────
  {
    slug: 'jump-game',
    lcNumber: 55,
    title: 'Jump Game',
    difficulty: 'Medium',
    pattern: 'Greedy',
    tags: ['greedy', 'array'],
    descriptionMd: `You are given an integer array \`nums\`. Starting at index 0, \`nums[i]\` is the
maximum jump length you can take from position \`i\`. Return \`True\` if you can reach the
last index, \`False\` otherwise.

The greedy sweep: walk the array left-to-right, tracking the furthest reachable index so
far. If you ever reach an index beyond that bound, return \`False\`.`,
    examples: [
      {
        input: 'nums = [2, 3, 1, 1, 4]',
        output: 'True',
      },
      {
        input: 'nums = [3, 2, 1, 0, 4]',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^4`',
      '`0 <= nums[i] <= 10^5`',
    ],
    starterCode: {
      python: `class Solution:
    def canJump(self, nums: list[int]) -> bool:
        # Return True if the last index is reachable with the given jump lengths.
        pass
`,
    },
    methodName: 'canJump',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Reachable',    inputJson: '{"nums":[2,3,1,1,4]}', expectedJson: 'true'  },
      { label: 'Stuck',        inputJson: '{"nums":[3,2,1,0,4]}', expectedJson: 'false' },
      { label: 'Single',       inputJson: '{"nums":[0]}',          expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Jump Game II (LC #45) ─────────────────────────────────────────────────
  {
    slug: 'jump-game-ii',
    lcNumber: 45,
    title: 'Jump Game II',
    difficulty: 'Medium',
    pattern: 'Greedy',
    tags: ['greedy', 'array'],
    descriptionMd: `You are given an integer array \`nums\` (guaranteed reachable to the end). Return
the **minimum number of jumps** to reach the last index.

The classic greedy sweeps across "levels" — track the current reachable range and the
farthest index any position in that range can reach. When you exhaust the current range,
jump and widen to the new range.`,
    examples: [
      {
        input: 'nums = [2, 3, 1, 1, 4]',
        output: '2',
        explanation: 'Jump 1 from index 0 to 1, then 3 to the last index.',
      },
      {
        input: 'nums = [1, 1, 1, 1]',
        output: '3',
      },
    ],
    constraints: [
      '`1 <= len(nums) <= 10^4`',
      '`0 <= nums[i] <= 1000`',
      'Reaching the last index is guaranteed.',
    ],
    starterCode: {
      python: `class Solution:
    def jump(self, nums: list[int]) -> int:
        # Return the minimum number of jumps to reach the last index.
        pass
`,
    },
    methodName: 'jump',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Classic', inputJson: '{"nums":[2,3,1,1,4]}', expectedJson: '2' },
      { label: 'Ones',    inputJson: '{"nums":[1,1,1,1]}',   expectedJson: '3' },
      { label: 'Single',  inputJson: '{"nums":[0]}',          expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Gas Station (LC #134) ─────────────────────────────────────────────────
  {
    slug: 'gas-station',
    lcNumber: 134,
    title: 'Gas Station',
    difficulty: 'Medium',
    pattern: 'Greedy',
    tags: ['greedy', 'array'],
    descriptionMd: `There are \`n\` gas stations along a circular route. You have \`gas[i]\` gas
available at station \`i\`, and it costs \`cost[i]\` to travel from station \`i\` to station
\`i + 1\`. Given that you start with an empty tank, return the **index** of the starting
station that lets you complete the loop, or \`-1\` if no such station exists.

Key observations: the total answer exists iff \`sum(gas) >= sum(cost)\`. When it does, the
start is the index immediately **after** the point where the running tank dips lowest.`,
    examples: [
      {
        input: 'gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]',
        output: '3',
      },
      {
        input: 'gas = [2, 3, 4], cost = [3, 4, 3]',
        output: '-1',
      },
    ],
    constraints: [
      '`1 <= len(gas) == len(cost) <= 10^5`',
      '`0 <= gas[i], cost[i] <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def canCompleteCircuit(self, gas: list[int], cost: list[int]) -> int:
        # Return a valid starting station index, or -1 if no circuit is possible.
        pass
`,
    },
    methodName: 'canCompleteCircuit',
    argKeys: ['gas', 'cost'],
    defaultTests: [
      { label: 'Possible',   inputJson: '{"gas":[1,2,3,4,5],"cost":[3,4,5,1,2]}', expectedJson: '3'  },
      { label: 'Impossible', inputJson: '{"gas":[2,3,4],"cost":[3,4,3]}',          expectedJson: '-1' },
      { label: 'Single station', inputJson: '{"gas":[5],"cost":[4]}',              expectedJson: '0'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Hand of Straights (LC #846) ───────────────────────────────────────────
  {
    slug: 'hand-of-straights',
    lcNumber: 846,
    title: 'Hand of Straights',
    difficulty: 'Medium',
    pattern: 'Greedy',
    tags: ['greedy', 'hash-map', 'sorting'],
    descriptionMd: `You are given an integer array \`hand\` of card values and an integer \`groupSize\`.
Return \`True\` if you can rearrange the cards into groups of \`groupSize\` cards, each
group consisting of \`groupSize\` **consecutive** values (e.g. \`[4, 5, 6]\` with group
size 3).

The greedy approach: count occurrences, then repeatedly pick the smallest remaining value
as the start of a new group and decrement the counts of the \`groupSize\` consecutive
values. If any drop below zero, return \`False\`.`,
    examples: [
      {
        input: 'hand = [1, 2, 3, 6, 2, 3, 4, 7, 8], groupSize = 3',
        output: 'True',
      },
      {
        input: 'hand = [1, 2, 3, 4, 5], groupSize = 4',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(hand) <= 10^4`',
      '`0 <= hand[i] <= 10^9`',
      '`1 <= groupSize <= len(hand)`',
    ],
    starterCode: {
      python: `class Solution:
    def isNStraightHand(self, hand: list[int], groupSize: int) -> bool:
        # Return True if hand can be partitioned into consecutive runs of groupSize.
        pass
`,
    },
    methodName: 'isNStraightHand',
    argKeys: ['hand', 'groupSize'],
    defaultTests: [
      { label: 'Three groups',  inputJson: '{"hand":[1,2,3,6,2,3,4,7,8],"groupSize":3}', expectedJson: 'true'  },
      { label: 'Bad size',      inputJson: '{"hand":[1,2,3,4,5],"groupSize":4}',          expectedJson: 'false' },
      { label: 'Single card',   inputJson: '{"hand":[7],"groupSize":1}',                  expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Valid Parenthesis String (LC #678) ────────────────────────────────────
  {
    slug: 'valid-parenthesis-string',
    lcNumber: 678,
    title: 'Valid Parenthesis String',
    difficulty: 'Medium',
    pattern: 'Greedy',
    tags: ['greedy', 'string', 'stack'],
    descriptionMd: `Given a string \`s\` containing only \`'('\`, \`')'\`, and \`'*'\`, return \`True\` if
the string can be a valid parenthesis sequence. The \`'*'\` character can act as either
\`'('\`, \`')'\`, or an empty string.

The elegant \`O(n)\` greedy tracks the **range** of possible open-paren counts: \`lo\` (min
possible) and \`hi\` (max possible). On \`'('\` both increment; on \`')'\` both decrement;
on \`'*'\` \`lo\` decrements and \`hi\` increments. If \`hi\` ever dips below 0 it's
invalid; if \`lo\` ever dips below 0 clamp it back. At the end the string is valid iff
\`lo == 0\`.`,
    examples: [
      {
        input: 's = "(*)"',
        output: 'True',
      },
      {
        input: 's = "(*))"',
        output: 'True',
      },
      {
        input: 's = "(("',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 100`',
      '`s` contains only `(`, `)`, and `*`.',
    ],
    starterCode: {
      python: `class Solution:
    def checkValidString(self, s: str) -> bool:
        # Return True if s is a valid parenthesis string after interpreting '*' flexibly.
        pass
`,
    },
    methodName: 'checkValidString',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Star as dot', inputJson: '{"s":"(*)"}',  expectedJson: 'true'  },
      { label: 'Star as close', inputJson: '{"s":"(*))"}', expectedJson: 'true' },
      { label: 'Unmatched',   inputJson: '{"s":"(("}',   expectedJson: 'false' },
      { label: 'Empty',       inputJson: '{"s":"*"}',    expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Partition Labels (LC #763) ────────────────────────────────────────────
  {
    slug: 'partition-labels',
    lcNumber: 763,
    title: 'Partition Labels',
    difficulty: 'Medium',
    pattern: 'Greedy',
    tags: ['greedy', 'string', 'hash-map'],
    descriptionMd: `You are given a string \`s\`. Partition it into **as many parts as possible** so
that each letter appears in **at most one** part. Return the list of part sizes.

The two-pass sweep: first pass records the **last index** each letter appears at; second
pass walks \`s\` extending the current partition's end to the max last-index of any letter
seen so far, and closes a partition whenever the sweep reaches that end.`,
    examples: [
      {
        input: 's = "ababcbacadefegdehijhklij"',
        output: '[9, 7, 8]',
      },
      {
        input: 's = "abc"',
        output: '[1, 1, 1]',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 500`',
      '`s` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def partitionLabels(self, s: str) -> list[int]:
        # Return the sizes of the longest partitioning where no letter spans two parts.
        pass
`,
    },
    methodName: 'partitionLabels',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Classic',  inputJson: '{"s":"ababcbacadefegdehijhklij"}', expectedJson: '[9,7,8]' },
      { label: 'Distinct', inputJson: '{"s":"abc"}',                       expectedJson: '[1,1,1]' },
      { label: 'All same', inputJson: '{"s":"aaaa"}',                      expectedJson: '[4]'     },
    ],
    resultCompare: 'exact',
  },

  // ─── Non-overlapping Intervals (LC #435) ───────────────────────────────────
  {
    slug: 'non-overlapping-intervals',
    lcNumber: 435,
    title: 'Non-overlapping Intervals',
    difficulty: 'Medium',
    pattern: 'Greedy',
    tags: ['greedy', 'intervals'],
    descriptionMd: `Given an array of intervals \`intervals\` where \`intervals[i] = [start, end]\`,
return the **minimum number of intervals you need to remove** to make the rest mutually
non-overlapping.

Sort intervals by their **end** coordinate, then sweep: keep the first interval, and drop
any subsequent interval whose start is before the currently-kept interval's end.`,
    examples: [
      {
        input: 'intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]',
        output: '1',
        explanation: 'Remove [1, 3] — the rest are pairwise non-overlapping.',
      },
      {
        input: 'intervals = [[1, 2], [1, 2], [1, 2]]',
        output: '2',
      },
    ],
    constraints: [
      '`1 <= len(intervals) <= 10^5`',
      '`-5 * 10^4 <= start < end <= 5 * 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        # Return the minimum removals to make the intervals pairwise non-overlapping.
        pass
`,
    },
    methodName: 'eraseOverlapIntervals',
    argKeys: ['intervals'],
    defaultTests: [
      { label: 'Remove one',    inputJson: '{"intervals":[[1,2],[2,3],[3,4],[1,3]]}', expectedJson: '1' },
      { label: 'All same',      inputJson: '{"intervals":[[1,2],[1,2],[1,2]]}',        expectedJson: '2' },
      { label: 'Already clean', inputJson: '{"intervals":[[1,2],[2,3]]}',              expectedJson: '0' },
    ],
    resultCompare: 'exact',
  },

  // ─── Minimum Number of Arrows to Burst Balloons (LC #452) ─────────────────
  {
    slug: 'minimum-number-of-arrows-to-burst-balloons',
    lcNumber: 452,
    title: 'Minimum Number of Arrows to Burst Balloons',
    difficulty: 'Medium',
    pattern: 'Greedy',
    tags: ['greedy', 'intervals'],
    descriptionMd: `Each balloon is an interval \`points[i] = [x_start, x_end]\` on the x-axis. An
arrow shot at a specific \`x\` pops every balloon whose interval contains \`x\` (inclusive
of endpoints). Return the **minimum number of arrows** needed to burst all the balloons.

Sort intervals by their right endpoint. Shoot the first arrow at the first interval's right
edge; skip every subsequent interval that already starts at or before that point, then shoot
another arrow at the next interval's right edge.`,
    examples: [
      {
        input: 'points = [[10, 16], [2, 8], [1, 6], [7, 12]]',
        output: '2',
      },
      {
        input: 'points = [[1, 2]]',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(points) <= 10^5`',
      '`-2^31 <= x_start < x_end <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def findMinArrowShots(self, points: list[list[int]]) -> int:
        # Return the minimum number of arrows needed to pop every balloon interval.
        pass
`,
    },
    methodName: 'findMinArrowShots',
    argKeys: ['points'],
    defaultTests: [
      { label: 'Two arrows', inputJson: '{"points":[[10,16],[2,8],[1,6],[7,12]]}', expectedJson: '2' },
      { label: 'Single',     inputJson: '{"points":[[1,2]]}',                      expectedJson: '1' },
      { label: 'Stacked',    inputJson: '{"points":[[1,3],[2,4],[3,5]]}',          expectedJson: '1' },
    ],
    resultCompare: 'exact',
  },
];
