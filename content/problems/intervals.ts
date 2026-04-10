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
meeting (i.e., no two meetings overlap).

Sort by start time and walk forward: if any meeting starts before the previous one ends, the
answer is \`False\`.`,
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
  },

  // ─── Meeting Rooms II (LC #253) ────────────────────────────────────────────
  {
    slug: 'meeting-rooms-ii',
    lcNumber: 253,
    title: 'Meeting Rooms II',
    difficulty: 'Medium',
    pattern: 'Heap',
    tags: ['intervals', 'heap', 'sorting'],
    descriptionMd: `Given an array of meeting time intervals \`intervals\`, return the **minimum
number of conference rooms** needed so that every meeting can take place.

The elegant solution sorts by start time and uses a min-heap of current room end-times.
When a new meeting starts, if it starts at or after the earliest-ending room's end, reuse
that room (pop from heap); otherwise open a new room. Push the current meeting's end-time.
The answer is the heap size at the end.`,
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
pair of overlapping intervals (touching counts as overlapping) and return the resulting
list of non-overlapping intervals in ascending order of start.

Sort by \`start\`, then walk and either extend the last merged interval's end or append a
new interval.`,
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
  },

  // ─── Insert Interval (LC #57) ──────────────────────────────────────────────
  {
    slug: 'insert-interval',
    lcNumber: 57,
    title: 'Insert Interval',
    difficulty: 'Medium',
    pattern: 'Sweep',
    tags: ['intervals'],
    descriptionMd: `You are given a non-overlapping, sorted list \`intervals\` and a new interval
\`newInterval\`. Insert \`newInterval\` into the list and merge any overlaps so the result
is still non-overlapping and sorted.

Single-pass sweep: copy intervals that end before the new interval starts, merge any that
overlap the new interval (extending its endpoints), then copy intervals that start after the
new interval ends.`,
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
  },

  // ─── Remove Covered Intervals (LC #1288) ───────────────────────────────────
  {
    slug: 'remove-covered-intervals',
    lcNumber: 1288,
    title: 'Remove Covered Intervals',
    difficulty: 'Medium',
    pattern: 'Sort',
    tags: ['intervals', 'sorting'],
    descriptionMd: `Given a list of \`intervals\`, remove every interval that is **covered** by
another (covered means \`start >= other.start\` and \`end <= other.end\`). Return the
number of remaining intervals.

Sort by \`start\` ascending and, on ties, by \`end\` descending. Walk the list tracking the
largest \`end\` seen so far: any interval whose end is \`<=\` that running max is covered.`,
    examples: [
      {
        input: 'intervals = [[1, 4], [3, 6], [2, 8]]',
        output: '2',
        explanation: '[3, 6] is covered by [2, 8]; the other two remain.',
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
  },

  // ─── Interval List Intersections (LC #986) ────────────────────────────────
  {
    slug: 'interval-list-intersections',
    lcNumber: 986,
    title: 'Interval List Intersections',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['intervals', 'two-pointers'],
    descriptionMd: `You are given two lists of intervals, \`firstList\` and \`secondList\`. Each list
is **pairwise disjoint and sorted** by start time. Return the list of intersections of the
two lists, in sorted order.

The two-pointer sweep: compute the overlap of the current pair (\`max(starts), min(ends)\`).
If it's non-empty, add it. Advance the pointer whose interval ends first.`,
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
  },

  // ─── My Calendar I (LC #729) ───────────────────────────────────────────────
  {
    slug: 'my-calendar-i',
    lcNumber: 729,
    title: 'My Calendar I',
    difficulty: 'Medium',
    pattern: 'Design',
    tags: ['intervals', 'design'],
    descriptionMd: `Design a class \`MyCalendar\` that supports \`book(start, end)\`, which adds a
half-open interval \`[start, end)\` **only if** it doesn't overlap any previously-booked
interval. Return \`True\` on success, \`False\` on conflict.

Expose the class behaviour through a driver \`runCalendarOps(ops, vals)\` that instantiates
\`MyCalendar\` and runs every call in order, returning the list of booleans.`,
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
  },

  // ─── Meeting Scheduler (LC #1229) ──────────────────────────────────────────
  {
    slug: 'meeting-scheduler',
    lcNumber: 1229,
    title: 'Meeting Scheduler',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['intervals', 'two-pointers'],
    descriptionMd: `Given two people's free-time lists \`slots1\` and \`slots2\` (each entry is a
\`[start, end]\` interval) and an integer \`duration\`, return the earliest time interval
\`[start, start + duration]\` that is **free for both people**. If no such slot exists,
return the empty list.

Sort both lists by start time, then sweep with two pointers: at every pair compute the
overlap; if its length is \`>= duration\`, return \`[overlap_start, overlap_start + duration]\`.
Otherwise advance the pointer whose interval ends first.`,
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
\`schedule[i]\` is a list of disjoint sorted intervals representing employee \`i\`'s busy
times. Return the list of **finite common free intervals** during which every employee is
free, sorted in ascending order. The answer should not include the time before any employee
has started working or after everyone has finished.

The simplest implementation flattens every interval into a single list, sorts by start,
then merges overlapping busy intervals — the gaps between adjacent merged intervals are
the free slots. A heap-based approach is slightly more efficient but has the same result.`,
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
  },

  // ─── Divide Intervals Into Minimum Number of Groups (LC #2406) ────────────
  {
    slug: 'divide-intervals-into-minimum-number-of-groups',
    lcNumber: 2406,
    title: 'Divide Intervals Into Minimum Number of Groups',
    difficulty: 'Medium',
    pattern: 'Sweep Line',
    tags: ['intervals', 'sweep-line', 'heap'],
    descriptionMd: `Given a list of \`intervals\`, partition them into the **minimum number of
groups** such that no two intervals in the same group overlap. Return the number of groups.

Equivalent to: what is the **maximum number of intervals overlapping at a single point**?
A sweep-line solves it: turn each interval into \`(start, +1)\` and \`(end + 1, -1)\`
events, sort events by time, and track the running overlap count — the maximum is the
answer.`,
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
  },
];
