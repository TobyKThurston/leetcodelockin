// ─── Intervals problems ─────────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const INTERVALS_PROBLEMS: ProblemContent[] = [
  // ─── Meeting Rooms (LC #252) ───────────────────────────────────────────────
  {
    slug: 'meeting-rooms',
    lcNumber: 252,
    title: 'Meeting Rooms',
    difficulty: 'Easy',
    pattern: 'Sort',
    tags: ['intervals', 'sorting'],
    descriptionMd: `Given an array of meeting time intervals \`intervals\` where
\`intervals[i] = [start, end]\`, return \`True\` if a **single** person could attend every
meeting and \`False\` otherwise.

Two meetings overlap if one starts before the other ends.`,
    examples: [
      {
        input: 'intervals = [[1, 3], [5, 8]]',
        output: 'True',
      },
      {
        input: 'intervals = [[1, 5], [2, 4]]',
        output: 'False',
      },
    ],
    constraints: [
      '`0 <= len(intervals) <= 10^4`',
      '`0 <= start < end <= 10^6`',
    ],
    starterCode: {
      python: `class Solution:
    def canAttendMeetings(self, intervals: list[list[int]]) -> bool:
        # Return True if no two meetings overlap.
        pass
`,
    },
    methodName: 'canAttendMeetings',
    argKeys: ['intervals'],
    defaultTests: [
      { label: 'Non-overlapping', inputJson: '{"intervals":[[1,3],[5,8]]}', expectedJson: 'true'  },
      { label: 'Overlapping',     inputJson: '{"intervals":[[1,5],[2,4]]}', expectedJson: 'false' },
      { label: 'Empty',           inputJson: '{"intervals":[]}',             expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sort and Scan',
        intuition: 'Sort meetings by start time and check each consecutive pair. If any meeting starts before the previous one ends, there is a conflict.',
        code: `class Solution:
    def canAttendMeetings(self, intervals: list[list[int]]) -> bool:
        intervals = sorted(intervals, key=lambda x: x[0])
        for i in range(1, len(intervals)):
            if intervals[i][0] < intervals[i - 1][1]:
                return False
        return True`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Meeting Rooms II (LC #253) ────────────────────────────────────────────
  {
    slug: 'meeting-rooms-ii',
    lcNumber: 253,
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    pattern: 'Heap',
    tags: ['intervals', 'heap', 'sorting'],
    descriptionMd: `Given an array of meeting time intervals \`intervals\` where
\`intervals[i] = [start, end]\`, return the **minimum number of conference rooms** needed
so that every meeting can take place.`,
    examples: [
      {
        input: 'intervals = [[0, 30], [5, 10], [15, 20]]',
        output: '2',
      },
      {
        input: 'intervals = [[1, 5], [2, 6]]',
        output: '2',
      },
    ],
    constraints: [
      '`1 <= len(intervals) <= 10^4`',
      '`0 <= start < end <= 10^6`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def minMeetingRooms(self, intervals: list[list[int]]) -> int:
        # Return the minimum number of rooms required to hold every meeting.
        pass
`,
    },
    methodName: 'minMeetingRooms',
    argKeys: ['intervals'],
    defaultTests: [
      { label: 'Three meetings', inputJson: '{"intervals":[[0,30],[5,10],[15,20]]}', expectedJson: '2' },
      { label: 'Two overlap',    inputJson: '{"intervals":[[1,5],[2,6]]}',            expectedJson: '2' },
      { label: 'Single',         inputJson: '{"intervals":[[1,2]]}',                  expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Min-Heap',
        intuition: 'Sort by start time and use a min-heap of room end-times. For each meeting, if it starts after the earliest-ending room, reuse that room (pop). Always push the new end-time. The heap size is the answer.',
        code: `import heapq


class Solution:
    def minMeetingRooms(self, intervals: list[list[int]]) -> int:
        intervals = sorted(intervals, key=lambda x: x[0])
        heap: list[int] = []
        for start, end in intervals:
            if heap and heap[0] <= start:
                heapq.heappop(heap)
            heapq.heappush(heap, end)
        return len(heap)`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Merge Intervals (LC #56) ──────────────────────────────────────────────
  {
    slug: 'merge-intervals',
    lcNumber: 56,
    title: 'Merge Intervals',
    difficulty: 'Medium',
    pattern: 'Sort',
    tags: ['intervals', 'sorting'],
    descriptionMd: `Given an array \`intervals\` where \`intervals[i] = [start, end]\`, merge every
pair of overlapping intervals and return an array of the non-overlapping intervals that
cover all the input intervals.

Two intervals are considered overlapping if they share at least one endpoint (touching
counts as overlapping).`,
    examples: [
      {
        input: 'intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]',
        output: '[[1, 6], [8, 10], [15, 18]]',
      },
      {
        input: 'intervals = [[1, 4], [4, 5]]',
        output: '[[1, 5]]',
      },
    ],
    constraints: [
      '`1 <= len(intervals) <= 10^4`',
      '`0 <= start <= end <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        # Merge every overlapping interval pair and return the result in sorted order.
        pass
`,
    },
    methodName: 'merge',
    argKeys: ['intervals'],
    defaultTests: [
      {
        label: 'Three merges',
        inputJson: '{"intervals":[[1,3],[2,6],[8,10],[15,18]]}',
        expectedJson: '[[1,6],[8,10],[15,18]]',
      },
      { label: 'Touching',   inputJson: '{"intervals":[[1,4],[4,5]]}', expectedJson: '[[1,5]]' },
      { label: 'Single',     inputJson: '{"intervals":[[1,2]]}',        expectedJson: '[[1,2]]' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sort and Merge',
        intuition: 'Sort intervals by start. Walk through and either extend the last merged interval\'s end or append a new one. Two overlapping intervals merge by taking the max end.',
        code: `class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals = sorted(intervals, key=lambda x: x[0])
        out: list[list[int]] = []
        for a, b in intervals:
            if out and a <= out[-1][1]:
                out[-1][1] = max(out[-1][1], b)
            else:
                out.append([a, b])
        return out`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Insert Interval (LC #57) ──────────────────────────────────────────────
  {
    slug: 'insert-interval',
    lcNumber: 57,
    title: 'Insert Interval',
    difficulty: 'Medium',
    pattern: 'Sweep',
    tags: ['intervals'],
    descriptionMd: `You are given an array of non-overlapping intervals \`intervals\` sorted by
start time, and a new interval \`newInterval\`. Insert \`newInterval\` into \`intervals\`
such that the result is still sorted by start time and contains no overlapping intervals
(merging where necessary).

Return the resulting list of intervals.`,
    examples: [
      {
        input: 'intervals = [[1, 3], [6, 9]], newInterval = [2, 5]',
        output: '[[1, 5], [6, 9]]',
      },
      {
        input: 'intervals = [], newInterval = [4, 8]',
        output: '[[4, 8]]',
      },
    ],
    constraints: [
      '`0 <= len(intervals) <= 10^4`',
      '`intervals` is sorted by `start` and non-overlapping.',
    ],
    starterCode: {
      python: `class Solution:
    def insert(self, intervals: list[list[int]], newInterval: list[int]) -> list[list[int]]:
        # Insert newInterval into the sorted non-overlapping list and return the result.
        pass
`,
    },
    methodName: 'insert',
    argKeys: ['intervals', 'newInterval'],
    defaultTests: [
      {
        label: 'Middle merge',
        inputJson: '{"intervals":[[1,3],[6,9]],"newInterval":[2,5]}',
        expectedJson: '[[1,5],[6,9]]',
      },
      {
        label: 'Into empty',
        inputJson: '{"intervals":[],"newInterval":[4,8]}',
        expectedJson: '[[4,8]]',
      },
      {
        label: 'Append',
        inputJson: '{"intervals":[[1,2]],"newInterval":[3,4]}',
        expectedJson: '[[1,2],[3,4]]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Linear Sweep',
        intuition: 'Walk through the sorted list with an index. Copy intervals that end before the new one starts, merge any that overlap the new interval by extending its endpoints, then copy the rest.',
        code: `class Solution:
    def insert(self, intervals: list[list[int]], newInterval: list[int]) -> list[list[int]]:
        out: list[list[int]] = []
        i = 0
        n = len(intervals)
        while i < n and intervals[i][1] < newInterval[0]:
            out.append(intervals[i])
            i += 1
        while i < n and intervals[i][0] <= newInterval[1]:
            newInterval = [min(newInterval[0], intervals[i][0]), max(newInterval[1], intervals[i][1])]
            i += 1
        out.append(newInterval)
        while i < n:
            out.append(intervals[i])
            i += 1
        return out`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Remove Covered Intervals (LC #1288) ───────────────────────────────────
  {
    slug: 'remove-covered-intervals',
    lcNumber: 1288,
    title: 'Remove Covered Intervals',
    difficulty: 'Medium',
    pattern: 'Sort',
    tags: ['intervals', 'sorting'],
    descriptionMd: `Given a list of \`intervals\`, remove all intervals that are **covered** by
another interval in the list, then return the number of remaining intervals.

The interval \`[a, b]\` is covered by \`[c, d]\` if and only if \`c <= a\` and \`b <= d\`.`,
    examples: [
      {
        input: 'intervals = [[1, 4], [3, 6], [2, 8]]',
        output: '2',
        explanation: '`[3, 6]` is covered by `[2, 8]`, so two intervals remain.',
      },
      {
        input: 'intervals = [[1, 2], [1, 4], [3, 4]]',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(intervals) <= 1000`',
      '`0 <= start < end <= 10^5`',
    ],
    starterCode: {
      python: `class Solution:
    def removeCoveredIntervals(self, intervals: list[list[int]]) -> int:
        # Return the count of intervals not covered by any other interval.
        pass
`,
    },
    methodName: 'removeCoveredIntervals',
    argKeys: ['intervals'],
    defaultTests: [
      { label: 'One covered',  inputJson: '{"intervals":[[1,4],[3,6],[2,8]]}', expectedJson: '2' },
      { label: 'Two covered',  inputJson: '{"intervals":[[1,2],[1,4],[3,4]]}', expectedJson: '1' },
      { label: 'None covered', inputJson: '{"intervals":[[1,2],[3,4]]}',       expectedJson: '2' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sort and Track Max End',
        intuition: 'Sort by start ascending, breaking ties by end descending. Walk through tracking the largest end seen. Any interval whose end is within the running max is covered.',
        code: `class Solution:
    def removeCoveredIntervals(self, intervals: list[list[int]]) -> int:
        intervals = sorted(intervals, key=lambda x: (x[0], -x[1]))
        kept = 0
        best_end = 0
        for a, b in intervals:
            if b > best_end:
                kept += 1
                best_end = b
        return kept`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Interval List Intersections (LC #986) ────────────────────────────────
  {
    slug: 'interval-list-intersections',
    lcNumber: 986,
    title: 'Interval List Intersections',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['intervals', 'two-pointers'],
    descriptionMd: `You are given two lists of closed intervals, \`firstList\` and \`secondList\`,
where each list of intervals is **pairwise disjoint and sorted** by start time. Return the
intersection of these two interval lists, in sorted order.

A closed interval \`[a, b]\` (with \`a <= b\`) denotes the set of real numbers \`x\` with
\`a <= x <= b\`. The intersection of two closed intervals is a set of real numbers that is
either empty or a closed interval.`,
    examples: [
      {
        input: 'firstList = [[0, 2], [5, 10]], secondList = [[1, 5], [8, 12]]',
        output: '[[1, 2], [5, 5], [8, 10]]',
      },
      {
        input: 'firstList = [], secondList = [[1, 2]]',
        output: '[]',
      },
    ],
    constraints: [
      '`0 <= len(firstList), len(secondList) <= 1000`',
      'Each list is sorted and pairwise disjoint.',
    ],
    starterCode: {
      python: `class Solution:
    def intervalIntersection(self, firstList: list[list[int]], secondList: list[list[int]]) -> list[list[int]]:
        # Return all overlapping intervals between the two sorted disjoint lists.
        pass
`,
    },
    methodName: 'intervalIntersection',
    argKeys: ['firstList', 'secondList'],
    defaultTests: [
      {
        label: 'Three overlaps',
        inputJson: '{"firstList":[[0,2],[5,10]],"secondList":[[1,5],[8,12]]}',
        expectedJson: '[[1,2],[5,5],[8,10]]',
      },
      {
        label: 'Empty first',
        inputJson: '{"firstList":[],"secondList":[[1,2]]}',
        expectedJson: '[]',
      },
      {
        label: 'No overlap',
        inputJson: '{"firstList":[[1,2]],"secondList":[[3,4]]}',
        expectedJson: '[]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Two Pointers',
        intuition: 'Use two pointers to walk both sorted lists. At each step compute the overlap (max of starts, min of ends). If non-empty, add it. Advance the pointer whose interval ends first.',
        code: `class Solution:
    def intervalIntersection(self, firstList: list[list[int]], secondList: list[list[int]]) -> list[list[int]]:
        i = j = 0
        out: list[list[int]] = []
        while i < len(firstList) and j < len(secondList):
            lo = max(firstList[i][0], secondList[j][0])
            hi = min(firstList[i][1], secondList[j][1])
            if lo <= hi:
                out.append([lo, hi])
            if firstList[i][1] < secondList[j][1]:
                i += 1
            else:
                j += 1
        return out`,
        timeComplexity: 'O(m + n)',
        spaceComplexity: 'O(m + n)',
      },
    ],
  },

  // ─── My Calendar I (LC #729) ───────────────────────────────────────────────
  {
    slug: 'my-calendar-i',
    lcNumber: 729,
    title: 'My Calendar I',
    difficulty: 'Medium',
    pattern: 'Design',
    tags: ['intervals', 'design'],
    descriptionMd: `Implement a \`MyCalendar\` class that stores a collection of bookings without
double-bookings. A new event causes a double booking when it has any non-empty intersection
with an existing event.

Each event is represented as a half-open interval \`[start, end)\`, the range of real
numbers \`x\` such that \`start <= x < end\`. Implement \`book(start, end)\`: if the event
can be added without a double booking, add it and return \`True\`; otherwise return \`False\`
without adding it.

The driver \`runCalendarOps(ops, vals)\` instantiates \`MyCalendar\` and runs every call in
order, returning the list of booleans.`,
    examples: [
      {
        input: 'ops = ["book","book","book"], vals = [[10,20],[15,25],[20,30]]',
        output: '[True, False, True]',
      },
    ],
    constraints: [
      '`1 <= len(ops) <= 1000`',
      '`0 <= start < end <= 10^9`',
    ],
    starterCode: {
      python: `class MyCalendar:
    def __init__(self):
        pass

    def book(self, start: int, end: int) -> bool:
        pass


class Solution:
    def runCalendarOps(self, ops: list[str], vals: list[list[int]]) -> list[bool]:
        cal = MyCalendar()
        out = []
        for op, args in zip(ops, vals):
            out.append(getattr(cal, op)(*args))
        return out
`,
    },
    methodName: 'runCalendarOps',
    argKeys: ['ops', 'vals'],
    defaultTests: [
      {
        label: 'Classic run',
        inputJson: '{"ops":["book","book","book"],"vals":[[10,20],[15,25],[20,30]]}',
        expectedJson: '[true,false,true]',
      },
      {
        label: 'All non-conflicting',
        inputJson: '{"ops":["book","book"],"vals":[[1,5],[5,10]]}',
        expectedJson: '[true,true]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Brute Force (Linear Scan)',
        intuition: 'Store all booked intervals in a list. For each new booking, check against every existing event for overlap. Simple but O(n) per booking.',
        code: `class MyCalendar:
    def __init__(self):
        self.events: list[tuple[int, int]] = []

    def book(self, start: int, end: int) -> bool:
        for s, e in self.events:
            if start < e and s < end:
                return False
        self.events.append((start, end))
        return True


class Solution:
    def runCalendarOps(self, ops: list[str], vals: list[list[int]]) -> list[bool]:
        cal = MyCalendar()
        out: list[bool] = []
        for op, args in zip(ops, vals):
            out.append(getattr(cal, op)(*args))
        return out`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Meeting Scheduler (LC #1229) ──────────────────────────────────────────
  {
    slug: 'meeting-scheduler',
    lcNumber: 1229,
    title: 'Meeting Scheduler',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['intervals', 'two-pointers'],
    descriptionMd: `You are given the availability time slots of two people \`slots1\` and
\`slots2\`, where each slot is a \`[start, end]\` interval, and a meeting \`duration\`.
Return the **earliest** time interval \`[start, start + duration]\` of length \`duration\`
that works for both people.

If there is no common time slot of at least \`duration\` available, return the empty
list.`,
    examples: [
      {
        input: 'slots1 = [[10,50],[60,120]], slots2 = [[0,15],[60,70]], duration = 8',
        output: '[60, 68]',
      },
      {
        input: 'slots1 = [[10,50]], slots2 = [[0,5]], duration = 3',
        output: '[]',
      },
    ],
    constraints: [
      '`1 <= len(slots1), len(slots2) <= 10^4`',
      '`1 <= duration <= 10^6`',
    ],
    starterCode: {
      python: `class Solution:
    def minAvailableDuration(self, slots1: list[list[int]], slots2: list[list[int]], duration: int) -> list[int]:
        # Return the earliest [start, start+duration] slot free for both, or [].
        pass
`,
    },
    methodName: 'minAvailableDuration',
    argKeys: ['slots1', 'slots2', 'duration'],
    defaultTests: [
      {
        label: 'Found',
        inputJson: '{"slots1":[[10,50],[60,120]],"slots2":[[0,15],[60,70]],"duration":8}',
        expectedJson: '[60,68]',
      },
      {
        label: 'Not found',
        inputJson: '{"slots1":[[10,50]],"slots2":[[0,5]],"duration":3}',
        expectedJson: '[]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sort + Two Pointers',
        intuition: 'Sort both slot lists by start time. Use two pointers: compute the overlap of the current pair. If the overlap is >= duration, return it. Otherwise advance the pointer whose slot ends first.',
        code: `class Solution:
    def minAvailableDuration(self, slots1: list[list[int]], slots2: list[list[int]], duration: int) -> list[int]:
        slots1 = sorted(slots1, key=lambda x: x[0])
        slots2 = sorted(slots2, key=lambda x: x[0])
        i = j = 0
        while i < len(slots1) and j < len(slots2):
            lo = max(slots1[i][0], slots2[j][0])
            hi = min(slots1[i][1], slots2[j][1])
            if hi - lo >= duration:
                return [lo, lo + duration]
            if slots1[i][1] < slots2[j][1]:
                i += 1
            else:
                j += 1
        return []`,
        timeComplexity: 'O(n log n + m log m)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Employee Free Time (LC #759) ──────────────────────────────────────────
  {
    slug: 'employee-free-time',
    lcNumber: 759,
    title: 'Employee Free Time',
    difficulty: 'Hard',
    pattern: 'Heap',
    tags: ['intervals', 'heap', 'sorting'],
    descriptionMd: `You are given a list of employee schedules \`schedule\`, where each
\`schedule[i]\` is a list of disjoint, sorted intervals representing employee \`i\`'s busy
times. Return the list of **finite intervals** representing the common free time for
**all** employees, also in sorted order.

The answer should not include the time before any employee has started working or after
every employee has finished.`,
    examples: [
      {
        input: 'schedule = [[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]',
        output: '[[5, 6], [7, 9]]',
      },
      {
        input: 'schedule = [[[1, 5]]]',
        output: '[]',
      },
    ],
    constraints: [
      '`1 <= len(schedule) <= 50`',
      'Each inner list is sorted by start, with disjoint intervals.',
    ],
    starterCode: {
      python: `class Solution:
    def employeeFreeTime(self, schedule: list[list[list[int]]]) -> list[list[int]]:
        # Return the finite common free intervals across all employees.
        pass
`,
    },
    methodName: 'employeeFreeTime',
    argKeys: ['schedule'],
    defaultTests: [
      {
        label: 'Two gaps',
        inputJson: '{"schedule":[[[1,3],[6,7]],[[2,4]],[[2,5],[9,12]]]}',
        expectedJson: '[[5,6],[7,9]]',
      },
      {
        label: 'No gaps',
        inputJson: '{"schedule":[[[1,5]]]}',
        expectedJson: '[]',
      },
      {
        label: 'Single gap',
        inputJson: '{"schedule":[[[1,2],[5,6]]]}',
        expectedJson: '[[2,5]]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Flatten, Sort, Merge, Find Gaps',
        intuition: 'Flatten all employee intervals into one list, sort by start, merge overlapping busy periods, then the gaps between consecutive merged intervals are the common free times.',
        code: `class Solution:
    def employeeFreeTime(self, schedule: list[list[list[int]]]) -> list[list[int]]:
        flat: list[list[int]] = []
        for emp in schedule:
            for iv in emp:
                flat.append(iv)
        flat.sort(key=lambda x: x[0])
        merged: list[list[int]] = []
        for a, b in flat:
            if merged and a <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], b)
            else:
                merged.append([a, b])
        out: list[list[int]] = []
        for i in range(1, len(merged)):
            out.append([merged[i - 1][1], merged[i][0]])
        return out`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Divide Intervals Into Minimum Number of Groups (LC #2406) ────────────
  {
    slug: 'divide-intervals-into-minimum-number-of-groups',
    lcNumber: 2406,
    title: 'Divide Intervals Into Minimum Number of Groups',
    difficulty: 'Medium',
    pattern: 'Sweep Line',
    tags: ['intervals', 'sweep-line', 'heap'],
    descriptionMd: `You are given a 2D integer array \`intervals\` where \`intervals[i] = [left, right]\`
represents the inclusive interval \`[left, right]\`.

You have to divide the intervals into one or more **groups** such that each interval
belongs to exactly one group, and no two intervals in the same group **intersect** each
other. Return the **minimum number of groups** you need to make.

Two intervals intersect if they have at least one common number. For example, \`[1, 5]\`
and \`[5, 8]\` intersect.`,
    examples: [
      {
        input: 'intervals = [[5, 10], [6, 8], [1, 5], [2, 3], [1, 10]]',
        output: '3',
      },
      {
        input: 'intervals = [[1, 3], [5, 6], [8, 10], [11, 13]]',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(intervals) <= 10^5`',
      '`1 <= start <= end <= 10^6`',
    ],
    starterCode: {
      python: `class Solution:
    def minGroups(self, intervals: list[list[int]]) -> int:
        # Return the minimum number of non-overlapping groups covering every interval.
        pass
`,
    },
    methodName: 'minGroups',
    argKeys: ['intervals'],
    defaultTests: [
      { label: 'Three groups', inputJson: '{"intervals":[[5,10],[6,8],[1,5],[2,3],[1,10]]}', expectedJson: '3' },
      { label: 'One group',    inputJson: '{"intervals":[[1,3],[5,6],[8,10],[11,13]]}',       expectedJson: '1' },
      { label: 'Single',       inputJson: '{"intervals":[[1,2]]}',                             expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sweep Line',
        intuition: 'Convert each interval into two events: +1 at start and -1 at end+1. Sort events by time and sweep, tracking the running overlap count. The maximum overlap is the answer.',
        code: `class Solution:
    def minGroups(self, intervals: list[list[int]]) -> int:
        events: list[tuple[int, int]] = []
        for a, b in intervals:
            events.append((a, 1))
            events.append((b + 1, -1))
        events.sort()
        best = cur = 0
        for _, delta in events:
            cur += delta
            if cur > best:
                best = cur
        return best`,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Summary Ranges (LC #228) ───────────────────────────────────────────────
  {
    slug: 'summary-ranges',
    lcNumber: 228,
    title: 'Summary Ranges',
    difficulty: 'Easy',
    pattern: 'Array Scan',
    tags: ['array', 'intervals'],
    descriptionMd: `You are given a **sorted unique** integer array \`nums\`. A **range**
\`[a, b]\` is the set of all integers from \`a\` to \`b\` (inclusive).

Return the **smallest sorted** list of ranges that **cover all the numbers in the array
exactly**. That is, each element of \`nums\` is covered by exactly one of the ranges, and
there is no integer \`x\` such that \`x\` is in one of the ranges but not in \`nums\`.

Each range \`[a, b]\` in the list should be output as:

- \`"a->b"\` if \`a != b\`
- \`"a"\` if \`a == b\``,
    examples: [
      {
        input: 'nums = [0, 1, 2, 4, 5, 7]',
        output: '["0->2", "4->5", "7"]',
      },
      {
        input: 'nums = [0, 2, 3, 4, 6, 8, 9]',
        output: '["0", "2->4", "6", "8->9"]',
      },
    ],
    constraints: [
      '`0 <= len(nums) <= 20`',
      '`-2^31 <= nums[i] <= 2^31 - 1`',
      '`nums` is sorted and all values are unique.',
    ],
    starterCode: {
      python: `class Solution:
    def summaryRanges(self, nums: list[int]) -> list[str]:
        # Return the minimal list of inclusive ranges covering nums.
        pass
`,
    },
    methodName: 'summaryRanges',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Mixed',       inputJson: '{"nums":[0,1,2,4,5,7]}',      expectedJson: '["0->2","4->5","7"]'       },
      { label: 'Four ranges', inputJson: '{"nums":[0,2,3,4,6,8,9]}',    expectedJson: '["0","2->4","6","8->9"]'   },
      { label: 'Empty',       inputJson: '{"nums":[]}',                 expectedJson: '[]'                         },
      { label: 'Single run',  inputJson: '{"nums":[1,2,3,4]}',          expectedJson: '["1->4"]'                   },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Linear Scan',
        intuition: 'Walk the array keeping track of the current run start. When the next number is not exactly one more than the current, emit a range for the run and start a new one.',
        code: `class Solution:
    def summaryRanges(self, nums: list[int]) -> list[str]:
        if not nums:
            return []
        ranges = []
        start = nums[0]
        prev = nums[0]
        for v in nums[1:]:
            if v == prev + 1:
                prev = v
                continue
            ranges.append(str(start) if start == prev else f"{start}->{prev}")
            start = v
            prev = v
        ranges.append(str(start) if start == prev else f"{start}->{prev}")
        return ranges`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },
];
