// ─── Heap / Priority Queue problems ─────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const HEAP_PRIORITY_QUEUE_PROBLEMS: ProblemContent[] = [
  // ─── Kth Largest Element in a Stream (LC #703) ────────────────────────────
  {
    slug: 'kth-largest-element-in-a-stream',
    lcNumber: 703,
    title: 'Kth Largest Element in a Stream',
    difficulty: 'Easy',
    pattern: 'Min Heap',
    tags: ['heap', 'design'],
    descriptionMd: `Design a class \`KthLargest\` to find the \`k\`-th largest element in a stream
of integers. Note that this is the \`k\`-th largest element in sorted order, not the
\`k\`-th distinct element.

- \`KthLargest(k, nums)\` — initialise the object with the integer \`k\` and the stream of
  integers \`nums\`.
- \`add(val)\` — append \`val\` to the stream and return the \`k\`-th largest element
  across all elements seen so far.

Expose the class behaviour through a driver \`runKthLargestOps(k, nums, ops, vals)\` that
constructs the class and runs every operation in order.`,
    examples: [
      {
        input: 'k = 3, nums = [4, 5, 8, 2], ops = ["add","add","add","add"], vals = [[3],[5],[10],[9]]',
        output: '[4, 5, 5, 8]',
      },
    ],
    constraints: [
      '`1 <= k <= 10^4`',
      '`0 <= len(nums) <= 10^4`',
      '`-10^4 <= nums[i], val <= 10^4`',
    ],
    starterCode: {
      python: `import heapq


class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        pass

    def add(self, val: int) -> int:
        pass


class Solution:
    def runKthLargestOps(self, k: int, nums: list[int], ops: list[str], vals: list[list[int]]) -> list[int]:
        kl = KthLargest(k, nums)
        out = []
        for op, args in zip(ops, vals):
            out.append(getattr(kl, op)(*args))
        return out
`,
    },
    methodName: 'runKthLargestOps',
    argKeys: ['k', 'nums', 'ops', 'vals'],
    defaultTests: [
      {
        label: 'Four adds',
        inputJson: '{"k":3,"nums":[4,5,8,2],"ops":["add","add","add","add"],"vals":[[3],[5],[10],[9]]}',
        expectedJson: '[4,5,5,8]',
      },
      {
        label: 'Start empty',
        inputJson: '{"k":1,"nums":[],"ops":["add","add"],"vals":[[5],[10]]}',
        expectedJson: '[5,10]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Min Heap of Size K',
        intuition: 'Maintain a min-heap of size k. On each add, push the value; if the heap exceeds size k, pop the smallest. The heap top is always the k-th largest.',
        code: `import heapq


class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = []
        for v in nums:
            heapq.heappush(self.heap, v)
            if len(self.heap) > self.k:
                heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]


class Solution:
    def runKthLargestOps(self, k: int, nums: list[int], ops: list[str], vals: list[list[int]]) -> list[int]:
        kl = KthLargest(k, nums)
        out = []
        for op, args in zip(ops, vals):
            out.append(getattr(kl, op)(*args))
        return out`,
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(k)',
      },
    ],
  },

  // ─── Last Stone Weight (LC #1046) ─────────────────────────────────────────
  {
    slug: 'last-stone-weight',
    lcNumber: 1046,
    title: 'Last Stone Weight',
    difficulty: 'Easy',
    pattern: 'Max Heap',
    tags: ['heap', 'array'],
    descriptionMd: `You are given an array \`stones\` of positive integer weights. On each turn,
choose the **two heaviest** stones and smash them together. Let their weights be \`a\` and
\`b\` with \`a >= b\`. Then:

- If \`a == b\`, both stones are destroyed.
- If \`a != b\`, the stone of weight \`b\` is destroyed and the stone of weight \`a\` has
  its weight replaced with \`a - b\`.

At the end, there is **at most one** stone remaining. Return the weight of that stone, or
\`0\` if no stones remain.`,
    examples: [
      {
        input: 'stones = [10, 4, 6]',
        output: '0',
        explanation: 'Smash 10 and 6 → 4. Stones now [4, 4]. Smash → 0.',
      },
      {
        input: 'stones = [5]',
        output: '5',
      },
    ],
    constraints: [
      '`0 <= len(stones) <= 30`',
      '`1 <= stones[i] <= 1000`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def lastStoneWeight(self, stones: list[int]) -> int:
        # Repeatedly smash the two heaviest stones; return the final weight (0 if none).
        pass
`,
    },
    methodName: 'lastStoneWeight',
    argKeys: ['stones'],
    defaultTests: [
      { label: 'Two rounds',  inputJson: '{"stones":[10,4,6]}', expectedJson: '0' },
      { label: 'Single',      inputJson: '{"stones":[5]}',      expectedJson: '5' },
      { label: 'Empty',       inputJson: '{"stones":[]}',       expectedJson: '0' },
      { label: 'Equal pair',  inputJson: '{"stones":[2,2]}',    expectedJson: '0' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Max Heap',
        intuition: 'Python only has a min-heap, so negate all values to simulate a max-heap. Repeatedly pop the two largest, and if they differ, push the difference back. Return whatever remains.',
        code: `import heapq


class Solution:
    def lastStoneWeight(self, stones: list[int]) -> int:
        heap = [-s for s in stones]
        heapq.heapify(heap)
        while len(heap) > 1:
            a = -heapq.heappop(heap)
            b = -heapq.heappop(heap)
            if a != b:
                heapq.heappush(heap, -(a - b))
        return -heap[0] if heap else 0`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Kth Largest Element in an Array (LC #215) ────────────────────────────
  {
    slug: 'kth-largest-element-in-an-array',
    lcNumber: 215,
    title: 'Kth Largest Element in an Array',
    difficulty: 'Medium',
    pattern: 'Heap',
    tags: ['heap', 'array', 'quickselect'],
    descriptionMd: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\`-th
**largest** element in the array.

Note that it is the \`k\`-th largest element in **sorted order**, not the \`k\`-th distinct
element.`,
    examples: [
      {
        input: 'nums = [1, 5, 3, 2, 4], k = 3',
        output: '3',
      },
      {
        input: 'nums = [7], k = 1',
        output: '7',
      },
    ],
    constraints: [
      '`1 <= k <= len(nums) <= 10^5`',
      '`-10^4 <= nums[i] <= 10^4`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        # Return the k-th largest value in nums.
        pass
`,
    },
    methodName: 'findKthLargest',
    argKeys: ['nums', 'k'],
    defaultTests: [
      { label: 'Mid',       inputJson: '{"nums":[1,5,3,2,4],"k":3}',  expectedJson: '3'  },
      { label: 'Single',    inputJson: '{"nums":[7],"k":1}',          expectedJson: '7'  },
      { label: 'All equal', inputJson: '{"nums":[10,10,10],"k":2}',    expectedJson: '10' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sorting',
        intuition: 'Sort the array in descending order and return the k-th element. Simple but not optimal.',
        code: `class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        nums.sort(reverse=True)
        return nums[k - 1]`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Min Heap of Size K',
        intuition: 'Maintain a min-heap of size k. Push each element; if the heap exceeds size k, pop the smallest. After processing all elements, the heap top is the k-th largest.',
        code: `import heapq


class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        heap = []
        for v in nums:
            heapq.heappush(heap, v)
            if len(heap) > k:
                heapq.heappop(heap)
        return heap[0]`,
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(k)',
      },
    ],
  },

  // ─── K Closest Points to Origin (LC #973) ─────────────────────────────────
  {
    slug: 'k-closest-points-to-origin',
    lcNumber: 973,
    title: 'K Closest Points to Origin',
    difficulty: 'Medium',
    pattern: 'Heap',
    tags: ['heap', 'array', 'geometry'],
    descriptionMd: `Given an array \`points\` where \`points[i] = [x, y]\` representing points on
the X-Y plane, and an integer \`k\`, return the \`k\` **closest** points to the origin
\`(0, 0)\`.

Distance is measured as the Euclidean distance \`sqrt(x^2 + y^2)\`. You may return the
answer in **any order**; the answer is guaranteed to be unique (except for the order).`,
    examples: [
      {
        input: 'points = [[1, 1], [2, 2], [3, 3]], k = 2',
        output: '[[1, 1], [2, 2]]',
      },
      {
        input: 'points = [[5, -1]], k = 1',
        output: '[[5, -1]]',
      },
    ],
    constraints: [
      '`1 <= k <= len(points) <= 10^4`',
      '`-10^4 <= points[i][0], points[i][1] <= 10^4`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def kClosest(self, points: list[list[int]], k: int) -> list[list[int]]:
        # Return the k points closest to (0, 0) in any order.
        pass
`,
    },
    methodName: 'kClosest',
    argKeys: ['points', 'k'],
    defaultTests: [
      { label: 'Two closest', inputJson: '{"points":[[1,1],[2,2],[3,3]],"k":2}', expectedJson: '[[1,1],[2,2]]' },
      { label: 'Single',      inputJson: '{"points":[[5,-1]],"k":1}',             expectedJson: '[[5,-1]]'      },
      { label: 'Origin',      inputJson: '{"points":[[0,0],[4,4]],"k":1}',        expectedJson: '[[0,0]]'       },
    ],
    // set: order is unspecified; this comparator normalises nested arrays too.
    resultCompare: 'set',
    solutions: [
      {
        approach: 'Sort by Distance',
        intuition: 'Compute the squared distance for each point and sort by it. Return the first k points.',
        code: `class Solution:
    def kClosest(self, points: list[list[int]], k: int) -> list[list[int]]:
        points.sort(key=lambda p: p[0] * p[0] + p[1] * p[1])
        return points[:k]`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Max Heap of Size K',
        intuition: 'Use a max-heap of size k (negate distances). For each point, push it; if the heap exceeds size k, pop the farthest. This avoids sorting the entire array.',
        code: `import heapq


class Solution:
    def kClosest(self, points: list[list[int]], k: int) -> list[list[int]]:
        heap = []
        for x, y in points:
            d = x * x + y * y
            heapq.heappush(heap, (-d, x, y))
            if len(heap) > k:
                heapq.heappop(heap)
        return [[x, y] for _, x, y in heap]`,
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(k)',
      },
    ],
  },

  // ─── Top K Frequent Words (LC #692) ───────────────────────────────────────
  {
    slug: 'top-k-frequent-words',
    lcNumber: 692,
    title: 'Top K Frequent Words',
    difficulty: 'Medium',
    pattern: 'Heap',
    tags: ['heap', 'hash-map', 'sorting'],
    descriptionMd: `Given an array of strings \`words\` and an integer \`k\`, return the \`k\`
**most frequent** strings.

Return the answer sorted by frequency **from highest to lowest**. Break ties by
**lexicographical order**.`,
    examples: [
      {
        input: 'words = ["apple","banana","apple","cherry","banana","apple"], k = 2',
        output: '["apple", "banana"]',
      },
      {
        input: 'words = ["a", "b", "c"], k = 3',
        output: '["a", "b", "c"]',
      },
    ],
    constraints: [
      '`1 <= len(words) <= 500`',
      '`1 <= len(words[i]) <= 10`',
      '`words[i]` consists of lowercase English letters.',
      '`1 <= k <= number of distinct words in words`',
    ],
    starterCode: {
      python: `class Solution:
    def topKFrequent(self, words: list[str], k: int) -> list[str]:
        # Return the k most frequent words, tie-broken alphabetically.
        pass
`,
    },
    methodName: 'topKFrequent',
    argKeys: ['words', 'k'],
    defaultTests: [
      {
        label: 'Two winners',
        inputJson: '{"words":["apple","banana","apple","cherry","banana","apple"],"k":2}',
        expectedJson: '["apple","banana"]',
      },
      {
        label: 'Alphabetical tie',
        inputJson: '{"words":["a","b","c"],"k":3}',
        expectedJson: '["a","b","c"]',
      },
      {
        label: 'Single',
        inputJson: '{"words":["x"],"k":1}',
        expectedJson: '["x"]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sort by (-count, word)',
        intuition: 'Count word frequencies with a hash map. Sort by frequency descending, breaking ties alphabetically. Return the first k.',
        code: `class Solution:
    def topKFrequent(self, words: list[str], k: int) -> list[str]:
        counts = {}
        for w in words:
            counts[w] = counts.get(w, 0) + 1
        ordered = sorted(counts.keys(), key=lambda w: (-counts[w], w))
        return ordered[:k]`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Kth Smallest Element in a Sorted Matrix (LC #378) ────────────────────
  {
    slug: 'kth-smallest-element-in-a-sorted-matrix',
    lcNumber: 378,
    title: 'Kth Smallest Element in a Sorted Matrix',
    difficulty: 'Medium',
    pattern: 'Heap',
    tags: ['heap', 'matrix', 'binary-search'],
    descriptionMd: `Given an \`n x n\` integer \`matrix\` where **each row and each column is
sorted in ascending order**, return the \`k\`-th smallest element in the matrix.

Note that it is the \`k\`-th smallest element in the **sorted order**, not the \`k\`-th
distinct element.`,
    examples: [
      {
        input: 'matrix = [[1, 2], [3, 4]], k = 3',
        output: '3',
      },
      {
        input: 'matrix = [[1]], k = 1',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= n <= 300`',
      '`1 <= k <= n * n`',
      '`matrix[i][j] <= 10^9`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def kthSmallest(self, matrix: list[list[int]], k: int) -> int:
        # Return the k-th smallest value in the row/column-sorted matrix.
        pass
`,
    },
    methodName: 'kthSmallest',
    argKeys: ['matrix', 'k'],
    defaultTests: [
      { label: 'Two by two',   inputJson: '{"matrix":[[1,2],[3,4]],"k":3}',       expectedJson: '3'  },
      { label: 'Single cell',  inputJson: '{"matrix":[[1]],"k":1}',                expectedJson: '1'  },
      { label: 'Three by three',inputJson: '{"matrix":[[1,2,3],[4,5,6],[7,8,9]],"k":5}', expectedJson: '5' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Min Heap (Row Merge)',
        intuition: 'Seed the heap with the first element of each column. Pop the smallest, then push the element below it from the same column. After k pops, we have the answer.',
        code: `import heapq


class Solution:
    def kthSmallest(self, matrix: list[list[int]], k: int) -> int:
        n = len(matrix)
        heap = [(matrix[0][c], 0, c) for c in range(n)]
        heapq.heapify(heap)
        for _ in range(k - 1):
            val, r, c = heapq.heappop(heap)
            if r + 1 < n:
                heapq.heappush(heap, (matrix[r + 1][c], r + 1, c))
        return heap[0][0]`,
        timeComplexity: 'O(k log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Task Scheduler (LC #621) ─────────────────────────────────────────────
  {
    slug: 'task-scheduler',
    lcNumber: 621,
    title: 'Task Scheduler',
    difficulty: 'Medium',
    pattern: 'Greedy + Heap',
    tags: ['heap', 'greedy', 'hash-map'],
    descriptionMd: `You are given an array of CPU \`tasks\`, each represented by a letter, and a
non-negative integer \`n\`. Each task takes one unit of time to complete. At each unit of
time, the CPU can either complete one task or stay idle.

However, there is a cooldown: two executions of the **same** task must be separated by at
least \`n\` units of time (during which the CPU can run other tasks or stay idle).

Return the **minimum number of time units** the CPU will take to finish all the given
tasks.`,
    examples: [
      {
        input: 'tasks = ["A","A","A","B","B"], n = 2',
        output: '7',
        explanation: 'Schedule A B _ A B _ A → 7 units.',
      },
      {
        input: 'tasks = ["A","A"], n = 0',
        output: '2',
      },
    ],
    constraints: [
      '`1 <= len(tasks) <= 10^4`',
      'Each task is an uppercase English letter.',
      '`0 <= n <= 100`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def leastInterval(self, tasks: list[str], n: int) -> int:
        # Return the minimum number of time units required to run every task.
        pass
`,
    },
    methodName: 'leastInterval',
    argKeys: ['tasks', 'n'],
    defaultTests: [
      { label: 'With idle',    inputJson: '{"tasks":["A","A","A","B","B"],"n":2}', expectedJson: '7' },
      { label: 'No cooldown',  inputJson: '{"tasks":["A","A"],"n":0}',              expectedJson: '2' },
      { label: 'Single task',  inputJson: '{"tasks":["A"],"n":5}',                  expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Greedy Formula',
        intuition: 'The answer is determined by the most frequent task. Create (maxCount - 1) groups of size (n + 1), then add the tasks that have maxCount. The total is at least len(tasks).',
        code: `class Solution:
    def leastInterval(self, tasks: list[str], n: int) -> int:
        counts = {}
        for t in tasks:
            counts[t] = counts.get(t, 0) + 1
        max_count = max(counts.values())
        count_of_max = sum(1 for c in counts.values() if c == max_count)
        formula = (max_count - 1) * (n + 1) + count_of_max
        return max(len(tasks), formula)`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Reorganize String (LC #767) ──────────────────────────────────────────
  {
    slug: 'reorganize-string',
    lcNumber: 767,
    title: 'Reorganize String',
    difficulty: 'Medium',
    pattern: 'Greedy + Heap',
    tags: ['heap', 'greedy', 'string'],
    descriptionMd: `Given a string \`s\`, rearrange the characters of \`s\` so that **no two
adjacent characters are the same**. Return any valid reordering, or return the empty string
\`""\` if no valid reordering exists.

> Note: there may be more than one valid answer. Our tests pick inputs whose canonical
> output is uniquely determined (or trivially \`""\` / unchanged), so any correct
> implementation matches.`,
    examples: [
      {
        input: 's = "aab"',
        output: '"aba"',
      },
      {
        input: 's = "aaab"',
        output: '""',
        explanation: 'Three a\'s in four slots forces two a\'s to touch.',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 500`',
      '`s` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def reorganizeString(self, s: str) -> str:
        # Rearrange s so no two adjacent chars are equal, or return "" if impossible.
        pass
`,
    },
    methodName: 'reorganizeString',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Classic',     inputJson: '{"s":"aab"}',  expectedJson: '"aba"' },
      { label: 'Impossible',  inputJson: '{"s":"aaab"}', expectedJson: '""'    },
      { label: 'Single char', inputJson: '{"s":"a"}',    expectedJson: '"a"'   },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Greedy Max Heap',
        intuition: 'Check if it is possible (most frequent char count <= (n+1)//2). Then greedily pop the two most frequent characters from a max-heap, append both, decrement counts, and push back. This guarantees no two adjacent characters are the same.',
        code: `import heapq


class Solution:
    def reorganizeString(self, s: str) -> str:
        counts = {}
        for ch in s:
            counts[ch] = counts.get(ch, 0) + 1
        n = len(s)
        if max(counts.values()) > (n + 1) // 2:
            return ""
        heap = [(-c, ch) for ch, c in counts.items()]
        heapq.heapify(heap)
        out = []
        while len(heap) >= 2:
            c1, ch1 = heapq.heappop(heap)
            c2, ch2 = heapq.heappop(heap)
            out.append(ch1)
            out.append(ch2)
            if c1 + 1 < 0:
                heapq.heappush(heap, (c1 + 1, ch1))
            if c2 + 1 < 0:
                heapq.heappush(heap, (c2 + 1, ch2))
        if heap:
            out.append(heap[0][1])
        return ''.join(out)`,
        timeComplexity: 'O(n log k)',
        spaceComplexity: 'O(k)',
      },
    ],
  },

  // ─── Find Median from Data Stream (LC #295) ───────────────────────────────
  {
    slug: 'find-median-from-data-stream',
    lcNumber: 295,
    title: 'Find Median from Data Stream',
    difficulty: 'Hard',
    pattern: 'Two Heaps',
    tags: ['heap', 'design'],
    descriptionMd: `The **median** is the middle value in an ordered integer list. If the size
of the list is even, there is no middle value, and the median is the average of the two
middle values.

Design a class \`MedianFinder\` supporting:

- \`addNum(num)\` — add the integer \`num\` from the data stream to the data structure.
- \`findMedian()\` — return the median of all elements so far, as a float.

Expose the class through a driver \`runMedianOps(ops, vals)\`.`,
    examples: [
      {
        input: 'ops = ["addNum","addNum","findMedian","addNum","findMedian"], vals = [[1],[2],[],[3],[]]',
        output: '[None, None, 1.5, None, 2.0]',
      },
    ],
    constraints: [
      '`1 <= len(ops) <= 5 * 10^4`',
      '`-10^5 <= num <= 10^5`',
      '`findMedian` is not called before at least one `addNum`.',
    ],
    starterCode: {
      python: `import heapq


class MedianFinder:
    def __init__(self):
        pass

    def addNum(self, num: int) -> None:
        pass

    def findMedian(self) -> float:
        pass


class Solution:
    def runMedianOps(self, ops: list[str], vals: list[list[int]]) -> list:
        mf = MedianFinder()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(mf, op)(*args)
            out.append(result)
        return out
`,
    },
    methodName: 'runMedianOps',
    argKeys: ['ops', 'vals'],
    defaultTests: [
      {
        label: 'Classic',
        inputJson: '{"ops":["addNum","addNum","findMedian","addNum","findMedian"],"vals":[[1],[2],[],[3],[]]}',
        expectedJson: '[null,null,1.5,null,2.0]',
      },
      {
        label: 'Single value',
        inputJson: '{"ops":["addNum","findMedian"],"vals":[[7],[]]}',
        expectedJson: '[null,7.0]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Two Heaps',
        intuition: 'Keep a max-heap for the lower half and a min-heap for the upper half. On each add, push to lower first, then rebalance so the heaps stay within 1 element of each other. The median is either the top of the larger heap (odd count) or the average of both tops (even count).',
        code: `import heapq


class MedianFinder:
    def __init__(self):
        self.lower = []  # max-heap (store negated)
        self.upper = []  # min-heap

    def addNum(self, num: int) -> None:
        heapq.heappush(self.lower, -num)
        heapq.heappush(self.upper, -heapq.heappop(self.lower))
        if len(self.upper) > len(self.lower):
            heapq.heappush(self.lower, -heapq.heappop(self.upper))

    def findMedian(self) -> float:
        if len(self.lower) > len(self.upper):
            return float(-self.lower[0])
        return (-self.lower[0] + self.upper[0]) / 2


class Solution:
    def runMedianOps(self, ops: list[str], vals: list[list[int]]) -> list:
        mf = MedianFinder()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(mf, op)(*args)
            out.append(result)
        return out`,
        timeComplexity: 'O(log n) per add',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Find K Pairs with Smallest Sums (LC #373) ────────────────────────────
  {
    slug: 'find-k-pairs-with-smallest-sums',
    lcNumber: 373,
    title: 'Find K Pairs with Smallest Sums',
    difficulty: 'Medium',
    pattern: 'Heap',
    tags: ['heap', 'array'],
    descriptionMd: `You are given two integer arrays \`nums1\` and \`nums2\` sorted in
non-decreasing order and an integer \`k\`.

Define a pair \`[u, v]\` which consists of one element from \`nums1\` and one element from
\`nums2\`. Return the \`k\` pairs \`[u_1, v_1], [u_2, v_2], ...\` with the **smallest sums**.
You may return the pairs in any order.`,
    examples: [
      {
        input: 'nums1 = [1, 2], nums2 = [3], k = 2',
        output: '[[1, 3], [2, 3]]',
      },
      {
        input: 'nums1 = [1], nums2 = [1], k = 1',
        output: '[[1, 1]]',
      },
    ],
    constraints: [
      '`1 <= len(nums1), len(nums2) <= 10^5`',
      '`-10^9 <= nums1[i], nums2[i] <= 10^9`',
      '`1 <= k <= 10^4`',
      '`nums1` and `nums2` are sorted in non-decreasing order.',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def kSmallestPairs(self, nums1: list[int], nums2: list[int], k: int) -> list[list[int]]:
        # Return k pairs (a, b) with the smallest a + b values.
        pass
`,
    },
    methodName: 'kSmallestPairs',
    argKeys: ['nums1', 'nums2', 'k'],
    defaultTests: [
      { label: 'Small set', inputJson: '{"nums1":[1,2],"nums2":[3],"k":2}',   expectedJson: '[[1,3],[2,3]]' },
      { label: 'Singletons',inputJson: '{"nums1":[1],"nums2":[1],"k":1}',     expectedJson: '[[1,1]]'       },
      { label: 'More wanted',inputJson: '{"nums1":[1,7],"nums2":[2,4],"k":3}', expectedJson: '[[1,2],[1,4],[7,2]]' },
    ],
    resultCompare: 'set',
    solutions: [
      {
        approach: 'Min Heap',
        intuition: 'Seed the heap with pairs (nums1[i] + nums2[0], i, 0) for the first min(k, len(nums1)) indices. On each pop, push the next pair from the same row (i, j+1). After k pops we have the answer.',
        code: `import heapq


class Solution:
    def kSmallestPairs(self, nums1: list[int], nums2: list[int], k: int) -> list[list[int]]:
        if not nums1 or not nums2 or k == 0:
            return []
        heap = []
        for i in range(min(k, len(nums1))):
            heapq.heappush(heap, (nums1[i] + nums2[0], i, 0))
        out = []
        while heap and len(out) < k:
            s, i, j = heapq.heappop(heap)
            out.append([nums1[i], nums2[j]])
            if j + 1 < len(nums2):
                heapq.heappush(heap, (nums1[i] + nums2[j + 1], i, j + 1))
        return out`,
        timeComplexity: 'O(k log k)',
        spaceComplexity: 'O(k)',
      },
    ],
  },

  // ─── IPO (LC #502) ─────────────────────────────────────────────────────────
  {
    slug: 'ipo',
    lcNumber: 502,
    title: 'IPO',
    difficulty: 'Hard',
    pattern: 'Greedy + Heap',
    tags: ['heap', 'greedy'],
    descriptionMd: `Suppose your startup wants to do an IPO. You have \`w\` initial capital and
can complete at most \`k\` distinct projects before the IPO. Each project \`i\` requires at
least \`capital[i]\` capital to start and, once completed, rewards you with \`profits[i]\`
(added to your total capital).

Pick a list of at most \`k\` distinct projects to **maximize your final capital**, and
return this maximized capital. Once you complete a project, you cannot complete it again,
and the profit is added to your capital so it can be used to fund subsequent projects.`,
    examples: [
      {
        input: 'k = 2, w = 0, profits = [1, 2, 3], capital = [0, 1, 1]',
        output: '4',
        explanation: 'Start with 0. Only project 0 is affordable (capital 0), profit 1 → w = 1. Now projects 1 and 2 affordable (capital 1). Take the bigger: 3 → w = 4.',
      },
      {
        input: 'k = 1, w = 10, profits = [100], capital = [5]',
        output: '110',
      },
    ],
    constraints: [
      '`1 <= k <= 10^5`',
      '`0 <= w <= 10^9`',
      '`1 <= len(profits) == len(capital) <= 10^5`',
      '`0 <= profits[i], capital[i] <= 10^9`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: list[int], capital: list[int]) -> int:
        # Return the max final capital after up to k projects.
        pass
`,
    },
    methodName: 'findMaximizedCapital',
    argKeys: ['k', 'w', 'profits', 'capital'],
    defaultTests: [
      { label: 'Gated projects', inputJson: '{"k":2,"w":0,"profits":[1,2,3],"capital":[0,1,1]}', expectedJson: '4' },
      { label: 'Rich start',     inputJson: '{"k":1,"w":10,"profits":[100],"capital":[5]}',      expectedJson: '110' },
      { label: 'Too poor',       inputJson: '{"k":1,"w":0,"profits":[100],"capital":[5]}',       expectedJson: '0' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Greedy + Two Heaps',
        intuition: 'Sort projects by required capital. Use a min-heap of projects sorted by capital cost and a max-heap of profits for affordable projects. Each round, move all newly-affordable projects to the profit heap, then greedily pick the most profitable one.',
        code: `import heapq


class Solution:
    def findMaximizedCapital(self, k: int, w: int, profits: list[int], capital: list[int]) -> int:
        projects = sorted(zip(capital, profits))
        available = []
        i = 0
        n = len(projects)
        for _ in range(k):
            while i < n and projects[i][0] <= w:
                heapq.heappush(available, -projects[i][1])
                i += 1
            if not available:
                break
            w += -heapq.heappop(available)
        return w`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Relative Ranks (LC #506) ───────────────────────────────────────────────
  {
    slug: 'relative-ranks',
    lcNumber: 506,
    title: 'Relative Ranks',
    difficulty: 'Easy',
    pattern: 'Heap / Sorting',
    tags: ['array', 'heap', 'sorting'],
    descriptionMd: `You are given an integer array \`score\` of size \`n\`, where \`score[i]\` is
the score of the \`i\`-th athlete in a competition. All the scores are **unique**.

The athletes are placed based on their scores, where the \`1\`st place athlete has the
highest score, the \`2\`nd place athlete has the second highest, and so on. The placement
of each athlete determines their **rank label**:

- The \`1\`st place athlete's rank is \`"Gold Medal"\`.
- The \`2\`nd place athlete's rank is \`"Silver Medal"\`.
- The \`3\`rd place athlete's rank is \`"Bronze Medal"\`.
- For the \`i\`-th place athlete (\`i > 3\`), their rank is the string \`"i"\`.

Return an array \`answer\` of size \`n\` where \`answer[i]\` is the rank label for the
\`i\`-th athlete.`,
    examples: [
      {
        input: 'score = [5, 4, 3, 2, 1]',
        output: '["Gold Medal", "Silver Medal", "Bronze Medal", "4", "5"]',
      },
      {
        input: 'score = [10, 3, 8, 9, 4]',
        output: '["Gold Medal", "5", "Bronze Medal", "Silver Medal", "4"]',
      },
    ],
    constraints: [
      '`1 <= n <= 10^4`',
      '`0 <= score[i] <= 10^6`',
      'All values in `score` are unique.',
    ],
    starterCode: {
      python: `class Solution:
    def findRelativeRanks(self, score: list[int]) -> list[str]:
        # Return the placement label for each athlete in original order.
        pass
`,
    },
    methodName: 'findRelativeRanks',
    argKeys: ['score'],
    defaultTests: [
      { label: 'Descending',   inputJson: '{"score":[5,4,3,2,1]}',    expectedJson: '["Gold Medal","Silver Medal","Bronze Medal","4","5"]' },
      { label: 'Shuffled',     inputJson: '{"score":[10,3,8,9,4]}',   expectedJson: '["Gold Medal","5","Bronze Medal","Silver Medal","4"]' },
      { label: 'Single',       inputJson: '{"score":[42]}',           expectedJson: '["Gold Medal"]'                                        },
      { label: 'Two athletes', inputJson: '{"score":[1,2]}',          expectedJson: '["Silver Medal","Gold Medal"]'                         },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sort by Score Descending',
        intuition: 'Pair each score with its original index, sort in descending order of score, then walk the sorted list assigning labels "Gold Medal", "Silver Medal", "Bronze Medal", "4", "5", ... back into the answer at the original index.',
        code: `class Solution:
    def findRelativeRanks(self, score: list[int]) -> list[str]:
        labels = ["Gold Medal", "Silver Medal", "Bronze Medal"]
        order = sorted(range(len(score)), key=lambda i: -score[i])
        ans = [""] * len(score)
        for place, idx in enumerate(order):
            ans[idx] = labels[place] if place < 3 else str(place + 1)
        return ans`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },
];
