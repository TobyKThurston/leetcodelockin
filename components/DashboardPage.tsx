'use client';

import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { ChevronLeft, BookOpen, Target, CheckCircle2, Lock, ArrowRight, Zap, Flame, Snowflake, AlertTriangle, Trophy, Crown, Shield, Swords, Sparkles, Brain, Star, Medal } from 'lucide-react';
import type { WeaknessSpotlight } from '@/lib/weaknesses';
import { CURRICULUM, type PathDef, type BlockDef, type CurriculumStep, type PracticeStepDef, isLesson, isPractice } from '@/lib/curriculum';
import { setBlockCompleted } from '@/lib/progress';
import ReviewDueWidget from '@/components/ReviewDueWidget';
import DashboardUpgradeBanner from '@/components/DashboardUpgradeBanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useStreakFreeze, type StreakData, type HeatmapDay } from '@/lib/streaks';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import AppShell from '@/components/shell/AppShell';
import ShellSidebar from '@/components/shell/ShellSidebar';
import ShellRail from '@/components/shell/ShellRail';
import PageHeader from '@/components/shell/PageHeader';
import MainSurface from '@/components/shell/MainSurface';
import { RailHeader, MetricRow, Metric, RAIL_BOX } from '@/components/shell/RailPrimitives';
import { C, SG, MONO_FONT } from '@/lib/ui-tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockStatus = 'locked' | 'available' | 'active' | 'complete';
export type PathStatus  = 'locked' | 'unlocked' | 'complete';

type BlockWithStatus = CurriculumStep & { blockStatus: BlockStatus };

// ─── Curriculum helpers ───────────────────────────────────────────────────────

export function computePathStatuses(completedIds: Set<string>): Record<string, PathStatus> {
  const result: Record<string, PathStatus> = {};
  for (const path of CURRICULUM) {
    const allDone = path.blocks.every(b => completedIds.has(b.id));
    result[path.id] = allDone ? 'complete' : 'unlocked';
  }
  return result;
}

// ─── Practice card sizing ────────────────────────────────────────────────────
const PRACTICE_W      = 200;
const PRACTICE_H      = 72;
const PRACTICE_ROW_H  = 140;  // 72px card + 68px gap

function getBlocksWithStatus(
  path: PathDef,
  pathStatus: PathStatus,
  completedIds: Set<string>,
): BlockWithStatus[] {
  let nextAssigned = false;
  return path.blocks.map(block => {
    if (pathStatus === 'locked') return { ...block, blockStatus: 'locked' as BlockStatus };
    if (completedIds.has(block.id)) return { ...block, blockStatus: 'complete' as BlockStatus };
    if (!nextAssigned) { nextAssigned = true; return { ...block, blockStatus: 'active' as BlockStatus }; }
    return { ...block, blockStatus: 'available' as BlockStatus };
  });
}

// ─── Lesson preview data ──────────────────────────────────────────────────────

interface LessonPreview {
  concept: string;
  code: string;
  breakdown: string;
  remember?: string[];
  quiz: {
    setup: string;
    question: string;
    opts: [string, string];
    correct: 0 | 1;
  };
}

const LESSON_PREVIEWS: Record<string, LessonPreview> = {
  'p1-variables': {
    concept: "Python has 5 core types you will use in almost every LeetCode problem. You do not declare types. You just assign a value and Python figures it out for you.",
    code: `x     = 42          # int
name  = "alice"     # str
found = True        # bool
nums  = [1, 2, 3]   # list
val   = None        # None

type(x)      # <class 'int'>
type(name)   # <class 'str'>`,
    breakdown: "type(x) returns the class of a value. You will rarely call it in a real solution, but you must be able to recognize these 5 types on sight.",
    remember: [
      "int, float, str, bool, list, and None are the types you will use 95% of the time.",
      "You never declare a type. Just write x = 42 and Python handles the rest.",
      "None is Python's version of null. Test for it with 'is None', not '== None'.",
      "Strings use single or double quotes. Both are fine. Be consistent.",
    ],
    quiz: {
      setup: `x = "hello"\ntype(x)`,
      question: 'What does type(x) return?',
      opts: ["<class 'int'>", "<class 'str'>"],
      correct: 1,
    },
  },
  'p1-operators': {
    concept: "Operators let you do math, compare values, and chain conditions together. You will use arithmetic, comparison, and logical operators in every single problem you write.",
    code: `x = 10
x + 3    # 13
x - 3    # 7
x // 3   # 3    floor division, rounds down
x % 3    # 1    remainder

x == 10         # True
x > 5 and x < 20   # True
x += 1          # x is now 11`,
    breakdown: "10 // 3 gives 3, not 3.333. Floor division throws away the decimal. You will use it all the time, for example to find the midpoint in binary search: mid = (lo + hi) // 2.",
    remember: [
      "// is integer division. / is normal (float) division.",
      "% gives the remainder. 10 % 3 is 1.",
      "== compares values. = assigns a value. Mixing them up is the number one Python bug.",
      "Python uses the words and, or, not. It does NOT use && || ! like other languages.",
    ],
    quiz: {
      setup: `x = 7\nx < 5`,
      question: 'What does this evaluate to?',
      opts: ['True', 'False'],
      correct: 1,
    },
  },
  'p1-conditionals': {
    concept: "Python uses indentation (4 spaces) to show which lines belong together. There are no curly braces. if, elif, and else let your code take different paths based on what is true.",
    code: `if x > 0:
    print("positive")
elif x < 0:
    print("negative")
else:
    print("zero")

# Falsy values: 0, "", [], None, {}, set()
def solution(nums):
    if not nums:   # guards against empty input
        return []`,
    breakdown: "if not nums: is the idiomatic Python way to check for an empty list. An empty list [] counts as False in a boolean context, so 'not []' is True. You will write this guard at the top of almost every list problem.",
    remember: [
      "Use exactly 4 spaces for indentation. Never mix tabs and spaces.",
      "Falsy values in Python: 0, '', [], {}, set(), None. All count as False.",
      "Check for empty with 'if not nums:' instead of 'if len(nums) == 0:'.",
      "elif is Python's else-if. You can chain as many as you need.",
    ],
    quiz: {
      setup: `nums = []\nnot nums`,
      question: 'What does this evaluate to?',
      opts: ['True', 'False'],
      correct: 0,
    },
  },
  'p1-loops': {
    concept: "Python for loops walk directly over a list or string. You do not manage the index yourself. Use range() when you only need numbers, and enumerate() when you need both the index and the value.",
    code: `for i in range(5):          # 0, 1, 2, 3, 4
for i in range(1, 5):       # 1, 2, 3, 4
for i in range(4, -1, -1):  # 4, 3, 2, 1, 0

nums = [10, 20, 30]
for i, num in enumerate(nums):
    print(i, num)   # 0 10  /  1 20  /  2 30`,
    breakdown: "enumerate(nums) is cleaner than for i in range(len(nums)). You get the index and the value together. Less noise, and far fewer off-by-one mistakes.",
    remember: [
      "for n in nums loops over values only.",
      "for i in range(len(nums)) loops over indices only.",
      "for i, n in enumerate(nums) loops over both. Prefer this when you need the index.",
      "range(a, b) stops BEFORE b. The end is not included.",
      "break exits the loop immediately. continue skips to the next iteration.",
    ],
    quiz: {
      setup: `list(range(3))`,
      question: 'What does this produce?',
      opts: ['[1, 2, 3]', '[0, 1, 2]'],
      correct: 1,
    },
  },
  'p1-functions': {
    concept: "Every LeetCode solution is a method inside class Solution. def creates a function. You list the parameters, write the body, and use return to send the result back.",
    code: `def add(a, b):
    return a + b

result = add(3, 4)   # 7

# LeetCode always wraps your logic in a class
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        pass   # your logic here`,
    breakdown: "class Solution is a wrapper that LeetCode requires. Your actual logic goes inside the method body. self is boilerplate. Ignore it and focus on the real parameters.",
    remember: [
      "return sends a value back and ends the function.",
      "A function with no return statement returns None.",
      "On LeetCode, always put your code inside the method of class Solution.",
      "self is always the first parameter of a method, but you never pass it yourself when calling.",
      "Type hints like nums: list[int] are optional but help readability.",
    ],
    quiz: {
      setup: `def add(a, b):\n    return a + b\nadd(3, 4)`,
      question: 'What does add(3, 4) return?',
      opts: ['7', '34'],
      correct: 0,
    },
  },
  'p1-lists': {
    concept: "Lists are Python's most-used data structure. They are ordered, mutable, and iterable. Lists show up in about 80% of LeetCode problems, so indexing and slicing must be second nature.",
    code: `nums = [1, 2, 3, 4, 5]
nums[0]     # 1      first element
nums[-1]    # 5      last element
nums[-2]    # 4      second to last
nums[1:3]   # [2,3]  slice, end index is excluded
nums[::-1]  # [5,4,3,2,1]  reversed copy

nums.append(6)   # O(1), adds to end
nums.pop()       # O(1), removes from end`,
    breakdown: "Negative indices count from the end of the list. nums[-1] is the last item, nums[-2] is the one before it. You never need to write len(nums) - 1.",
    remember: [
      "nums[0] is the first element. nums[-1] is the last.",
      "nums[i:j] is a slice from i up to but NOT including j.",
      "nums.append(x) adds to the end in O(1). nums.pop() removes from the end in O(1).",
      "nums.pop(0) removes from the FRONT but is O(n). Avoid it. Use deque if you need front removal.",
      "len(nums) gives the number of elements.",
      "nums[::-1] returns a reversed COPY without changing the original.",
    ],
    quiz: {
      setup: `nums = [1, 2, 3, 4, 5]\nnums[-2]`,
      question: 'What does nums[-2] return?',
      opts: ['3', '4'],
      correct: 1,
    },
  },
  'p1-dicts': {
    concept: "Dicts give you O(1) key lookup. Sets give you O(1) membership check. Together they turn brute-force O(n²) solutions into O(n). This is the single biggest speedup in your toolkit.",
    code: `# Frequency count, appears in dozens of problems
freq = {}
for n in [1, 2, 1, 3]:
    freq[n] = freq.get(n, 0) + 1
# freq is now {1: 2, 2: 1, 3: 1}

# Set: O(1) lookup, no duplicates
seen = set()
seen.add(5)
5 in seen    # True`,
    breakdown: "freq.get(n, 0) + 1 handles the first occurrence with no extra if-check. .get() returns 0 if the key is missing, then we add 1. It is much cleaner than checking 'if n in freq' first.",
    remember: [
      "freq = {} creates an empty dict. set() creates an empty set. {} alone is a dict, not a set.",
      "'x in d' on a dict checks if a KEY exists. It is O(1).",
      "'x in s' on a set checks membership. It is O(1).",
      "d.get(key, default) returns the default if the key is missing instead of crashing.",
      "Use a dict when you need key-to-value mapping. Use a set when you only need membership.",
    ],
    quiz: {
      setup: `d = {}\nd.get("x", 0)`,
      question: 'What does d.get("x", 0) return?',
      opts: ['KeyError', '0'],
      correct: 1,
    },
  },
  'p1-solve': {
    concept: "Put it all together. Read the problem. Trace the example by hand. Pick the data structure you need. Then write the function body.",
    code: `# Two Sum: find indices of two numbers that add to target
class Solution:
    def twoSum(self, nums, target):
        seen = {}
        for i, n in enumerate(nums):
            complement = target - n
            if complement in seen:
                return [seen[complement], i]
            seen[n] = i`,
    breakdown: "For each number n, ask: have I already seen (target - n)? If yes, we found the pair. Storing the index as the value (seen[n] = i) lets us return the indices right away. One pass, O(n) time.",
    remember: [
      "Always read the problem twice and look at the example before you write any code.",
      "Walk through the example on paper first, then code what you just did by hand.",
      "Two Sum with a hash map is the canonical O(n) pattern. Know it cold.",
      "Two Sum asks for INDICES, not values. Return [i, j], not [nums[i], nums[j]].",
      "When in doubt, start with an empty dict called 'seen' and fill it as you walk the input.",
    ],
    quiz: {
      setup: `nums = [2, 7, 11, 15]\ntarget = 9\ntwoSum(nums, target)`,
      question: 'What does twoSum return?',
      opts: ['[0, 1]', '[1, 2]'],
      correct: 0,
    },
  },
  'p2-arrays': {
    concept: "Arrays (Python lists) are sequences where any index is reachable in O(1) and a full walk is O(n). Almost every interview problem starts by walking or indexing into an array.",
    code: `nums = [3, 1, 4, 1, 5, 9, 2, 6]

nums[0]     # 3     O(1) random access
nums[-1]    # 6     last element

total = 0
for n in nums:        # O(n) traversal
    total += n        # 31

# Two-index scan, the base of two pointers
i, j = 0, len(nums) - 1
while i < j:
    i += 1
    j -= 1`,
    breakdown: "The two-index scan (i starts at 0, j starts at len(nums) - 1) is the base of the two-pointer pattern. Starting from both ends and moving inward covers all pairs in O(n), not the O(n²) you would get from nested loops.",
    remember: [
      "nums[i] is O(1). Any index is free to access.",
      "Walking the whole array is O(n). Two nested walks is O(n²).",
      "The two-index scan (i = 0, j = len - 1) replaces many nested loops.",
      "A full-array sum, max, or min is always O(n). There is no way to do better without preprocessing.",
    ],
    quiz: {
      setup: `nums = [10, 20, 30, 40]\nnums[1] + nums[-1]`,
      question: 'What does this evaluate to?',
      opts: ['50', '60'],
      correct: 1,
    },
  },
  'p2-hashmaps': {
    concept: "Hash maps (Python dicts) give O(1) lookup, insert, and delete. They are the most powerful tool you have for turning O(n²) brute-force into a clean O(n) one-pass solution.",
    code: `# Complement pattern, the heart of Two Sum
nums, target = [2, 7, 11, 15], 9

seen = {}
for i, n in enumerate(nums):
    if target - n in seen:
        print(seen[target - n], i)   # 0 1
        break
    seen[n] = i`,
    breakdown: "Instead of scanning the rest of the array for each element (O(n²)), we store each value with its index as we go. The lookup 'target - n in seen' is O(1). One pass, O(n) total. The complement trick shows up in dozens of problems. Memorize its shape.",
    remember: [
      "If you are asking 'have I seen this before?', a hash map is the answer.",
      "The complement pattern: for each n, check if (target - n) is in seen. Store values as keys, indices as values.",
      "d[key] crashes if the key is missing. Use d.get(key, default) or check 'key in d' first.",
      "Hash map lookup, insert, and delete are all O(1) average.",
    ],
    quiz: {
      setup: `d = {"a": 1, "b": 2}\n"a" in d`,
      question: 'What does this evaluate to?',
      opts: ['True', 'False'],
      correct: 0,
    },
  },
  'p2-sets': {
    concept: "A set stores unique values with O(1) membership testing. Reach for a set whenever you need to ask 'have I seen this before?' or 'are there any duplicates?'",
    code: `nums = [1, 2, 3, 2, 4]

# Duplicate detection in one line
has_dup = len(nums) != len(set(nums))   # True

# Visited tracking, stop at the first repeat
seen = set()
for n in nums:
    if n in seen:
        print("duplicate:", n)   # duplicate: 2
        break
    seen.add(n)`,
    breakdown: "len(nums) != len(set(nums)) is a one-liner for duplicate detection. Converting to a set drops repeats, so if the length shrinks there was at least one duplicate. Use it when you do not need to know WHICH element repeated.",
    remember: [
      "set() creates an empty set. {} creates an empty DICT, not a set. This is a common trap.",
      "'x in s' on a set is O(1). 'x in nums' on a list is O(n).",
      "set(nums) removes duplicates in O(n).",
      "s.add(x) adds an element. s.remove(x) removes it (crashes if missing). s.discard(x) removes it safely.",
    ],
    quiz: {
      setup: `s = set([1, 2, 2, 3])\nlen(s)`,
      question: 'What does this return?',
      opts: ['3', '4'],
      correct: 0,
    },
  },
  'p2-stacks': {
    concept: "A stack is LIFO (last in, first out). In Python, a plain list works as a stack: append to push, pop to pop, both O(1). Reach for a stack whenever you need to remember what came just before.",
    code: `# Valid parentheses, the classic stack problem
pairs = {')': '(', ']': '[', '}': '{'}
stack = []

for ch in "({[]})":
    if ch in "([{":
        stack.append(ch)            # push opener
    elif not stack or stack.pop() != pairs[ch]:
        print("invalid")
        break
else:
    print("valid" if not stack else "invalid")`,
    breakdown: "Every opening bracket gets pushed onto the stack. Every closing bracket must match the top of the stack. If it does not match, or the stack is empty when you try to match, the string is invalid. The stack tracks the most recently opened context, which is exactly what bracket matching needs.",
    remember: [
      "stack.append(x) pushes. stack.pop() pops the LAST-added item.",
      "Both operations are O(1).",
      "Always check 'if stack:' before popping. Popping an empty list crashes your program.",
      "Stack is LIFO. Queue is FIFO. Do not confuse them.",
      "If a problem says 'undo', 'most recent', or 'matching brackets', think stack.",
    ],
    quiz: {
      setup: `s = []\ns.append(1)\ns.append(2)\ns.pop()`,
      question: 'What does pop() return?',
      opts: ['1', '2'],
      correct: 1,
    },
  },
  'p2-queues': {
    concept: "A queue is FIFO (first in, first out). Use collections.deque, NOT a plain list. deque.popleft() is O(1), but list.pop(0) is O(n) because it has to shift every remaining element. Queues are the foundation of BFS.",
    code: `from collections import deque

# BFS scaffold, processes nodes in level order
q = deque([start])
visited = {start}

while q:
    node = q.popleft()          # O(1)
    for nbr in neighbors(node):
        if nbr not in visited:
            visited.add(nbr)
            q.append(nbr)`,
    breakdown: "deque.popleft() is O(1) because a deque does not need to shift elements. Any time you need FIFO ordering, reach for deque, not list. It is the one-line upgrade that unlocks clean, efficient BFS.",
    remember: [
      "Import with 'from collections import deque'.",
      "q.append(x) adds to the right. q.popleft() removes from the left.",
      "NEVER use list.pop(0). It is O(n) and will silently kill your solution on large inputs.",
      "BFS always uses a queue, never a stack.",
      "If a problem asks 'level by level' or 'shortest path', think queue.",
    ],
    quiz: {
      setup: `from collections import deque\nq = deque([1, 2, 3])\nq.popleft()`,
      question: 'What does popleft() return?',
      opts: ['1', '3'],
      correct: 0,
    },
  },
  'p2-linked': {
    concept: "A linked list is a chain of nodes, each pointing to the next. There is no random access. You have to walk the chain. The core skill is changing 'next' pointers without losing track of the rest of the list.",
    code: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Reverse a linked list in place (canonical pattern)
def reverse(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next   # save the rest
        curr.next = prev  # flip the pointer
        prev = curr       # advance prev
        curr = nxt        # advance curr
    return prev`,
    breakdown: "The tricky part is saving curr.next into nxt BEFORE you overwrite it. Otherwise you lose the rest of the list the moment you flip the pointer. The four steps (save, flip, advance prev, advance curr) are the canonical reversal pattern. Commit it to memory.",
    remember: [
      "A linked list has no index. You walk it with 'curr = curr.next'.",
      "To reverse: save next, flip curr.next to prev, advance prev, advance curr.",
      "ALWAYS save curr.next BEFORE you change it. Otherwise the rest of the list is gone.",
      "Slow and fast pointers (tortoise and hare) find the middle AND detect cycles.",
      "A dummy head node simplifies problems that might change the original head.",
    ],
    quiz: {
      setup: `# 1 -> 2 -> 3 reversed\n# what is the new head?`,
      question: "After reversing, what is the new head's value?",
      opts: ['1', '3'],
      correct: 1,
    },
  },
  'p2-trees': {
    concept: "A binary tree has a root and up to two children per node. Most tree problems are solved with recursion. You describe what happens at ONE node, then trust the recursion to handle the rest of the tree.",
    code: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Max depth. Recursion is the whole solution.
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left),
                   max_depth(root.right))`,
    breakdown: "The mental model: 'assume I already know the depth of each subtree. Then my depth is 1 + max(left, right).' Trust the recursion. The base case (empty tree returns 0) handles the bottom. Almost every tree problem follows this exact shape.",
    remember: [
      "Always handle the base case first: 'if not root: return ...'.",
      "Recurse on root.left and root.right, then combine the two results.",
      "DFS on a tree uses recursion or a stack. BFS on a tree uses a queue.",
      "Inorder, preorder, and postorder differ ONLY in when you process the current node.",
      "Tree problems do not need a visited set. Trees have no cycles. Graphs do.",
    ],
    quiz: {
      setup: `#     1\n#    / \\\n#   2   3\n# max_depth(root)`,
      question: "What is the max depth?",
      opts: ['2', '3'],
      correct: 0,
    },
  },
  'p2-heaps': {
    concept: "A heap keeps the smallest (or largest) element instantly reachable. Push and pop are O(log n). Python's heapq module gives you a min-heap on top of a plain list. Reach for it any time you need repeated access to the extreme value.",
    code: `import heapq

# Top K largest, keep a min-heap of size k
def top_k(nums, k):
    heap = []
    for n in nums:
        heapq.heappush(heap, n)
        if len(heap) > k:
            heapq.heappop(heap)   # drop the smallest
    return heap

top_k([3, 1, 5, 12, 2, 11], 3)   # [5, 11, 12]`,
    breakdown: "To keep the top K LARGEST values, you use a MIN-heap. Yes, really. The smallest item in a min-heap is always the weakest member of the 'top K' club, so when a bigger number arrives you kick out the smallest. After one pass the heap holds exactly the K largest items.",
    remember: [
      "heapq is ALWAYS a min-heap. The smallest item sits at index 0.",
      "For a max-heap, push negative values. Pop and negate again.",
      "Always use heapq.heappush(h, x) and heapq.heappop(h). Never sort h manually.",
      "Top K LARGEST uses a MIN-heap of size k. Top K SMALLEST uses a MAX-heap of size k.",
      "This feels backwards on first read. Re-read it until it clicks.",
    ],
    quiz: {
      setup: `import heapq\nh = [3, 1, 5]\nheapq.heapify(h)\nheapq.heappop(h)`,
      question: 'What does heappop return?',
      opts: ['5', '1'],
      correct: 1,
    },
  },
  'p2-graphs': {
    concept: "A graph is a set of nodes connected by edges. The most common representation is an adjacency list: a dict mapping each node to its list of neighbors. BFS and DFS are the two ways to explore a graph, and every graph problem builds on one of those two.",
    code: `graph = {
    'A': ['B', 'C'],
    'B': ['A', 'D'],
    'C': ['A'],
    'D': ['B'],
}

# DFS with a visited set
def dfs(node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for nbr in graph[node]:
        if nbr not in visited:
            dfs(nbr, visited)
    return visited`,
    breakdown: "The visited set is not optional. Without it, the recursion cycles forever on any graph that has a loop, which is almost all real graphs. Always ask 'have I seen this node before?' before you recurse into it. Forgetting this is the number one graph bug.",
    remember: [
      "Adjacency list: graph[node] gives you a list of neighbors.",
      "ALWAYS use a visited set on a graph. Trees do not need one, graphs do.",
      "BFS finds the SHORTEST path on an unweighted graph. DFS does not.",
      "Mark a node as visited when you ADD it to the queue, not when you pop it. Otherwise duplicates pile up.",
      "DFS can be written with recursion OR with an explicit stack. BFS uses a queue.",
    ],
    quiz: {
      setup: `graph = {'A': ['B'], 'B': ['A']}\n# dfs('A'): how many nodes visited?`,
      question: 'How many distinct nodes does DFS visit?',
      opts: ['2', 'infinite loop'],
      correct: 0,
    },
  },
  'p3-twopointers': {
    concept: "Two pointers is a trick that replaces a nested O(n²) loop with a single O(n) pass. You keep two indices (call them i and j) moving across the array. Either they start at both ends and move toward each other, or they both start at the left and move in the same direction at different speeds. On every step you compare what they point at and use that to decide which pointer to move.",
    code: `# Pair sum on a sorted array: classic inward two-pointer
def pair_sum(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1   # sum too small, need a bigger value on the left
        else:
            j -= 1   # sum too big, need a smaller value on the right
    return []

pair_sum([1, 2, 4, 7, 11], 9)   # [1, 3]`,
    breakdown: "Because the array is sorted, the sum nums[i] + nums[j] tells you exactly which pointer to move. If the sum is too small, moving i right pulls in a larger value. If the sum is too big, moving j left pulls in a smaller value. Each element is visited at most once, so the whole thing runs in O(n) time and O(1) extra space.",
    remember: [
      "Inward two-pointer needs a SORTED array. If the input is not sorted, either sort it first or use a different pattern (usually a hash map).",
      "Start with i = 0 and j = len(nums) - 1. Loop while i < j (strict, not i <= j).",
      "The rule is simple: sum too small, do i += 1. Sum too big, do j -= 1.",
      "Same-direction two-pointer (like removing duplicates in place) uses a slow index i that only advances when you want to keep the current element.",
      "Time O(n), space O(1). That is the whole reason to use this pattern over nested loops.",
    ],
    quiz: {
      setup: `nums = [1, 3, 4, 6]\n# pair_sum(nums, 7) with i = 0, j = 3`,
      question: 'Which pointer moves first?',
      opts: ['j moves left (1 + 6 = 7 is found immediately)', 'i moves right'],
      correct: 0,
    },
  },
  'p3-window': {
    concept: "A sliding window is a contiguous range [left, right] that walks through an array or string. On every iteration, right moves one step forward (expand). If some rule breaks (like a duplicate character), left moves forward until the rule holds again (shrink). Instead of recomputing the window from scratch every time, you update the running state as left and right move. This turns an O(n * k) brute force into O(n).",
    code: `# Longest substring without repeating characters (variable window)
def longest_unique(s):
    seen = {}          # char -> most recent index
    left = 0           # left edge of the window
    best = 0           # longest window length seen so far
    for right, ch in enumerate(s):
        # if ch is inside the current window, jump left past it
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        best = max(best, right - left + 1)
    return best

longest_unique("abcabcbb")   # 3  (the substring "abc")`,
    breakdown: "The window [left, right] only ever moves forward. right expands on every loop iteration, and left jumps just past the last duplicate whenever one appears inside the window. Each character is visited at most twice (once by right, once when left passes it), so the total work is O(n).",
    remember: [
      "The window is always contiguous. If the problem asks about a subarray or substring (contiguous), this is your first guess.",
      "Expand with right (the for loop variable). Shrink with left (usually a while loop that fixes a broken rule).",
      "Current window length = right - left + 1.",
      "Fixed-size window: k known in advance, left and right move together. Variable-size window: left catches up only when a rule breaks.",
      "Use a dict or set to track what is currently inside the window.",
      "Time O(n) because each element enters and leaves the window at most once.",
    ],
    quiz: {
      setup: `longest_unique("abba")`,
      question: 'What does this return?',
      opts: ['2', '3'],
      correct: 0,
    },
  },
  'p3-prefix': {
    concept: "A prefix sum is an array where prefix[k] holds the sum of the first k numbers. Once you have it, any range sum nums[i..j] becomes a single subtraction: prefix[j+1] - prefix[i]. Build it in O(n), then answer any range query in O(1). When you pair a running prefix sum with a hash map, you also unlock 'count subarrays with sum k' problems.",
    code: `# Range sums in O(1) after O(n) preprocessing
nums = [3, 1, 4, 1, 5, 9, 2, 6]

prefix = [0]                   # sentinel so prefix[0] = 0
for n in nums:
    prefix.append(prefix[-1] + n)
# prefix = [0, 3, 4, 8, 9, 14, 23, 25, 31]

def range_sum(i, j):           # i and j are both inclusive
    return prefix[j + 1] - prefix[i]

range_sum(1, 3)   # 1 + 4 + 1 = 6
range_sum(0, 7)   # 31`,
    breakdown: "prefix[k] stores the sum of the first k elements of nums. To get nums[i..j] (inclusive on both ends), subtract prefix[i] (everything before i) from prefix[j+1] (everything through j). The prefix[0] = 0 sentinel removes the edge case when i = 0.",
    remember: [
      "prefix has length n + 1 (one longer than nums). prefix[0] = 0 is a sentinel.",
      "Range sum nums[i..j] inclusive = prefix[j + 1] - prefix[i]. Memorize this exact formula.",
      "Build the prefix array once (O(n)), then every query is O(1).",
      "Subarray sum equals k: iterate with a running sum, and count how many times (running_sum - k) has appeared before using a hash map.",
      "2D prefix sums work the same way, but with an inclusion-exclusion formula for rectangles.",
    ],
    quiz: {
      setup: `nums = [2, 4, 6, 8]\n# prefix = [0, 2, 6, 12, 20]\n# range_sum(1, 2)`,
      question: 'What does range_sum(1, 2) return?',
      opts: ['10', '12'],
      correct: 0,
    },
  },
  'p3-bsearch': {
    concept: "Binary search cuts the search space in half on every step, giving O(log n) instead of O(n). The obvious use is finding a value in a sorted array, but the real power move is 'binary search on the answer': whenever the predicate 'does value X work?' is monotonic (once it is true, it stays true), you can binary search the answer range, not the input array.",
    code: `# Standard binary search on a sorted array
def bsearch(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:                 # NOTE: <= not <
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1            # target is to the right
        else:
            hi = mid - 1            # target is to the left
    return -1                       # not found

bsearch([1, 3, 5, 7, 9, 11], 7)   # 3`,
    breakdown: "mid = (lo + hi) // 2 picks the midpoint, and the comparison with target tells you which half to throw away. The lo <= hi guard (with equals) is the inclusive-bounds version. Forgetting the = is the classic off-by-one that misses the target when it is sitting at lo == hi.",
    remember: [
      "Inclusive bounds template: lo = 0, hi = len(nums) - 1, while lo <= hi. Update with lo = mid + 1 or hi = mid - 1.",
      "Always write mid = lo + (hi - lo) // 2 or (lo + hi) // 2 BEFORE the if checks.",
      "Binary search the answer: if 'is X feasible?' is monotonic, lo and hi become the min and max possible answers, not array indices.",
      "Use bisect_left for 'first index where nums[i] >= target' and bisect_right for 'first index where nums[i] > target'.",
      "Array must be sorted (or the predicate must be monotonic). If not, this pattern does not apply.",
    ],
    quiz: {
      setup: `bsearch([1, 3, 5, 7, 9], 4)`,
      question: 'What does this return?',
      opts: ['2', '-1'],
      correct: 1,
    },
  },
  'p3-hashing': {
    concept: "Hash-map patterns turn brute-force O(n²) scans into O(n) one-pass solutions. There are four main shapes to recognize. (1) Complement lookup: Two Sum checks for target - n. (2) Frequency counting: count how many times each value appears. (3) Seen-before tracking: remember indices you have already visited. (4) Grouping by key: anagrams share the same sorted-letter key. Once you match the problem to one of these four shapes, the code writes itself.",
    code: `# Group anagrams: key each word by its sorted letters
def group_anagrams(words):
    groups = {}
    for w in words:
        key = ''.join(sorted(w))                # canonical key
        groups.setdefault(key, []).append(w)
    return list(groups.values())

group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
# [['eat','tea','ate'], ['tan','nat'], ['bat']]`,
    breakdown: "Anagrams always share the same sorted letters, so sorted(w) makes a canonical key. setdefault(key, []) creates an empty list the first time you see a key and returns the existing one afterward, which is cleaner than a manual 'if key not in groups' check. One pass, O(n * k log k) where k is the word length.",
    remember: [
      "Two Sum shape: for each n, check if (target - n) is already in the dict. O(n) one pass.",
      "Frequency counting: use collections.Counter(items) for a quick histogram.",
      "Seen-before: set() for membership, dict for 'seen at which index'.",
      "Grouping by key: build a canonical key (sorted letters, tuple of counts, etc.) and use groups.setdefault(key, []).append(item).",
      "Hash lookups are O(1) average. Trading O(n) extra space for O(1) lookup is almost always worth it in interviews.",
    ],
    quiz: {
      setup: `sorted("tea") == sorted("eat")`,
      question: 'What does this evaluate to?',
      opts: ['True', 'False'],
      correct: 0,
    },
  },
  'p3-stackpat': {
    concept: "A monotonic stack keeps its contents sorted. Usually the values are strictly decreasing from bottom to top, so that the next greater element for anything sitting on the stack is just one pop away. Reach for this pattern whenever a problem asks 'for each element, what is the next one that is greater (or smaller)?' over a sequence.",
    code: `# Next greater element: monotonic decreasing stack (of indices)
def next_greater(nums):
    res = [-1] * len(nums)     # default: no greater element exists
    stack = []                 # holds indices, values decreasing
    for i, n in enumerate(nums):
        # while the stack top has a smaller value, n is its answer
        while stack and nums[stack[-1]] < n:
            res[stack.pop()] = n
        stack.append(i)
    return res

next_greater([2, 1, 3, 4])   # [3, 3, 4, -1]`,
    breakdown: "Each index is pushed onto the stack once and popped at most once, which is exactly why the pattern is O(n) even with an inner while loop. When a larger number arrives, every smaller index waiting on the stack finally gets its answer and leaves. Any indices still on the stack when the loop ends have no greater element to the right, so they keep the default of -1.",
    remember: [
      "Store INDICES on the stack, not values. You usually need the position to write back into the result array.",
      "Next greater: stack is decreasing. Pop while nums[stack[-1]] < n, then push i.",
      "Next smaller: flip the comparison. Stack is increasing. Pop while nums[stack[-1]] > n.",
      "Each index is pushed and popped at most once, so the amortized cost is O(n) overall.",
      "If no answer exists, the index is never popped. Initialize the result array with a sentinel like -1.",
    ],
    quiz: {
      setup: `next_greater([5, 4, 3])`,
      question: 'What does this return?',
      opts: ['[-1, -1, -1]', '[4, 3, -1]'],
      correct: 0,
    },
  },
  'p3-bfs': {
    concept: "BFS explores a graph or grid level by level using a queue. Because it always sees closer nodes before farther ones, it is the right tool for shortest-path problems on UNWEIGHTED graphs. Two ways to track distance: (1) tag every node with its distance when you enqueue it, or (2) snapshot len(queue) at the start of each level and process exactly that many nodes before incrementing the level counter.",
    code: `from collections import deque

# Shortest path length in an unweighted grid (0 = open, 1 = wall)
def shortest(grid, start, end):
    R, C = len(grid), len(grid[0])
    q = deque([(start, 0)])         # (cell, distance_from_start)
    seen = {start}                  # mark on ENQUEUE, not on pop
    while q:
        (r, c), d = q.popleft()
        if (r, c) == end:
            return d                # first time we reach end = shortest
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and (nr, nc) not in seen and grid[nr][nc] == 0:
                seen.add((nr, nc))
                q.append(((nr, nc), d + 1))
    return -1                       # end is unreachable`,
    breakdown: "Because BFS always processes nodes in order of their distance from the start, the very first time you pop the target, its distance is guaranteed to be the shortest. The single biggest mistake beginners make is marking cells as 'seen' when they pop them instead of when they enqueue them, which lets the same cell be queued many times and destroys BFS performance.",
    remember: [
      "Use collections.deque. queue.append(x) to enqueue, queue.popleft() to dequeue. Both are O(1).",
      "Mark nodes as SEEN the moment you enqueue them, not when you pop. Otherwise the same node gets queued many times.",
      "For shortest path, the first pop of the target IS the answer. You can return immediately.",
      "To track 'which level am I on', either store (node, distance) tuples in the queue, or do a level-by-level loop with level_size = len(queue) at the start of each step.",
      "BFS only gives shortest path on UNWEIGHTED graphs. For weighted graphs, use Dijkstra (a heap-based BFS).",
      "Grid moves: [(-1,0),(1,0),(0,-1),(0,1)] for 4-directional, add diagonals for 8-directional.",
    ],
    quiz: {
      setup: `# Unweighted BFS, the first time we pop the target...`,
      question: 'The first time BFS pops the target, its distance is:',
      opts: ['always the shortest', 'just an upper bound, may shorten later'],
      correct: 0,
    },
  },
  'p3-dfs': {
    concept: "Backtracking is DFS over a decision tree. At every step you commit to a choice, recurse into the smaller problem, and then undo the choice before trying the next option. The rhythm is always: CHOOSE, RECURSE, UNCHOOSE. This single shape powers subsets, permutations, combinations, N-queens, Sudoku, word search, and most constraint-satisfaction problems.",
    code: `# All subsets: the canonical backtracking template
def subsets(nums):
    res, path = [], []

    def dfs(i):
        if i == len(nums):
            res.append(path[:])       # snapshot! path[:] makes a COPY
            return
        # choice 1: skip nums[i]
        dfs(i + 1)
        # choice 2: take nums[i]
        path.append(nums[i])          # CHOOSE
        dfs(i + 1)                    # RECURSE
        path.pop()                    # UNCHOOSE (backtrack)

    dfs(0)
    return res

subsets([1, 2, 3])   # 8 subsets, from [] through [1,2,3]`,
    breakdown: "path[:] appends a COPY of the current state. Without the slice, every stored subset would be a reference to the same list, and the list keeps mutating, so you would end up with a bunch of identical entries. The append / recurse / pop trio is the backtracking heartbeat: commit, explore, undo. Master that rhythm and every other backtracking problem is just a variation.",
    remember: [
      "The rhythm: CHOOSE (path.append), RECURSE (dfs), UNCHOOSE (path.pop). Never forget the pop.",
      "Always append a COPY when saving a solution: res.append(path[:]) or res.append(list(path)).",
      "Subsets: each element is either taken or skipped. 2^n subsets total.",
      "Permutations: track which elements are already used with a 'used' boolean array, or pop from the unused list.",
      "Combinations: add a start index to dfs(i) so you never reuse earlier elements.",
      "Prune early. If the current path cannot possibly lead to a valid answer, return immediately to save work.",
    ],
    quiz: {
      setup: `len(subsets([1, 2, 3]))`,
      question: 'How many subsets does [1, 2, 3] have?',
      opts: ['6', '8'],
      correct: 1,
    },
  },
  'p3-treepat': {
    concept: "Most tree problems follow the same shape: recurse into the left and right subtrees, combine their results, and return something to the parent. You describe what happens at ONE node and trust the recursion to handle the rest. Depth, balanced check, diameter, path sum, and lowest common ancestor are all small variations on this one template.",
    code: `# Diameter of a binary tree: length of the longest path between any two nodes
def diameter(root):
    best = 0

    def depth(node):
        nonlocal best
        if not node:
            return 0
        L = depth(node.left)
        R = depth(node.right)
        # the path that BENDS at this node has length L + R
        best = max(best, L + R)
        # the depth returned UP to the parent is 1 + the longer side
        return 1 + max(L, R)

    depth(root)
    return best`,
    breakdown: "The helper returns one value (the depth of the subtree) and ALSO updates another value (the global best) via closure. At every node, L + R is the length of the longest path that bends at this node. You track the maximum of that value across every node. The trick is that the function returns 'depth' up the call stack while it also mutates 'best' on the way.",
    remember: [
      "Recursive tree template: base case is 'if not node: return 0 (or None)'. Then recurse into left and right. Then combine.",
      "If the answer is 'the best over all nodes', use a nonlocal variable (or a list wrapper) and update it inside the recursion.",
      "The value you RETURN to the parent can be different from the value you UPDATE globally. Diameter is the classic example: return depth upward, update best along the way.",
      "Depth = 1 + max(left_depth, right_depth). Memorize this.",
      "Diameter path length (in edges) = left_depth + right_depth at the bending node.",
      "Level-order / BFS on a tree uses a queue. In-order / pre-order / post-order are DFS and use recursion.",
    ],
    quiz: {
      setup: `#     1\n#    / \\\n#   2   3\n#  /\n# 4\n# diameter(root)`,
      question: 'What is the diameter (in edges)?',
      opts: ['2', '3'],
      correct: 1,
    },
  },
  'p3-heappat': {
    concept: "Heaps solve any problem that needs fast access to the smallest or largest element. Think: top K, K closest, merge K sorted lists, running median. Python's heapq module is always a MIN-heap. To simulate a max-heap, push negative values. For running median, you combine two heaps: a max-heap for the lower half and a min-heap for the upper half, kept the same size or off by one.",
    code: `import heapq

# K closest points to the origin using a bounded max-heap of size k
def k_closest(points, k):
    heap = []
    for x, y in points:
        dist = x * x + y * y
        # negate dist so that the LARGEST real distance is at the top
        heapq.heappush(heap, (-dist, x, y))
        if len(heap) > k:
            heapq.heappop(heap)         # drop the farthest point
    return [(x, y) for _, x, y in heap]

k_closest([(1,3), (-2,2), (5,8), (0,1)], 2)   # [(-2,2), (0,1)]`,
    breakdown: "Because heapq is min-only, we store -dist so that the largest actual distance sits at the top and gets popped first. The heap never exceeds size k, so every push and pop is O(log k). Overall the algorithm is O(n log k), which beats a full O(n log n) sort when k is much smaller than n.",
    remember: [
      "heapq in Python is a MIN-heap. For a max-heap, push -x (or a negated key).",
      "heapq.heappush(heap, x) and heapq.heappop(heap) are O(log n). heap[0] (peek) is O(1).",
      "Top K LARGEST values: use a MIN-heap of size k. Pop whenever the heap grows past k. The k largest remain.",
      "Top K SMALLEST values: use a MAX-heap (negate values) of size k. Same pattern.",
      "Running median: two heaps. Max-heap for the lower half, min-heap for the upper half. Rebalance so their sizes differ by at most 1.",
      "heapify(list) turns an existing list into a heap in O(n), which is faster than n individual pushes.",
    ],
    quiz: {
      setup: `# To track the k LARGEST values as you stream through data, you use...`,
      question: 'Which heap type and size?',
      opts: ['min-heap of size k', 'max-heap of size k'],
      correct: 0,
    },
  },
  'p3-dp': {
    concept: "Dynamic programming solves a hard problem by breaking it into smaller, overlapping subproblems and caching the answers. Two styles exist. Top-down: recursion with a memo (a dict or @lru_cache). Bottom-up: fill a table from the base case forward. Every DP problem starts with the same question: what is the smallest piece of state that fully determines the answer?",
    code: `# Climbing stairs: 1D DP, bottom-up
def climb(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2                    # base cases
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]      # recurrence
    return dp[n]

climb(5)   # 8   (it is Fibonacci in disguise)`,
    breakdown: "The state is just i (the current step). The recurrence dp[i] = dp[i-1] + dp[i-2] says 'the number of ways to reach step i equals the number of ways to reach (i-1) plus the number of ways to reach (i-2)' because the last move was either a 1-step or a 2-step. Recognizing the recurrence is the entire challenge. Once you have it, filling the table is mechanical.",
    remember: [
      "Step 1: define the STATE. What inputs fully determine the answer? Usually an index, a remaining capacity, or a (row, col) pair.",
      "Step 2: define the RECURRENCE. dp[state] = some combination of dp[smaller states]. This is the hard part.",
      "Step 3: define the BASE CASES. Usually dp[0] or dp[0][0].",
      "Step 4: define the ANSWER. Usually dp[n] or dp[-1][-1], but not always.",
      "Top-down (memoized recursion) is easier to write. Bottom-up (iterative table) usually uses less memory.",
      "If the recurrence only uses dp[i-1] and dp[i-2], you can roll the table into two variables and drop memory to O(1).",
      "Classic 1D: climbing stairs, house robber, longest increasing subsequence. Classic 2D: edit distance, knapsack, unique paths.",
    ],
    quiz: {
      setup: `climb(4)`,
      question: 'How many ways to climb 4 stairs (taking 1 or 2 steps at a time)?',
      opts: ['5', '4'],
      correct: 0,
    },
  },
  'p4-breakdown': {
    concept: "Before writing any code, run every problem through the same four steps. (1) READ: what is actually being asked? Restate it in your own words. (2) IDENTIFY: what are the inputs, outputs, and return type? (3) CONSTRAIN: what do the size limits tell you about the required complexity? (4) PLAN: pick the pattern and sketch pseudocode. This simple ritual stops you from coding random ideas under time pressure.",
    code: `# The 4-step breakdown. Apply to every problem.
# 1. READ       : what is actually being asked?
# 2. IDENTIFY   : inputs, outputs, return type
# 3. CONSTRAIN  : what do the size limits tell you?
# 4. PLAN       : pick the pattern, write pseudocode

# Example: "Longest substring without repeating chars"
#   input      : str s, with 1 <= len(s) <= 5 * 10**4
#   output     : int (the length)
#   constraint : n up to 5e4, so O(n**2) is 2.5e9 ops, TOO SLOW
#                the answer MUST be O(n) or O(n log n)
#   pattern    : sliding window + hash set`,
    breakdown: "The constraint n up to 5 * 10^4 is doing real work for you. It rules out O(n^2), which would be about 2.5 * 10^9 operations, way over the rough budget of 10^8 operations per second. So the answer must be O(n) or O(n log n). Reading constraints FIRST narrows the pattern search before you write a single line of code.",
    remember: [
      "Follow the 4 steps in order: READ, IDENTIFY, CONSTRAIN, PLAN. Do not skip ahead to code.",
      "Budget: roughly 10^8 simple operations per second. That is your speed of light.",
      "n up to 10^3: any algorithm works. n up to 10^5: need O(n log n) or better. n up to 10^7: need O(n) or O(log n).",
      "Constraints are HINTS. Small n often means DP or backtracking is OK. Large n means you need a clever single-pass pattern.",
      "Write pseudocode in plain English comments FIRST. Only translate to real Python once the logic is correct.",
    ],
    quiz: {
      setup: `# n can be up to 10**5\n# is an O(n**2) solution fast enough?`,
      question: 'With n up to 10^5, is an O(n^2) solution fast enough?',
      opts: ['Yes', 'No, you need O(n log n) or O(n)'],
      correct: 1,
    },
  },
  'p4-optimize': {
    concept: "Always start with the obvious brute force. It gives you a correctness baseline and, more importantly, it shows you exactly where the bottleneck is. Then you replace the expensive operation (almost always a nested scan) with a better data structure to cut the complexity. Brute force first, then optimize, is the single most reusable interview technique.",
    code: `# Two Sum, brute force: O(n**2)
def two_sum_brute(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]

# Optimal: hash map gives O(1) lookup, bringing it to O(n)
def two_sum(nums, target):
    seen = {}                          # value -> its index
    for i, n in enumerate(nums):
        if target - n in seen:         # complement already seen?
            return [seen[target - n], i]
        seen[n] = i                    # remember current value
    return []`,
    breakdown: "The brute force scans the rest of the array for each element. That inner loop IS the bottleneck. The moment you notice 'I keep re-searching the same data', reach for a hash map. Trading space for time (the seen dict) collapses O(n^2) into O(n). This brute-force-then-optimize move is the single most reusable interview pattern.",
    remember: [
      "Always state the brute force out loud first, even if you know the optimal. It shows the interviewer you understand the problem.",
      "The bottleneck is almost always a nested loop that keeps re-searching the same data.",
      "Three ways to remove a nested loop: hash map (O(1) lookup), sorting + two pointers, or precomputed prefix sums.",
      "Trading memory for speed is almost always the right call in an interview.",
      "State complexity before AND after. 'Brute force is O(n^2) time. With a hash map I can bring it down to O(n) time and O(n) space.'",
    ],
    quiz: {
      setup: `# Two Sum brute force, nested loops\nfor i in range(n):\n    for j in range(i + 1, n): ...`,
      question: 'What is the time complexity of the brute force?',
      opts: ['O(n)', 'O(n^2)'],
      correct: 1,
    },
  },
  'p4-clean': {
    concept: "Interviewers read your code as you write it. Descriptive variable names, early returns, and small helpers make your logic legible at a glance. Dense one-liners are a trap. Readability beats cleverness every single time. The point is to make the interviewer think 'this person writes code I would want to work with'.",
    code: `# Messy: clever but unreadable
def f(a):
    return [x for x in a if x % 2 == 0 and x > 0][:3][::-1]

# Clean: each step names its intent
def first_three_positive_evens_reversed(nums):
    if not nums:
        return []
    positive_evens = [n for n in nums if n > 0 and n % 2 == 0]
    first_three    = positive_evens[:3]
    return first_three[::-1]`,
    breakdown: "Named intermediate variables act as self-documenting comments. 'if not nums:' also reads directly as 'no nums'. It expresses intent, not mechanics. Compare that to 'if len(nums) == 0:' which forces the reader to translate. Small upgrades like this compound across a solution and make your thinking visible to the interviewer.",
    remember: [
      "Variable names should describe the VALUE, not the type. Prefer 'positive_evens' over 'arr' or 'result'.",
      "Early returns beat deeply nested ifs. 'if not nums: return []' then continue at the top level.",
      "'if not nums:' is idiomatic Python for 'if the list is empty'. Do not write 'if len(nums) == 0:'.",
      "Extract helpers only if a chunk of logic has a clear name. Premature helpers make code harder to read.",
      "Comments should explain WHY, not WHAT. If the code needs a comment to explain what it does, rename the variables.",
    ],
    quiz: {
      setup: `nums = []\n# idiomatic empty-list check?`,
      question: 'Which is the idiomatic Python empty-list check?',
      opts: ['if not nums:', 'if len(nums) == 0:'],
      correct: 0,
    },
  },
  'p4-testing': {
    concept: "Before you click submit, trace through at least two test cases by hand. One normal, one edge. About 90% of interview bugs live in the edges: empty input, a single element, duplicates, negatives, very large values, and the 'just barely off' case. If you never check these, your 'working' solution is just a guess.",
    code: `def first_duplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return n
        seen.add(n)
    return -1

# Dry run the edges, not just the happy path
first_duplicate([])           # empty list,          -> -1
first_duplicate([5])          # single element,      -> -1
first_duplicate([1, 1])       # duplicate at idx 1,  -> 1
first_duplicate([1, 2, 3, 2]) # duplicate at idx 3,  -> 2`,
    breakdown: "Off-by-one errors hide in loop bounds. Always ask two questions about every loop. (1) What does i equal on the LAST iteration? (2) Do I correctly handle index 0 and index len-1? If you cannot answer both without hesitating, you do not yet understand your own loop, and neither will the interviewer.",
    remember: [
      "Edge cases to ALWAYS check: empty input, single element, all identical, sorted ascending, sorted descending, negatives, zero, max size.",
      "range(n) goes from 0 to n-1 INCLUSIVE. range(n - 1) stops at n-2.",
      "Slicing nums[i:j] is [i, j) (i included, j excluded). This rule never changes.",
      "Do a dry run by writing the values of your key variables in a table as you step through the loop.",
      "If a loop has an off-by-one bug, fix it by asking what i equals on the last valid iteration.",
    ],
    quiz: {
      setup: `nums = [10, 20, 30, 40, 50]\n# for i in range(len(nums) - 1): ...`,
      question: 'Which indices does this loop visit?',
      opts: ['0, 1, 2, 3', '0, 1, 2, 3, 4'],
      correct: 0,
    },
  },
  'p4-easy': {
    concept: "Easy rounds test fluency, not creativity. The goal is to recognize the pattern in under a minute, implement it in about five, and explain it cleanly with time left on the clock. If you stall on easies, your pattern recall is not automatic yet. The fix is more reps at the same tier, not jumping to harder problems.",
    code: `# Target pacing for an EASY problem (30-min round)
#
# 0:00  0:01   read the problem, restate it in your own words
# 0:01  0:03   walk through the example, identify the pattern
# 0:03  0:05   state your approach out loud, confirm with interviewer
# 0:05  0:12   code it, narrating as you go
# 0:12  0:15   dry-run 2 test cases (one normal, one edge)
# 0:15  0:18   state time AND space complexity
# 0:18  0:30   answer follow-up questions
#
# If you are still coding at 0:20 on an EASY, slow down,
# breathe, and talk through what you are stuck on out loud.
# Silence is the enemy. Talking keeps the interviewer with you.`,
    breakdown: "The goal of an easy is not just to solve it. It is to solve it CALMLY and NARRATED. Finishing with time to spare and a clean explanation is the exact behavior an interviewer is grading for. Rushing and silently grinding out a correct answer can still fail you because it does not show the signal they are looking for.",
    remember: [
      "Target: finish an easy in under 15 minutes, leaving 15 for follow-ups.",
      "If you are stuck after 5 minutes, TALK OUT LOUD about where you are stuck. Silence kills interviews.",
      "Always restate the problem before coding, even for easy ones. It catches misreads.",
      "Narrate your approach BEFORE you write code. 'I am going to use a hash map to check for complements'.",
      "The easiest easies: Two Sum, Valid Parentheses, Reverse Linked List, Merge Two Sorted Lists, Max Subarray. Memorize these cold.",
    ],
    quiz: {
      setup: `# 30-minute interview round, EASY problem\n# how long should the solve take?`,
      question: 'What is a healthy target time for an easy problem?',
      opts: ['Under 15 minutes', 'The full 30 minutes'],
      correct: 0,
    },
  },
  'p4-medium': {
    concept: "Mediums are the real interview benchmark. Two pointers, sliding window, BFS, DFS, hash maps, and DP dominate this tier. The biggest mistake is jumping straight to code. Instead: commit out loud to the pattern you think applies, sketch pseudocode in comments, THEN write real code. Pattern first, code second.",
    code: `# Medium: "Longest substring without repeating characters"
#
# Pattern recognition (say this out loud):
#   "contiguous substring"  -> sliding window
#   "without repeating"     -> hash set to track chars in window
#
# Pseudocode FIRST, in comments:
#   left = 0
#   seen = set()
#   best = 0
#   for right, c in enumerate(s):
#       while c in seen:
#           remove s[left] from seen
#           left += 1
#       add c to seen
#       best = max(best, right - left + 1)
#   return best
#
# ONLY THEN translate pseudocode to real Python.
# Do not skip the pseudocode step. It saves time.`,
    breakdown: "Mediums usually have two or three patterns that COULD apply. Commit out loud to one, explain WHY, then implement. Changing patterns halfway through is the biggest time sink in interviews. It wastes the code you have already written and rattles your confidence. Pick, commit, execute. If your first pattern is wrong, abandon it CLEANLY and restart, do not half-rewrite.",
    remember: [
      "Keywords map to patterns. 'Contiguous' or 'substring' -> sliding window. 'Sorted' -> two pointers or binary search. 'Shortest path' -> BFS. 'All possible' -> backtracking.",
      "Write pseudocode in comments BEFORE writing any real code. This is the single biggest medium-tier upgrade.",
      "Commit to a pattern out loud, and explain your reasoning. The interviewer can correct you early if you are wrong.",
      "If you realize your pattern is wrong 10 minutes in, say so and restart cleanly. Do not patch a broken approach.",
      "Target: 20 to 25 minutes on a medium in a 30-minute round.",
    ],
    quiz: {
      setup: `# problem: "longest substring without repeating characters"\n# which pattern applies first?`,
      question: 'Which pattern should you reach for first?',
      opts: ['Dynamic programming', 'Sliding window'],
      correct: 1,
    },
  },
  'p4-communication': {
    concept: "Think OUT LOUD. Narrate your approach, your reasoning, your tradeoffs, and your complexity analysis. Silent coding reads as luck. Narrated coding reads as engineering. Engineering is what gets the offer. Even if your code is slightly wrong, a strong narration often saves the interview.",
    code: `# A well-narrated solution sounds like this:
#
# "Okay, I am going to use a hash map to track each number's
#  index as I iterate. For each element n, I will check if
#  target - n is already in the map."
#
#  [codes the loop while still talking]
#
# "Let me trace this with [2, 7, 11, 15] and target = 9.
#   i = 0, n = 2, I need 7, not seen, store 2 -> 0.
#   i = 1, n = 7, I need 2, seen at index 0, return [0, 1]."
#
# "Time is O(n) because it is a single pass with O(1)
#  average hash lookups. Space is O(n) because the hash
#  map holds up to n entries."`,
    breakdown: "Always state complexity at the end: 'O(n) time, O(n) space. Single pass, hash lookups are O(1) average.' Leaving this off is the number one reason solid solutions get marked down. If the interviewer has to ASK 'and what is the time complexity?', you have left free points on the table.",
    remember: [
      "Narrate the APPROACH before you code. Narrate the CODE as you write it. Narrate the COMPLEXITY at the end.",
      "Always state BOTH time and space complexity. Never just one.",
      "If you get stuck, say what you are stuck on out loud. The interviewer can hint, but only if they know where you are.",
      "Use concrete example values when tracing through your code. Arbitrary variables are harder to follow.",
      "Ask clarifying questions at the start: 'Can the input be empty? Can there be duplicates? Is the array sorted?'",
    ],
    quiz: {
      setup: `# Two Sum with a hash map\n# time complexity?`,
      question: 'What is the time complexity of Two Sum with a hash map?',
      opts: ['O(n)', 'O(n^2)'],
      correct: 0,
    },
  },
  'p4-review': {
    concept: "Do not re-grind what you already know. That is comfort practice, not real practice. After every problem-solving session, write down every problem you hesitated on, looked up, or outright failed. Those topics are your weak spots. Target them EXCLUSIVELY until they become automatic.",
    code: `# A simple weak-spot log beats any fancy tool:
#
# | date       | problem                  | pattern         | status    |
# |------------|--------------------------|-----------------|-----------|
# | 2026-04-02 | Longest Repeating Substr | sliding window  | failed    |
# | 2026-04-03 | Group Anagrams           | hash + sort key | hesitated |
# | 2026-04-04 | Course Schedule          | topo sort / DFS | failed    |
#
# The rule: retire a topic from the list only when you can
# solve a FRESH problem from it cold, with no hints, and
# narrate it cleanly. That is real learning, not recognition.`,
    breakdown: "Spaced repetition works for coding patterns the same way it works for language learning. A pattern you failed three days ago needs to be re-attempted TODAY, not in a month. Keep a plain-text list. Schedule quick review sessions. Retire a topic only after a cold, unaided, clean solve. That is the real signal you have learned it.",
    remember: [
      "Keep a simple log: date, problem, pattern, status (failed, hesitated, solved).",
      "Only focus on patterns where you hesitated or failed. Solving easies you already know is comfort practice.",
      "Re-attempt a failed pattern WITHIN A FEW DAYS, not a month later.",
      "A topic is retired only when you solve a NEW problem from it cold, with no hints, narrated cleanly.",
      "If you keep failing the same pattern, go back to the pattern lesson and redo the base examples before attempting new problems.",
    ],
    quiz: {
      setup: `# you failed a sliding-window problem 3 days ago\n# when should you re-attempt it?`,
      question: 'When should you re-attempt a recently failed pattern?',
      opts: ['Within a few days, while it is still fresh', 'In a month or so'],
      correct: 0,
    },
  },
  'p4-final': {
    concept: "This is the final benchmark. Take a curated set of 25 mixed-pattern problems and solve them under real time pressure. If you can solve them cleanly, narrate them out loud, and state correct time and space complexities, you are interview-ready. Not earlier. Not based on how many problems you have READ, but on how many you can EXECUTE cold.",
    code: `# Final readiness checklist. Every box MUST be YES.
#
# [ ] I can recognize the pattern within 60 seconds on 9/10 mediums
# [ ] I can write bug-free code with minimal edits
# [ ] I can dry-run 2+ test cases without being prompted
# [ ] I can state time AND space complexity confidently
# [ ] I can explain tradeoffs (why hash map vs sort, etc.)
# [ ] I can handle follow-up questions without panicking
# [ ] I can finish a medium in about 25 minutes, fully narrated
#
# If any box is still empty, go back to p4-review,
# target that weakness, then retake the benchmark.`,
    breakdown: "Readiness is not 'I have seen all the patterns'. Readiness is 'I can produce a correct, narrated, complexity-analyzed solution under time pressure'. The gap between EXPOSURE and FLUENCY is exactly what this block closes. Do not confuse having studied a pattern with being able to execute it cold in front of a stranger.",
    remember: [
      "Exposure is not fluency. You must be able to solve a NEW problem from a pattern, not just recognize it.",
      "The readiness checklist is the bar: pattern in 60 seconds, clean code, dry-run, full complexity analysis, handle follow-ups.",
      "A medium should take you about 25 minutes when you are ready, leaving 5 for follow-ups.",
      "If any checklist box is empty, the fix is to target that specific weakness, not to grind more random problems.",
      "The strongest interview-ready signal is consistently solving timed mediums cleanly AND narrated, not a high problem count.",
    ],
    quiz: {
      setup: `# strongest signal you are interview ready?`,
      question: 'What is the strongest signal you are interview ready?',
      opts: [
        'Consistently solving timed mediums cleanly and narrated',
        'Having read through every pattern at least once',
      ],
      correct: 0,
    },
  },
};

// ─── SidebarPathCard ──────────────────────────────────────────────────────────

function SidebarPathCard({
  path, pathStatus, blocksComplete, isViewing, onClick,
}: {
  path: PathDef;
  pathStatus: PathStatus;
  blocksComplete: number;
  isViewing: boolean;
  onClick: () => void;
}) {
  const locked   = pathStatus === 'locked';
  const complete = pathStatus === 'complete';
  const pct      = Math.round((blocksComplete / path.blocks.length) * 100);
  const n        = String(path.order).padStart(2, '0');

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={cn(
        'group w-full text-left rounded-lg px-3 py-2.5 border transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        locked && 'cursor-default opacity-45 bg-[var(--ll-bg-subtle)] border-slate-200/60',
        !locked && 'cursor-pointer',
        isViewing && 'bg-[var(--ll-bg-tinted)] border-[var(--ll-accent)] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(37,99,235,0.25)]',
        !isViewing && complete && 'bg-[var(--ll-bg-card)] border-[var(--ll-success)]/40 hover:border-[var(--ll-success)]/70',
        !isViewing && !complete && !locked && 'bg-[var(--ll-bg-card)] border-[var(--ll-border)] hover:bg-[var(--ll-bg-hover)] hover:border-[var(--ll-border-strong)]',
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={cn(
            'font-mono text-[11px] font-bold tabular-nums tracking-wider',
            locked && 'text-slate-500',
            isViewing && 'text-blue-600',
            !isViewing && complete && 'text-emerald-600',
            !isViewing && !complete && !locked && 'text-slate-500',
          )}
        >
          {n}
        </span>
        {locked && <Lock size={11} className="text-slate-500" />}
        {!locked && complete && <CheckCircle2 size={13} strokeWidth={2.25} className="text-emerald-600" />}
      </div>
      <p
        className={cn(
          'text-[13.5px] font-semibold leading-tight mb-1 tracking-[-0.005em]',
          locked && 'text-slate-600',
          isViewing && 'text-slate-900',
          !isViewing && complete && 'text-slate-700',
          !isViewing && !complete && !locked && 'text-slate-900',
        )}
        style={SG}
      >
        {path.title}
      </p>
      <p
        className={cn(
          'text-[11.5px] leading-snug mb-2.5 line-clamp-2',
          locked && 'text-slate-500',
          isViewing && 'text-slate-600',
          !isViewing && complete && 'text-slate-500',
          !isViewing && !complete && !locked && 'text-slate-600',
        )}
      >
        {path.description}
      </p>
      {!locked && (
        <div>
          <div
            className={cn(
              'flex justify-between mb-1 text-[10.5px] font-medium',
              isViewing && 'text-slate-700',
              !isViewing && complete && 'text-slate-500',
              !isViewing && !complete && 'text-slate-600',
            )}
          >
            <span>{blocksComplete} / {path.blocks.length} blocks</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-[2px] rounded-full bg-white/80 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                complete ? 'bg-emerald-500' : 'bg-blue-500',
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  pathStatuses, viewingPathId, completedIds, onSelectPath, streakData,
}: {
  pathStatuses: Record<string, PathStatus>;
  viewingPathId: string;
  completedIds: Set<string>;
  onSelectPath: (id: string) => void;
  streakData: StreakData;
}) {
  const totalBlocks   = CURRICULUM.reduce((s, p) => s + p.blocks.length, 0);
  const totalComplete = completedIds.size;
  const masteryPct    = Math.round((totalComplete / totalBlocks) * 100);
  const workingPath   = CURRICULUM.find(p => pathStatuses[p.id] === 'unlocked') ?? CURRICULUM[0];

  return (
    <ShellSidebar
      footer={
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-slate-500 font-medium">Mastery</span>
              <span className="text-slate-700 font-semibold tabular-nums">{masteryPct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${masteryPct}%`, background: C.blue }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-slate-500">Streak</span>
            <span className="flex items-center gap-1 text-slate-600 font-medium tabular-nums">
              {streakData.currentStreak > 0 && (
                streakData.todayActive
                  ? <Flame size={11} className="text-emerald-400" />
                  : <Snowflake size={11} className="text-blue-400" />
              )}
              {streakData.currentStreak} day{streakData.currentStreak !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-slate-500">Problems</span>
            <span className="text-slate-600 font-medium tabular-nums">{totalComplete} done</span>
          </div>
        </div>
      }
    >
      <p className="text-[11px] font-bold text-slate-500 tracking-[0.16em] uppercase mb-3 px-1">
        Learning Paths
      </p>
      {CURRICULUM.map(path => (
        <SidebarPathCard
          key={path.id}
          path={path}
          pathStatus={pathStatuses[path.id] ?? 'locked'}
          blocksComplete={path.blocks.filter(b => completedIds.has(b.id)).length}
          isViewing={path.id === viewingPathId}
          onClick={() => onSelectPath(path.id)}
        />
      ))}
    </ShellSidebar>
  );
}

// ─── RightRail — performance dashboard ────────────────────────────────────────
// Rail primitives (RailHeader, MetricRow, Metric, RAIL_BOX) live in @/components/shell/RailPrimitives

// ─── Recommendation algorithm ─────────────────────────────────────────────────
// Picks the single best block to work on next, factoring in:
//   1. The active block on the currently-viewed path (highest priority)
//   2. The first active block on ANY unlocked path (cross-path fallback)
//   3. The first available (non-active, non-complete) block if nothing is active
// Returns { block, path } or null when everything is complete.

function getRecommendedBlock(
  viewingPath: PathDef,
  completedIds: Set<string>,
  pathStatuses: Record<string, PathStatus>,
): { block: CurriculumStep; path: PathDef } | null {
  // Helper: find the first incomplete block in a path
  const firstIncomplete = (p: PathDef) =>
    p.blocks.find(b => !completedIds.has(b.id));

  // 1. Prefer the active block on the path the user is looking at
  if (pathStatuses[viewingPath.id] !== 'locked' && pathStatuses[viewingPath.id] !== 'complete') {
    const b = firstIncomplete(viewingPath);
    if (b) return { block: b, path: viewingPath };
  }

  // 2. Fall back to the first active block across all unlocked paths (in order)
  for (const p of CURRICULUM) {
    if (pathStatuses[p.id] === 'locked' || pathStatuses[p.id] === 'complete') continue;
    const b = firstIncomplete(p);
    if (b) return { block: b, path: p };
  }

  return null;
}


function RightRail({
  path, pathStatus, completedIds, pathStatuses, onSelectBlock, onSelectPath,
  streakData, heatmapData, weaknessSpotlight,
}: {
  path: PathDef;
  pathStatus: PathStatus;
  completedIds: Set<string>;
  pathStatuses: Record<string, PathStatus>;
  onSelectBlock: (id: string) => void;
  onSelectPath: (id: string) => void;
  streakData: StreakData;
  heatmapData: HeatmapDay[];
  weaknessSpotlight: WeaknessSpotlight | null;
}) {
  const blocksComplete = path.blocks.filter(b => completedIds.has(b.id)).length;
  const blocksTotal    = path.blocks.length;
  const pct            = Math.round((blocksComplete / blocksTotal) * 100);

  // Mocked analytics — days since start, rate, estimated finish.
  const daysElapsed = 3;
  const rate        = blocksComplete / daysElapsed;
  const remaining   = blocksTotal - blocksComplete;
  const etaDays     = rate > 0 ? Math.ceil(remaining / rate) : null;

  const rateStr = rate.toFixed(1);
  const pctStr  = `${pct}%`;
  const etaStr  = remaining === 0 ? 'Done' : etaDays !== null ? `${etaDays}d` : '—';

  // Streak freeze handler
  const [freezePending, startFreezeTransition] = useTransition();
  const [localFreezesRemaining, setLocalFreezesRemaining] = useState(streakData.freezesRemaining);
  const [freezeUsed, setFreezeUsed] = useState(false);

  async function handleUseFreeze() {
    startFreezeTransition(async () => {
      const result = await useStreakFreeze();
      if (result.ok) {
        setLocalFreezesRemaining(result.freezesRemaining);
        setFreezeUsed(true);
      }
    });
  }

  const n = String(path.order).padStart(2, '0');

  return (
    <ShellRail>
          {/* 1 — Path Progress (dominant, mirrors sidebar "viewing" card) */}
          <section>
            <RailHeader>Path Progress</RailHeader>
            <div
              className={cn(
                'rounded-lg px-3 py-2.5 border',
                pathStatus === 'complete'
                  ? 'bg-[var(--ll-success-soft)] border-[var(--ll-success)]'
                  : 'bg-[var(--ll-bg-tinted)] border-[var(--ll-accent)]',
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'font-mono text-[11px] font-bold tabular-nums tracking-wider',
                    pathStatus === 'complete' ? 'text-emerald-600' : 'text-blue-600',
                  )}
                >
                  {n}
                </span>
                {pathStatus === 'complete' && (
                  <CheckCircle2 size={13} strokeWidth={2.25} className="text-emerald-600" />
                )}
              </div>
              <p
                className="text-[13.5px] font-semibold leading-tight mb-2.5 tracking-[-0.005em] text-slate-900"
                style={SG}
              >
                {path.title}
              </p>
              <div className="flex justify-between mb-1 text-[10.5px] font-medium text-slate-600">
                <span>{blocksComplete} / {blocksTotal} blocks</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-[2px] rounded-full bg-white/80 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    pathStatus === 'complete' ? 'bg-emerald-500' : 'bg-blue-500',
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </section>

          {/* 2 — Performance Overview */}
          <section>
            <RailHeader>Performance</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-3 gap-3')}>
              <Metric value={rateStr} label="per day" />
              <Metric value={pctStr} label="done" />
              <Metric value={etaStr} label="est. finish" />
            </div>
          </section>

          {/* 3 — Activity Heatmap + Streak Freeze */}
          <section>
            <RailHeader>Activity</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-3')}>
              <ActivityHeatmap data={heatmapData} weeks={7} />
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">
                  {streakData.currentStreak > 0
                    ? `${streakData.currentStreak} day streak${streakData.todayActive ? '' : ' · do something today!'}`
                    : 'Start your streak today'}
                </span>
                {streakData.longestStreak > 0 && (
                  <span className="text-slate-500 tabular-nums">Best: {streakData.longestStreak}d</span>
                )}
              </div>
              {/* Streak freeze */}
              {streakData.streakAtRisk && !freezeUsed && streakData.isPro && (
                <button
                  type="button"
                  onClick={handleUseFreeze}
                  disabled={freezePending || localFreezesRemaining <= 0}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-40"
                >
                  <Snowflake size={11} />
                  {freezePending ? 'Saving...' : `Use Streak Freeze (${localFreezesRemaining} left)`}
                </button>
              )}
              {freezeUsed && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-blue-700">
                  <Snowflake size={11} />
                  Streak saved!
                </div>
              )}
              {!streakData.isPro && streakData.currentStreak > 0 && (
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Snowflake size={10} />
                    Streak Freeze
                  </span>
                  <Badge variant="outline" className="text-[9.5px] px-1.5 py-0 h-4 border-slate-200 text-slate-500">
                    Pro
                  </Badge>
                </div>
              )}
            </div>
          </section>

          {/* 3.5 — Weakness Spotlight */}
          {weaknessSpotlight && (
            <section>
              <RailHeader>Weakness Spotlight</RailHeader>
              <div className={cn(RAIL_BOX, 'space-y-2.5')}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                  <span
                    className="text-[12px] font-semibold text-slate-900 tracking-[-0.005em]"
                    style={SG}
                  >
                    {weaknessSpotlight.pattern}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {weaknessSpotlight.failCount} of {weaknessSpotlight.totalAttempts} attempts failed
                  {' · '}
                  <span className="text-amber-700 font-medium">
                    {Math.round(weaknessSpotlight.failRate * 100)}% fail rate
                  </span>
                </p>
                <div className="space-y-1.5 pt-1">
                  {weaknessSpotlight.recommendedProblems.map(p => (
                    <Link
                      key={p.slug}
                      href={`/solve/${p.slug}?from=dashboard`}
                      className={cn(
                        'flex items-center justify-between rounded-md px-2.5 py-2',
                        'bg-white/80 border border-slate-200/40',
                        'hover:bg-slate-100 hover:border-slate-300/50 transition-colors',
                      )}
                    >
                      <span
                        className="text-[12px] font-medium text-slate-900 truncate mr-2"
                        style={SG}
                      >
                        {p.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-1.5 py-0 h-4 shrink-0 font-semibold',
                          p.difficulty === 'Easy' && 'border-emerald-300 text-emerald-700 bg-emerald-50',
                          p.difficulty === 'Medium' && 'border-amber-300 text-amber-700 bg-amber-50',
                          p.difficulty === 'Hard' && 'border-red-300 text-red-700 bg-red-50',
                        )}
                      >
                        {p.difficulty}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 4 — Recommended Problem */}
          {(() => {
            const rec = getRecommendedBlock(path, completedIds, pathStatuses);
            if (!rec) return null;
            const recN = String(rec.block.order).padStart(2, '0');
            const isSamePath = rec.path.id === path.id;
            return (
              <section>
                <RailHeader>Up Next</RailHeader>
                <button
                  type="button"
                  onClick={() => {
                    if (!isSamePath) onSelectPath(rec.path.id);
                    onSelectBlock(rec.block.id);
                  }}
                  className={cn(
                    'w-full text-left rounded-lg px-3 py-3 border transition-colors',
                    'bg-white border-slate-200',
                    'hover:bg-slate-100 hover:border-slate-300',
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold tabular-nums tracking-wider text-slate-500">
                      {recN}
                    </span>
                    {!isSamePath && (
                      <span className="text-[10.5px] text-slate-600 font-medium">
                        · {rec.path.title}
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[13.5px] font-semibold leading-tight text-slate-900 tracking-[-0.005em] mb-1"
                    style={SG}
                  >
                    {rec.block.title}
                  </p>
                  <p className="text-[11.5px] text-slate-600 leading-snug line-clamp-2">
                    {isLesson(rec.block) ? rec.block.subtitle : `Practice · ${rec.block.difficulty}`}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-blue-600 font-medium">
                    <ArrowRight size={11} strokeWidth={2} />
                    <span>Continue</span>
                  </div>
                </button>
              </section>
            );
          })()}

          {/* 5 — Spaced Repetition Review (Pro only, shows when cards due) */}
          <ReviewDueWidget />
    </ShellRail>
  );
}

// ─── Zigzag layout constants ─────────────────────────────────────────────────

const CARD_W      = 272;
const CARD_H      = 158;
const ROW_HEIGHT  = 228;
const CONTAINER_W = 640;
const CENTER_X    = CONTAINER_W / 2;
const ZIGZAG_X    = [CENTER_X + 150, CENTER_X, CENTER_X - 150, CENTER_X, CENTER_X + 150, CENTER_X, CENTER_X - 150, CENTER_X, CENTER_X + 150, CENTER_X, CENTER_X - 150];

function connPath(i: number): string {
  const x1 = ZIGZAG_X[i], x2 = ZIGZAG_X[i + 1];
  const y1 = i * ROW_HEIGHT + CARD_H;
  const y2 = (i + 1) * ROW_HEIGHT;
  const m  = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${m} ${x2} ${m} ${x2} ${y2}`;
}

function connStroke(from: BlockStatus, to: BlockStatus): string {
  if (from === 'complete' && to === 'complete') return 'rgba(16,185,129,0.8)';
  if (from === 'complete' && to === 'active')   return '#10B981';
  if (from === 'complete')                      return 'rgba(16,185,129,0.7)';
  if (from === 'active')                        return '#2563EB';
  return '#CBD5E8';
}

function connDash(from: BlockStatus): string {
  if (from === 'complete') return '0';
  if (from === 'active') return '6 8';
  return '4 8';
}

// ─── Block Card (zigzag node) ─────────────────────────────────────────────────

function BlockCard({ block, onOpen }: { block: BlockWithStatus & { type: 'lesson' }; onOpen: () => void }) {
  const { blockStatus } = block;
  const locked   = blockStatus === 'locked';
  const active   = blockStatus === 'active';
  const complete = blockStatus === 'complete';
  const n = String(block.order).padStart(2, '0');

  return (
    <button
      type="button"
      onClick={locked ? undefined : onOpen}
      disabled={locked}
      style={{
        width: CARD_W,
        height: CARD_H,
        ...(active
          ? {
              transform: 'scale(1.04)',
              boxShadow: '0 6px 20px rgba(37,99,235,0.15)',
              borderWidth: 2,
            }
          : {}),
      }}
      className={cn(
        'group relative text-left rounded-lg overflow-hidden p-4 flex flex-col',
        'border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        locked && 'cursor-default opacity-[0.28] bg-[var(--ll-bg-subtle)] border-slate-100 saturate-[0.3] dark:border-white/10',
        !locked && 'cursor-pointer',
        active && [
          'bg-white border-[var(--ll-accent)]',
          'hover:bg-[var(--ll-bg-tinted)]',
          'dark:bg-[var(--ll-bg-elevated)] dark:hover:bg-[var(--ll-bg-hover)]',
        ],
        complete && [
          'bg-[var(--ll-success-soft)] border-[var(--ll-success)]',
          'hover:brightness-[0.98]',
        ],
        !locked && !active && !complete && [
          'bg-[var(--ll-bg-elevated)] border-[var(--ll-border)]',
          'hover:bg-[var(--ll-bg-hover)] hover:border-[var(--ll-border-strong)]',
        ],
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          className={cn(
            'font-mono text-[13px] font-extrabold tabular-nums tracking-[0.14em]',
            locked && 'text-slate-500 dark:text-slate-400',
            active && 'text-blue-600 dark:text-blue-300',
            complete && 'text-emerald-700 dark:text-emerald-300',
            !locked && !active && !complete && 'text-slate-500 dark:text-slate-400',
          )}
        >
          {n}
        </span>
        {complete && <CheckCircle2 size={15} strokeWidth={2.5} className="text-emerald-700 dark:text-emerald-300" />}
        {locked && <Lock size={11} className="text-slate-500 dark:text-slate-400" />}
      </div>

      {/* Title */}
      <p
        className={cn(
          'text-[15px] font-semibold leading-snug mb-1 tracking-[-0.01em]',
          locked && 'text-slate-500 dark:text-slate-400',
          active && 'text-slate-900 dark:text-slate-50',
          complete && 'text-emerald-900 dark:text-emerald-100',
          !locked && !active && !complete && 'text-slate-900 group-hover:text-slate-900 dark:text-slate-100 dark:group-hover:text-white',
        )}
        style={SG}
      >
        {block.title}
      </p>

      {/* Subtitle */}
      <p
        className={cn(
          'text-[12.5px] leading-relaxed line-clamp-2',
          locked && 'text-slate-500 dark:text-slate-400',
          active && 'text-slate-600 dark:text-slate-300',
          complete && 'text-emerald-800/80 dark:text-emerald-200/85',
          !locked && !active && !complete && 'text-slate-600 dark:text-slate-300',
        )}
      >
        {block.subtitle}
      </p>

      {/* Footer: counts (pinned to bottom via mt-auto) */}
      {!locked && (
        <div
          className={cn(
            'mt-auto pt-3 flex items-center gap-4 text-[11.5px] font-medium tabular-nums',
            'border-t',
            active && 'border-blue-200 dark:border-blue-400/30',
            complete && 'border-emerald-500/40 dark:border-emerald-400/30',
            !active && !complete && 'border-slate-200 dark:border-white/10',
          )}
        >
          <span
            className={cn(
              'flex items-center gap-1.5',
              active && 'text-blue-700 dark:text-blue-300',
              complete && 'text-emerald-800 dark:text-emerald-200',
              !active && !complete && 'text-slate-600 dark:text-slate-300',
            )}
          >
            <BookOpen size={12} strokeWidth={2.25} />
            {block.lessonCount} {block.lessonCount === 1 ? 'lesson' : 'lessons'}
          </span>
          <span
            className={cn(
              'flex items-center gap-1.5',
              active && 'text-blue-700 dark:text-blue-300',
              complete && 'text-emerald-800 dark:text-emerald-200',
              !active && !complete && 'text-slate-600 dark:text-slate-300',
            )}
          >
            <Target size={12} strokeWidth={2.25} />
            {block.problemCount} {block.problemCount === 1 ? 'problem' : 'problems'}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── Practice Card (compact zigzag node for practice problems) ───────────────

function PracticeCard({ step, blockStatus, onOpen }: {
  step: PracticeStepDef;
  blockStatus: BlockStatus;
  onOpen: () => void;
}) {
  const locked   = blockStatus === 'locked';
  const active   = blockStatus === 'active';
  const complete = blockStatus === 'complete';

  return (
    <button
      type="button"
      onClick={locked ? undefined : onOpen}
      disabled={locked}
      style={{
        width: PRACTICE_W,
        height: PRACTICE_H,
        ...(active ? {
          transform: 'scale(1.04)',
          boxShadow: '0 0 18px 3px rgba(251,191,36,0.16), 0 0 36px 6px rgba(251,191,36,0.06)',
        } : {}),
      }}
      className={cn(
        'group relative text-left rounded-lg overflow-hidden px-3.5 py-2.5 flex flex-col justify-center',
        'border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50',
        locked && 'cursor-default opacity-[0.28] bg-[var(--ll-bg-subtle)] border-slate-100 saturate-[0.3]',
        !locked && 'cursor-pointer',
        active && [
          'bg-amber-500/[0.08] border-amber-400/50',
          'hover:bg-amber-500/[0.13] hover:border-amber-400/65',
          'ring-1 ring-amber-400/20',
        ],
        complete && [
          'bg-[var(--ll-success-soft)] border-[var(--ll-success)]',
          'hover:brightness-[0.98]',
        ],
        !locked && !active && !complete && [
          'bg-[var(--ll-bg-elevated)] border-amber-400/[0.15]',
          'hover:bg-[var(--ll-bg-hover)] hover:border-amber-400/30',
        ],
      )}
    >
      {/* Title row */}
      <div className="flex items-center gap-2 mb-1">
        <Target
          size={12}
          strokeWidth={2.25}
          className={cn(
            locked && 'text-slate-500',
            active && 'text-amber-600',
            complete && 'text-emerald-700',
            !locked && !active && !complete && 'text-amber-600',
          )}
        />
        <p
          className={cn(
            'text-[13.5px] font-semibold leading-snug truncate',
            locked && 'text-slate-500',
            active && 'text-slate-900',
            complete && 'text-emerald-900',
            !locked && !active && !complete && 'text-slate-900 group-hover:text-slate-900',
          )}
          style={SG}
        >
          {step.title}
        </p>
        {complete && <CheckCircle2 size={12} strokeWidth={2.5} className="text-emerald-700 shrink-0 ml-auto" />}
        {locked && <Lock size={10} className="text-slate-500 shrink-0 ml-auto" />}
      </div>
      {/* Difficulty pill + group label */}
      {!locked && (
        <div className="flex items-center gap-1.5 ml-5 min-w-0">
          <span
            className={cn(
              'inline-flex items-center shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-[0.08em] uppercase',
              step.difficulty === 'Easy'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : step.difficulty === 'Medium'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-red-50 text-red-700 border border-red-200',
            )}
          >
            {step.difficulty}
          </span>
          {step.group && (
            <span
              className="text-[10px] font-medium text-slate-500 truncate tracking-[0.02em]"
              title={step.group}
            >
              {step.group}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ─── Path View (zigzag roadmap) ───────────────────────────────────────────────

function PathView({
  path, pathStatus, completedIds, onSelectBlock, onOpenPractice,
}: {
  path: PathDef;
  pathStatus: PathStatus;
  completedIds: Set<string>;
  onSelectBlock: (id: string) => void;
  onOpenPractice: (slug: string) => void;
}) {
  const blocks         = getBlocksWithStatus(path, pathStatus, completedIds);
  const blocksComplete = blocks.filter(b => b.blockStatus === 'complete').length;
  const pct            = Math.round((blocksComplete / blocks.length) * 100);

  // Compute cumulative y-offsets for variable-height cards
  const yOffsets: number[] = [];
  let cumulativeY = 0;
  for (let i = 0; i < blocks.length; i++) {
    yOffsets.push(cumulativeY);
    cumulativeY += isPractice(blocks[i]) ? PRACTICE_ROW_H : ROW_HEIGHT;
  }
  const totalHeight = cumulativeY + 40;

  // Build connector paths between items with variable heights
  function varConnPath(i: number): string {
    const x1 = ZIGZAG_X[i % ZIGZAG_X.length];
    const x2 = ZIGZAG_X[(i + 1) % ZIGZAG_X.length];
    const cardH = isPractice(blocks[i]) ? PRACTICE_H : CARD_H;
    const y1 = yOffsets[i] + cardH;
    const y2 = yOffsets[i + 1];
    const m  = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${m} ${x2} ${m} ${x2} ${y2}`;
  }

  // Responsive scaling: when the surface is narrower than CONTAINER_W, scale
  // the zigzag to fit. At full width, scale = 1 (layout is unchanged).
  const fitRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  useEffect(() => {
    const el = fitRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setFitScale(w >= CONTAINER_W ? 1 : Math.max(0.5, w / CONTAINER_W));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="w-full max-w-[720px] lg:max-w-none py-8 px-8 lg:px-12">
      <PageHeader
        eyebrow={`Path ${path.order} of ${CURRICULUM.length}`}
        title={path.title}
        subtitle={path.description}
        right={
          <div className="text-right">
            <div className="h-[4px] w-28 rounded-full bg-slate-100 mb-1.5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: pathStatus === 'complete' ? C.emerald : C.blue }}
              />
            </div>
            <p className="text-[11.5px] font-medium tabular-nums" style={{ color: C.textMuted }}>
              {blocksComplete} / {blocks.length} complete
            </p>
          </div>
        }
      />

      {/* Zigzag roadmap — wrapped in a white "main path" surface */}
      <MainSurface className="py-10">
        <div ref={fitRef} className="flex justify-center" style={{ height: totalHeight * fitScale }}>
          <div
            className="relative"
            style={{
              width: CONTAINER_W,
              height: totalHeight,
              transform: fitScale === 1 ? undefined : `scale(${fitScale})`,
              transformOrigin: 'top center',
            }}
          >
          <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={CONTAINER_W} height={totalHeight}>
            {blocks.slice(0, -1).map((block, i) => (
              <path
                key={block.id}
                d={varConnPath(i)}
                stroke={connStroke(block.blockStatus, blocks[i + 1].blockStatus)}
                strokeWidth={2.5}
                strokeDasharray={connDash(block.blockStatus)}
                strokeLinecap="round"
                fill="none"
                style={{ filter: block.blockStatus === 'complete' ? 'drop-shadow(0 0 3px rgba(16,185,129,0.25))' : undefined }}
              />
            ))}
          </svg>
          {blocks.map((block, i) => {
            const zigX = ZIGZAG_X[i % ZIGZAG_X.length];
            if (isPractice(block)) {
              return (
                <div
                  key={block.id}
                  style={{ position: 'absolute', left: zigX - PRACTICE_W / 2, top: yOffsets[i], width: PRACTICE_W }}
                >
                  <PracticeCard
                    step={block}
                    blockStatus={block.blockStatus}
                    onOpen={() => onOpenPractice(block.problemSlug)}
                  />
                </div>
              );
            }
            return (
              <div
                key={block.id}
                style={{ position: 'absolute', left: zigX - CARD_W / 2, top: yOffsets[i], width: CARD_W }}
              >
                <BlockCard block={block as BlockWithStatus & { type: 'lesson' }} onOpen={() => onSelectBlock(block.id)} />
              </div>
            );
          })}
          </div>
        </div>
      </MainSurface>

      {/* Terminal badge */}
      <div className="flex justify-center mt-6">
        <div
          className="px-3 py-1.5 rounded-md text-[10px] font-semibold tracking-[0.12em] uppercase"
          style={{ border: `1px solid ${C.border}`, color: C.textMuted, background: C.cardBgDark }}
        >
          {pathStatus === 'complete' ? `${path.title} · Complete` : `${blocks.length} steps · ${path.title}`}
        </div>
      </div>
    </div>
  );
}

// ─── Center panel primitives ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3.5">
      <span
        className="shrink-0 text-[10px] font-bold tracking-[0.18em] uppercase"
        style={{ color: C.textMuted }}
      >
        {children}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

function LessonCode({ code }: { code: string }) {
  return (
    <div style={{ background: '#0A1628', border: `1px solid ${C.borderMid}`, borderRadius: 8, overflow: 'hidden' }}>
      <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
        {['#FF5F57', '#FFBD2E', '#28CA41'].map(c => (
          <div key={c} style={{ width: 8, height: 8, borderRadius: 4, background: c, opacity: 0.8 }} />
        ))}
        <span style={{ fontFamily: MONO_FONT, fontSize: 10, color: C.textMuted, marginLeft: 6 }}>python</span>
      </div>
      <pre
        style={{
          padding: '18px 22px',
          fontSize: 13.5,
          lineHeight: 1.8,
          color: '#CBD5E1',
          overflowX: 'auto',
          fontFamily: MONO_FONT,
          margin: 0,
        }}
      >
        {code}
      </pre>
    </div>
  );
}

function TryIt({ quiz, onCorrect }: { quiz: LessonPreview['quiz']; onCorrect?: () => void }) {
  const [answer, setAnswer] = useState<number | null>(null);
  const answered = answer !== null;
  const isCorrect = answered && answer === quiz.correct;

  return (
    <div>
      <pre
        style={{
          fontFamily: MONO_FONT,
          fontSize: 13,
          color: C.textSub,
          background: 'rgba(15,23,42,0.05)',
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: '12px 16px',
          marginBottom: 14,
          lineHeight: 1.7,
        }}
      >
        {quiz.setup}
      </pre>

      <p className="text-[14px] mb-3 font-medium" style={{ color: C.text, ...SG }}>
        {quiz.question}
      </p>

      <div className="flex gap-2 flex-wrap">
        {quiz.opts.map((opt, i) => {
          const isCorrect  = i === quiz.correct;
          const isSelected = answer === i;
          let bg     = 'rgba(15,23,42,0.05)';
          let border = C.border;
          let color  = C.textMuted;
          if (answered) {
            if (isCorrect)       { bg = 'rgba(16,185,129,0.1)';  border = 'rgba(16,185,129,0.3)';  color = C.emerald; }
            else if (isSelected) { bg = 'rgba(239,68,68,0.08)';  border = 'rgba(239,68,68,0.25)';  color = '#EF4444'; }
          }
          return (
            <button
              key={i}
              onClick={() => {
                if (answered) return;
                setAnswer(i);
                if (i === quiz.correct) onCorrect?.();
              }}
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                border: `1px solid ${border}`,
                background: bg,
                color,
                fontSize: 13,
                fontFamily: MONO_FONT,
                fontWeight: 500,
                cursor: answered ? 'default' : 'pointer',
                transition: 'all 0.12s',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <p className="mt-3 text-[13px] font-medium" style={{ color: isCorrect ? C.emerald : '#EF4444', ...SG }}>
          {isCorrect
            ? '✓ Correct. Advancing to next lesson...'
            : `✗ Incorrect. The answer is ${quiz.opts[quiz.correct]}.`}
        </p>
      )}
    </div>
  );
}

// ─── Lesson panel (center when block is selected) ─────────────────────────────

function LessonPanel({
  block, path, blocksWithStatus, onBack, onCompleteAndAdvance,
}: {
  block: BlockWithStatus & { type: 'lesson' };
  path: PathDef;
  blocksWithStatus: BlockWithStatus[];
  onBack: () => void;
  onCompleteAndAdvance: (id: string) => void;
}) {
  const preview  = LESSON_PREVIEWS[block.id] ?? null;
  const complete = block.blockStatus === 'complete';
  const currentIdx  = blocksWithStatus.findIndex(b => b.id === block.id);
  const isLastBlock = currentIdx >= 0 && currentIdx === blocksWithStatus.length - 1;
  const nextLabel   = isLastBlock ? 'Finish path' : 'Next lesson →';

  return (
    <motion.div
      key={block.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="px-7 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 -ml-2 mb-3 h-7 text-slate-500 hover:text-slate-700 text-[11.5px]"
        >
          <ChevronLeft size={12} />
          {path.title}
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-semibold leading-tight" style={{ ...SG, color: C.text, letterSpacing: '-0.02em' }}>
              {block.title}
            </h2>
            <p className="text-[12px] mt-1" style={{ color: C.textMuted }}>
              Block {block.order} of {blocksWithStatus.length} · {block.lessonCount} lessons · {block.problemCount} problems
            </p>
          </div>
          {complete && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 shrink-0 mt-1 gap-1">
              <CheckCircle2 size={10} />
              Complete
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {preview ? (
        <div className="px-7 py-7">
          <section className="mb-7">
            <SectionLabel>Concept</SectionLabel>
            <p className="text-[15px]" style={{ color: C.text, lineHeight: 1.7 }}>
              {preview.concept}
            </p>
          </section>

          <Separator className="mb-7" style={{ background: C.border }} />

          <section className="mb-7">
            <SectionLabel>Examples</SectionLabel>
            <LessonCode code={preview.code} />
          </section>

          <Separator className="mb-7" style={{ background: C.border }} />

          <section className="mb-7">
            <SectionLabel>Breakdown</SectionLabel>
            <p className="text-[15px]" style={{ color: C.text, lineHeight: 1.7 }}>
              {preview.breakdown}
            </p>
          </section>

          {preview.remember && preview.remember.length > 0 && (
            <>
              <Separator className="mb-7" style={{ background: C.border }} />

              <section className="mb-7">
                <SectionLabel>Remember</SectionLabel>
                <ul className="space-y-2.5">
                  {preview.remember.map((item, i) => (
                    <li
                      key={i}
                      className="text-[15px] flex gap-3"
                      style={{ color: C.text, lineHeight: 1.65 }}
                    >
                      <span
                        aria-hidden
                        className="shrink-0 mt-[9px]"
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: 999,
                          background: C.emerald,
                        }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          <Separator className="mb-7" style={{ background: C.border }} />

          <section className="mb-7">
            <SectionLabel>Try It</SectionLabel>
            <TryIt
              key={block.id}
              quiz={preview.quiz}
              onCorrect={() => {
                // Brief delay so the user sees the "✓ Correct" confirmation.
                setTimeout(() => onCompleteAndAdvance(block.id), 850);
              }}
            />
          </section>

          <Separator className="mb-5" style={{ background: C.border }} />

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1 text-slate-500 hover:text-slate-700 text-[12px]"
            >
              <ChevronLeft size={12} />
              Back to path
            </Button>
            <Button
              size="sm"
              onClick={() => onCompleteAndAdvance(block.id)}
              className="h-9 px-4 text-[12.5px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 hover:text-emerald-200"
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-7 py-8">
          <section className="mb-7">
            <SectionLabel>About this block</SectionLabel>
            <p className="text-[15.5px]" style={{ color: C.text, lineHeight: 1.7 }}>
              {block.description}
            </p>
          </section>

          <Separator className="mb-7" style={{ background: C.border }} />

          <section className="mb-7">
            <SectionLabel>What you&apos;ll learn</SectionLabel>
            <ul className="space-y-3">
              {block.skills.map(s => (
                <li key={s} className="flex items-start gap-3 text-[14.5px]" style={{ color: C.text, lineHeight: 1.55 }}>
                  <span className="size-1.5 rounded-full bg-emerald-500/70 shrink-0 inline-block mt-[9px]" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <Separator className="mb-5" style={{ background: C.border }} />

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-slate-500 hover:text-slate-700 text-[12px]">
              <ChevronLeft size={12} />
              Back to path
            </Button>
            <Button
              size="sm"
              onClick={() => onCompleteAndAdvance(block.id)}
              className="h-9 px-4 text-[12.5px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 hover:text-emerald-200"
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Center panel (orchestrates zigzag ↔ lesson) ─────────────────────────────

function CenterPanel({
  path, pathStatus, completedIds, selectedBlockId, onSelectBlock, onClearBlock, onCompleteAndAdvance, onOpenPractice,
}: {
  path: PathDef;
  pathStatus: PathStatus;
  completedIds: Set<string>;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onClearBlock: () => void;
  onCompleteAndAdvance: (id: string) => void;
  onOpenPractice: (slug: string) => void;
}) {
  const blocks        = getBlocksWithStatus(path, pathStatus, completedIds);
  const selectedStep  = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null;
  const selectedLesson = selectedStep && isLesson(selectedStep)
    ? (selectedStep as BlockWithStatus & { type: 'lesson' })
    : null;

  return (
    <AnimatePresence mode="wait">
      {selectedLesson ? (
        <LessonPanel
          key={selectedLesson.id}
          block={selectedLesson}
          path={path}
          blocksWithStatus={blocks}
          onBack={onClearBlock}
          onCompleteAndAdvance={onCompleteAndAdvance}
        />
      ) : (
        <motion.div
          key={`path-${path.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="px-4 pt-4 max-w-4xl mx-auto">
            <DashboardUpgradeBanner />
          </div>
          <PathView
            path={path}
            pathStatus={pathStatus}
            completedIds={completedIds}
            onSelectBlock={onSelectBlock}
            onOpenPractice={onOpenPractice}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── ProgressView (center — when "Progress" tab is active) ───────────────────

// Per-path color palette — keeps progress view color-coded without looking random.
const PATH_COLORS: Record<number, {
  bar: string;       // gradient for progress bar
  accent: string;    // text/icon accent
  bg: string;        // subtle card tint
  border: string;    // card border on hover/complete
  pill: string;      // stat pill bg
}> = {
  1: { bar: 'linear-gradient(90deg, #3b82f6, #6366f1)',   accent: '#818cf8', bg: 'rgba(99,102,241,0.06)',  border: 'rgba(99,102,241,0.35)',  pill: 'rgba(99,102,241,0.12)' },
  2: { bar: 'linear-gradient(90deg, #8b5cf6, #a78bfa)',   accent: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.35)', pill: 'rgba(167,139,250,0.12)' },
  3: { bar: 'linear-gradient(90deg, #f59e0b, #f97316)',   accent: '#fbbf24', bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.3)',   pill: 'rgba(251,191,36,0.12)' },
  4: { bar: 'linear-gradient(90deg, #14b8a6, #06b6d4)',   accent: '#2dd4bf', bg: 'rgba(45,212,191,0.06)',  border: 'rgba(45,212,191,0.35)',  pill: 'rgba(45,212,191,0.12)' },
  5: { bar: 'linear-gradient(90deg, #e11d48, #f43f5e)',   accent: '#fb7185', bg: 'rgba(251,113,133,0.06)', border: 'rgba(251,113,133,0.35)', pill: 'rgba(251,113,133,0.12)' },
};
const DEFAULT_PATH_COLOR = PATH_COLORS[1];
function pathColor(order: number) { return PATH_COLORS[order] ?? DEFAULT_PATH_COLOR; }

interface PathStats {
  path: PathDef;
  pathStatus: PathStatus;
  blocksComplete: number;
  blocksTotal: number;
  pct: number;
  lessonsComplete: number;
  problemsComplete: number;
}

function computePathStats(
  pathStatuses: Record<string, PathStatus>,
  completedIds: Set<string>,
): PathStats[] {
  return CURRICULUM.map(path => {
    const completedBlocks = path.blocks.filter(b => completedIds.has(b.id));
    return {
      path,
      pathStatus: pathStatuses[path.id] ?? 'locked',
      blocksComplete: completedBlocks.length,
      blocksTotal: path.blocks.length,
      pct: Math.round((completedBlocks.length / path.blocks.length) * 100),
      lessonsComplete: completedBlocks.filter(isLesson).reduce((s, b) => s + b.lessonCount, 0),
      problemsComplete: completedBlocks.filter(isLesson).reduce((s, b) => s + b.problemCount, 0),
    };
  });
}

// Row for a path — color-coded by path order.
function ProgressPathCard({
  stats, onClick,
}: {
  stats: PathStats;
  onClick: () => void;
}) {
  const { path, blocksComplete, blocksTotal, pct, pathStatus } = stats;
  const n = String(path.order).padStart(2, '0');
  const complete = pathStatus === 'complete';
  const pc = pathColor(path.order);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg px-3 py-2.5 border transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        complete
          ? 'bg-slate-50 border-emerald-500/25 hover:border-emerald-500/40'
          : 'bg-white border-slate-200 hover:bg-slate-100 hover:border-slate-300',
      )}
      style={pct > 0 && !complete ? { background: pc.bg } : undefined}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={cn(
            'font-mono text-[10px] font-bold tabular-nums tracking-wider',
          )}
          style={{ color: complete ? 'rgb(52 211 153 / 0.7)' : pc.accent }}
        >
          {n}
        </span>
        {complete && <CheckCircle2 size={12} strokeWidth={2.25} className="text-emerald-400" />}
      </div>
      <p
        className={cn(
          'text-[12.5px] font-semibold leading-tight mb-2.5 tracking-[-0.005em]',
          complete ? 'text-slate-700' : 'text-slate-800',
        )}
        style={SG}
      >
        {path.title}
      </p>
      <div
        className={cn(
          'flex justify-between mb-1 text-[9.5px] font-medium',
          complete ? 'text-slate-500' : 'text-slate-600',
        )}
      >
        <span>{blocksComplete} / {blocksTotal} blocks</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-[3px] rounded-full bg-white/80 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: complete
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : pc.bar,
          }}
        />
      </div>
    </button>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg px-3 py-2.5 text-[11.5px] text-slate-500 bg-white border border-slate-200">
      {children}
    </div>
  );
}

// Section header — matches the sidebar "Learning Paths" label exactly.
function SectionHeader({ children, count }: { children: React.ReactNode; count?: number }) {
  return (
    <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
      {children}
      {count !== undefined && <span className="ml-2 text-slate-700 tabular-nums">{count}</span>}
    </p>
  );
}

// ─── Progress page flourishes — "editorial dossier" aesthetic ────────────────
// The progress view leans into a magazine-spread feel: section sigils, dashed
// rules, oversized typography, a boarding-pass ticket, and a sticker wall.
// Intentional deviation from the otherwise reserved app chrome.

function DossierHeader({
  number, label, count, right, icon: Icon, iconColor,
}: {
  number: string;
  label: string;
  count?: number;
  right?: React.ReactNode;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string; style?: React.CSSProperties }>;
  iconColor?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        <span
          className="font-mono font-bold tabular-nums"
          style={{ fontSize: 9.5, letterSpacing: '0.22em', color: C.blue, textTransform: 'uppercase' }}
        >
          §{number}
        </span>
        <span className="text-[10px] font-bold text-slate-700 tracking-[0.16em] uppercase">
          {label}
        </span>
        {Icon && (
          <Icon size={11} strokeWidth={2.25} style={{ color: iconColor ?? '#64748b', transform: 'translateY(0.5px)' }} />
        )}
        {count !== undefined && (
          <span className="font-mono text-[9.5px] tabular-nums text-slate-400 tracking-[0.14em]">
            · {String(count).padStart(2, '0')}
          </span>
        )}
      </div>
      {right && (
        <span className="font-mono text-[9px] tabular-nums tracking-[0.18em] uppercase text-slate-400">
          {right}
        </span>
      )}
    </div>
  );
}

function StatPill({
  icon: Icon, label, value, color,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  label: string; value: number; color: string;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 border-2 flex items-center gap-2.5"
      style={{ background: `${color}14`, borderColor: `${color}55` }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
        style={{ background: color, boxShadow: `0 2px 0 ${color}aa, 0 4px 8px ${color}40` }}
      >
        <Icon size={14} strokeWidth={2.75} color="white" />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-slate-500 leading-none mb-1">
          {label}
        </div>
        <div className="text-[18px] font-extrabold tabular-nums leading-none text-slate-900" style={SG}>
          {value}
        </div>
      </div>
    </div>
  );
}

// XP math — tied to actual progress, feels generous.
const XP_PER_BLOCK   = 120;
const XP_PER_LESSON  = 10;
const XP_PER_PROBLEM = 15;
const XP_PER_SKILL   = 40;
const XP_PER_LEVEL   = 400;

function computeXp(totalComplete: number, totalLessons: number, totalProblems: number, skillsCount: number) {
  const totalXp   = totalComplete * XP_PER_BLOCK
                  + totalLessons  * XP_PER_LESSON
                  + totalProblems * XP_PER_PROBLEM
                  + skillsCount   * XP_PER_SKILL;
  const level       = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = totalXp % XP_PER_LEVEL;
  const xpToNext    = XP_PER_LEVEL - xpIntoLevel;
  const levelPct    = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100);
  return { totalXp, level, xpIntoLevel, xpToNext, levelPct };
}

function PlayerCard({
  level, xpIntoLevel, xpToNext, levelPct, totalXp,
  totalComplete, totalProblems, skillsCount,
}: {
  level: number; xpIntoLevel: number; xpToNext: number;
  levelPct: number; totalXp: number;
  totalComplete: number; totalProblems: number; skillsCount: number;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden border-[2px] border-slate-900/90 p-6"
      style={{
        background:
          'linear-gradient(135deg, #fef3c7 0%, #ffffff 35%, #ede9fe 70%, #dbeafe 100%)',
        boxShadow: '0 4px 0 rgba(15,23,42,0.88), 0 20px 50px -20px rgba(139,92,246,0.35)',
      }}
    >
      {/* confetti dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 12% 18%, #f59e0b 2px, transparent 2px), radial-gradient(circle at 85% 22%, #8b5cf6 2px, transparent 2px), radial-gradient(circle at 78% 78%, #ec4899 2px, transparent 2px), radial-gradient(circle at 22% 82%, #3b82f6 2px, transparent 2px)',
          backgroundSize: '220px 220px, 260px 260px, 200px 200px, 240px 240px',
        }}
      />

      {/* top ticker */}
      <div className="relative flex items-center justify-between mb-5">
        <span className="font-mono text-[9.5px] font-bold tracking-[0.22em] uppercase text-slate-600">
          Player Card · Season 1
        </span>
        <span className="font-mono text-[9.5px] font-bold tabular-nums tracking-[0.18em] text-slate-500">
          TOTAL XP · {totalXp.toLocaleString()}
        </span>
      </div>

      <div className="relative flex items-center gap-6 mb-6">
        {/* level medallion */}
        <div className="relative shrink-0 w-[124px] h-[124px] flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{ background: 'radial-gradient(circle, #fbbf24 0%, #8b5cf6 60%, transparent 80%)' }}
          />
          <div
            className="absolute inset-0 rounded-full border-[3px] border-dashed"
            style={{ borderColor: 'rgba(15,23,42,0.18)', animation: 'spin 40s linear infinite' }}
          />
          <div
            className="absolute inset-[8px] rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, #f59e0b, #ec4899, #8b5cf6, #3b82f6, #f59e0b)',
              filter: 'saturate(1.15)',
            }}
          />
          <div className="absolute inset-[14px] rounded-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
            <div className="text-center leading-none" style={SG}>
              <div className="text-[9.5px] font-mono font-bold tracking-[0.2em] uppercase text-amber-300 mb-1">LVL</div>
              <div
                className="text-[46px] font-extrabold tabular-nums text-white"
                style={{ letterSpacing: '-0.04em', textShadow: '0 0 12px rgba(251,191,36,0.5)' }}
              >
                {level}
              </div>
            </div>
          </div>
          <Sparkles size={20} strokeWidth={2.5} className="absolute -top-1 -right-1 text-amber-400" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
        </div>

        {/* XP bar + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-[11px] font-mono font-bold tracking-[0.18em] uppercase text-slate-700">
              Level {level} → {level + 1}
            </span>
            <span className="text-[10px] font-mono tabular-nums font-bold text-slate-600">
              {levelPct}%
            </span>
          </div>
          <div
            className="relative h-4 rounded-full border-2 border-slate-900/85 overflow-hidden"
            style={{ background: '#f1f5f9', boxShadow: 'inset 0 2px 3px rgba(15,23,42,0.12)' }}
          >
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${levelPct}%`,
                background: 'linear-gradient(90deg, #fbbf24 0%, #ec4899 45%, #8b5cf6 100%)',
                transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 0 10px rgba(236,72,153,0.6)',
              }}
            />
            {/* diagonal stripes overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                width: `${levelPct}%`,
                backgroundImage:
                  'repeating-linear-gradient(45deg, rgba(255,255,255,0.8) 0, rgba(255,255,255,0.8) 3px, transparent 3px, transparent 8px)',
              }}
            />
          </div>
          <div className="flex items-baseline justify-between mt-2.5">
            <span className="font-mono text-[12.5px] tabular-nums font-bold text-slate-900" style={SG}>
              {xpIntoLevel}
              <span className="text-slate-400 font-normal"> / {XP_PER_LEVEL}</span>
              <span className="text-[9.5px] font-normal text-slate-500 uppercase tracking-[0.18em] ml-1">xp</span>
            </span>
            <span className="font-mono text-[10px] tabular-nums font-semibold text-slate-500">
              <span className="text-amber-600 font-bold">{xpToNext}</span> xp to next
            </span>
          </div>
        </div>
      </div>

      {/* stat pills */}
      <div className="relative grid grid-cols-3 gap-2.5">
        <StatPill icon={Flame}  label="Blocks"   value={totalComplete} color="#f97316" />
        <StatPill icon={Swords} label="Problems" value={totalProblems} color="#ec4899" />
        <StatPill icon={Brain}  label="Skills"   value={skillsCount}   color="#8b5cf6" />
      </div>
    </div>
  );
}

// ─── Achievements ──────────────────────────────────────────────────────────

type AchievementTier = 'bronze' | 'silver' | 'gold';
const TIER_STYLES: Record<AchievementTier, { from: string; to: string; glow: string; ring: string }> = {
  bronze: { from: '#b45309', to: '#f59e0b', glow: '#fbbf24', ring: '#fde68a' },
  silver: { from: '#64748b', to: '#cbd5e1', glow: '#e2e8f0', ring: '#f1f5f9' },
  gold:   { from: '#b45309', to: '#fde047', glow: '#fef08a', ring: '#fef3c7' },
};

function AchievementTile({
  icon: Icon, name, hint, earned, tier,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  name: string; hint: string; earned: boolean; tier: AchievementTier;
}) {
  const c = TIER_STYLES[tier];
  return (
    <div
      className={cn(
        'group relative rounded-xl border-2 p-3 pt-4 flex flex-col items-center gap-2 text-center overflow-hidden',
        'transition-all duration-200',
        earned ? 'hover:-translate-y-1' : 'opacity-80',
      )}
      style={
        earned
          ? { background: `linear-gradient(155deg, ${c.from} 0%, ${c.to} 100%)`, borderColor: 'rgba(15,23,42,0.2)', boxShadow: `0 3px 0 rgba(15,23,42,0.35), 0 8px 18px ${c.glow}55` }
          : { background: '#f1f5f9', borderColor: '#e2e8f0' }
      }
      title={hint}
    >
      {earned && (
        <span
          className="absolute -top-1 -right-1 text-amber-300"
          style={{ filter: 'drop-shadow(0 0 4px #fde047)' }}
        >
          <Sparkles size={12} strokeWidth={2.5} />
        </span>
      )}
      <div
        className={cn(
          'relative w-11 h-11 rounded-full flex items-center justify-center border-2 shrink-0',
        )}
        style={
          earned
            ? { background: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.55)' }
            : { background: 'white', borderColor: '#cbd5e1' }
        }
      >
        {earned ? (
          <Icon size={18} strokeWidth={2.75} color="white" />
        ) : (
          <Lock size={14} strokeWidth={2.25} color="#94a3b8" />
        )}
      </div>
      <div
        className={cn('text-[10.5px] font-bold leading-tight tracking-[-0.005em]')}
        style={{ color: earned ? '#ffffff' : '#94a3b8', ...SG, textShadow: earned ? '0 1px 2px rgba(0,0,0,0.18)' : 'none' }}
      >
        {name}
      </div>
      <div
        className={cn('text-[9px] font-medium leading-snug opacity-90')}
        style={{ color: earned ? 'rgba(255,255,255,0.85)' : '#cbd5e1' }}
      >
        {hint}
      </div>
    </div>
  );
}

// ─── Boss card — each path rendered as an RPG boss encounter ───────────────

function BossCard({ stats, onClick }: { stats: PathStats; onClick: () => void }) {
  const { path, blocksComplete, blocksTotal, pct, pathStatus } = stats;
  const complete = pathStatus === 'complete';
  const hpRemaining = blocksTotal - blocksComplete;
  const hpPct = complete ? 0 : 100 - pct;
  const engaged = !complete && blocksComplete > 0;
  const pc = pathColor(path.order);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-xl border-2 p-4 overflow-hidden',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        'transition-transform hover:-translate-y-0.5',
        complete ? 'border-amber-400/60' : engaged ? 'border-slate-300' : 'border-slate-200',
      )}
      style={{
        background: complete
          ? 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)'
          : engaged
            ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            : '#ffffff',
        boxShadow: complete ? '0 2px 0 #d97706, 0 8px 18px rgba(251,191,36,0.25)' : '0 1px 0 rgba(15,23,42,0.04)',
      }}
    >
      {complete && (
        <span className="absolute top-2 right-2" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }}>
          <Crown size={16} strokeWidth={2.5} className="text-amber-500" />
        </span>
      )}
      {engaged && (
        <span
          className="absolute top-3 right-3 inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-rose-500"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
          </span>
          In Combat
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div
          className="relative w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: complete
              ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
              : pc.bar,
            boxShadow: complete ? '0 2px 0 #b45309' : `0 2px 0 ${pc.accent}aa`,
          }}
        >
          {complete ? <Trophy size={20} strokeWidth={2.5} color="white" /> : <Shield size={20} strokeWidth={2.5} color="white" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="font-mono text-[9px] font-bold tabular-nums tracking-[0.2em] uppercase"
              style={{ color: complete ? '#92400e' : pc.accent }}
            >
              Boss · {String(path.order).padStart(2, '0')}
            </span>
            {complete && (
              <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-amber-600">
                Defeated
              </span>
            )}
          </div>
          <p className="text-[14.5px] font-bold text-slate-900 leading-tight tracking-[-0.005em]" style={SG}>
            {path.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono font-bold tracking-[0.16em] uppercase text-slate-500 shrink-0">HP</span>
        <div
          className="flex-1 relative h-3.5 rounded-full overflow-hidden border-2"
          style={{ background: '#0f172a', borderColor: '#0f172a' }}
        >
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${hpPct}%`,
              background: complete
                ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                : hpPct > 50
                  ? 'linear-gradient(90deg, #dc2626, #f87171)'
                  : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.8) 0, rgba(255,255,255,0.8) 2px, transparent 2px, transparent 6px)',
            }}
          />
        </div>
        <span className="font-mono text-[10.5px] tabular-nums font-bold text-slate-700 shrink-0">
          {hpRemaining}<span className="text-slate-400 font-normal">/{blocksTotal}</span>
        </span>
      </div>
    </button>
  );
}

// ─── Quest card — replaces the old ticket stub ────────────────────────────

function RewardChip({
  icon: Icon, label, color,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  label: string; color: string;
}) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1 border-2"
      style={{ background: `${color}20`, borderColor: `${color}80` }}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center"
        style={{ background: color }}
      >
        <Icon size={11} strokeWidth={3} color="white" />
      </div>
      <span className="text-[11px] font-bold tabular-nums tracking-[-0.005em]" style={{ color, ...SG }}>
        {label}
      </span>
    </div>
  );
}

function QuestCard({
  block, path, onAccept,
}: {
  block: CurriculumStep;
  path: PathDef;
  onAccept: () => void;
}) {
  const pc = pathColor(path.order);
  const isL = isLesson(block);
  const xpReward = XP_PER_BLOCK
                 + (isL ? block.lessonCount  * XP_PER_LESSON  : 0)
                 + (isL ? block.problemCount * XP_PER_PROBLEM : XP_PER_PROBLEM);
  const skillsReward = isL ? block.skills.length : 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden border-[2px] border-slate-900/90"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        boxShadow: '0 4px 0 rgba(15,23,42,0.85), 0 24px 50px -20px rgba(99,102,241,0.45)',
      }}
    >
      {/* sparkle dots scattered */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 24%, #fbbf24 1px, transparent 1.5px), radial-gradient(circle at 82% 15%, #a78bfa 1px, transparent 1.5px), radial-gradient(circle at 70% 72%, #60a5fa 1px, transparent 1.5px), radial-gradient(circle at 30% 78%, #f9a8d4 1px, transparent 1.5px)',
          backgroundSize: '180px 180px, 220px 220px, 200px 200px, 240px 240px',
        }}
      />

      {/* NEW QUEST banner */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <Sparkles size={13} strokeWidth={2.75} className="text-amber-300" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
        <span
          className="text-[9.5px] font-mono font-bold tracking-[0.22em] uppercase text-amber-300"
          style={{ textShadow: '0 0 6px rgba(251,191,36,0.55)' }}
        >
          New Quest
        </span>
      </div>

      <div className="relative p-6 pr-28">
        <p
          className="text-[10px] font-mono font-bold tracking-[0.22em] uppercase mb-2"
          style={{ color: pc.accent, textShadow: `0 0 8px ${pc.accent}99` }}
        >
          {path.title}
        </p>
        <h3
          className="text-[22px] font-bold text-white mb-2 tracking-[-0.015em] leading-tight"
          style={SG}
        >
          {block.title}
        </h3>
        {isL && (
          <p className="text-[13px] leading-relaxed text-slate-300 mb-4 max-w-[46ch]">
            {block.subtitle}
          </p>
        )}
        {isPractice(block) && (
          <p className="text-[13px] leading-relaxed text-slate-300 mb-4">
            Practice encounter · {block.difficulty}
          </p>
        )}

        {/* Objectives */}
        {isL && (
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-5">
            <span className="text-[9.5px] font-mono font-bold tracking-[0.2em] uppercase text-slate-400">
              Objectives
            </span>
            <span className="text-[11.5px] font-semibold text-slate-100 flex items-center gap-1.5">
              <BookOpen size={12} strokeWidth={2.5} />
              {block.lessonCount} lesson{block.lessonCount === 1 ? '' : 's'}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11.5px] font-semibold text-slate-100 flex items-center gap-1.5">
              <Target size={12} strokeWidth={2.5} />
              {block.problemCount} problem{block.problemCount === 1 ? '' : 's'}
            </span>
          </div>
        )}

        {/* Rewards + Accept */}
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9.5px] font-mono font-bold tracking-[0.22em] uppercase text-slate-400">
              Rewards
            </span>
            <RewardChip icon={Zap}   label={`+${xpReward} XP`} color="#fbbf24" />
            {skillsReward > 0 && (
              <RewardChip icon={Brain} label={`+${skillsReward} skill${skillsReward === 1 ? '' : 's'}`} color="#a78bfa" />
            )}
          </div>
          <button
            type="button"
            onClick={onAccept}
            className={cn(
              'ml-auto inline-flex items-center gap-2 h-10 px-5 rounded-md text-[13px] font-extrabold text-slate-900',
              'bg-amber-400 hover:bg-amber-300 border-2 border-slate-900/85',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70',
              'transition tracking-[-0.005em]',
            )}
            style={{ ...SG, boxShadow: '0 3px 0 rgba(15,23,42,0.9)' }}
          >
            Accept Quest
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* ticker stripe */}
      <div className="relative flex h-1.5">
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="flex-1" style={{ background: i % 2 === 0 ? '#fbbf24' : '#1e1b4b' }} />
        ))}
      </div>
    </div>
  );
}

// Hash-based sticker palette — deterministic rotation + color per skill name.
const STICKER_PALETTES: Array<{ bg: string; ink: string; dot: string }> = [
  { bg: '#fef3c7', ink: '#92400e', dot: '#f59e0b' },
  { bg: '#dbeafe', ink: '#1e40af', dot: '#3b82f6' },
  { bg: '#ede9fe', ink: '#5b21b6', dot: '#8b5cf6' },
  { bg: '#ccfbf1', ink: '#115e59', dot: '#14b8a6' },
  { bg: '#fce7f3', ink: '#9d174d', dot: '#ec4899' },
  { bg: '#dcfce7', ink: '#14532d', dot: '#22c55e' },
  { bg: '#ffedd5', ink: '#9a3412', dot: '#f97316' },
  { bg: '#e0e7ff', ink: '#3730a3', dot: '#6366f1' },
];

function stickerHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── Skill Codex — Pokedex-style collection grid ───────────────────────────

function SkillCodex({ collected, all }: { collected: string[]; all: string[] }) {
  const mastered = new Set(collected);
  return (
    <div
      className="relative rounded-2xl border-2 border-slate-200 bg-white p-5 overflow-hidden"
      style={{ boxShadow: '0 1px 0 rgba(15,23,42,0.03), 0 20px 40px -30px rgba(15,23,42,0.2)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="relative flex items-center justify-between mb-3 pb-3 border-b-2 border-dashed border-slate-200">
        <div className="flex items-center gap-2">
          <BookOpen size={12} strokeWidth={2.5} className="text-slate-700" />
          <span className="text-[10px] font-mono font-bold tracking-[0.22em] uppercase text-slate-700">
            Skill Codex
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold tabular-nums tracking-[0.16em] text-slate-800">
          {collected.length}
          <span className="text-slate-400 font-normal"> / {all.length}</span>
          <span className="text-slate-400 font-normal uppercase ml-1">discovered</span>
        </span>
      </div>

      <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-2">
        {all.map((skill, i) => {
          const earned = mastered.has(skill);
          const h = stickerHash(skill);
          const palette = STICKER_PALETTES[h % STICKER_PALETTES.length];
          const slotNum = String(i + 1).padStart(3, '0');
          return (
            <div
              key={skill}
              className={cn(
                'relative rounded-lg border-2 p-2.5 flex flex-col gap-1.5 overflow-hidden',
                'transition-transform',
                earned ? 'hover:-translate-y-0.5' : '',
              )}
              style={
                earned
                  ? {
                      background: palette.bg,
                      borderColor: palette.dot,
                      boxShadow: `2px 2px 0 ${palette.dot}aa`,
                    }
                  : { background: '#f8fafc', borderColor: '#e2e8f0', borderStyle: 'dashed' }
              }
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'font-mono text-[9px] font-bold tabular-nums tracking-[0.12em]',
                  )}
                  style={{ color: earned ? palette.dot : '#cbd5e1' }}
                >
                  #{slotNum}
                </span>
                {earned ? (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: palette.dot, boxShadow: `0 0 6px ${palette.dot}` }}
                  />
                ) : (
                  <Lock size={10} strokeWidth={2.5} className="text-slate-300" />
                )}
              </div>
              <p
                className={cn('text-[11.5px] font-bold leading-tight tracking-[-0.005em]')}
                style={{ color: earned ? palette.ink : '#cbd5e1', ...SG }}
              >
                {earned ? skill : '???'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressView({
  pathStatuses, completedIds, onNavigateToPath, onResumeBlock,
}: {
  pathStatuses: Record<string, PathStatus>;
  completedIds: Set<string>;
  onNavigateToPath: (pathId: string) => void;
  onResumeBlock: (pathId: string, blockId: string) => void;
}) {
  const stats = computePathStats(pathStatuses, completedIds);

  const totalBlocks    = stats.reduce((s, p) => s + p.blocksTotal, 0);
  const totalComplete  = stats.reduce((s, p) => s + p.blocksComplete, 0);
  const totalLessons   = stats.reduce((s, p) => s + p.lessonsComplete, 0);
  const totalProblems  = stats.reduce((s, p) => s + p.problemsComplete, 0);
  const overallPct     = Math.round((totalComplete / totalBlocks) * 100);
  const pathsStarted   = stats.filter(s => s.blocksComplete > 0).length;

  // Strengths: paths with at least 50% progress (or fully complete), sorted by pct desc.
  const strengths = stats
    .filter(s => s.pathStatus === 'complete' || s.pct >= 50)
    .filter(s => s.blocksComplete > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  // Focus areas: unlocked paths below 50% that aren't complete, sorted by pct asc.
  const focusAreas = stats
    .filter(s => s.pathStatus !== 'locked' && s.pct < 50)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);

  // What's next: first incomplete block in the earliest unlocked, not-complete path.
  let nextUp: { path: PathDef; block: CurriculumStep } | null = null;
  for (const s of stats) {
    if (s.pathStatus !== 'unlocked') continue;
    const block = s.path.blocks.find(b => !completedIds.has(b.id));
    if (block) { nextUp = { path: s.path, block }; break; }
  }

  // Skills mastered: flatten skills[] from every completed block, deduped.
  const skillsMastered = Array.from(new Set(
    CURRICULUM.flatMap(p => p.blocks)
      .filter(b => completedIds.has(b.id))
      .filter(isLesson)
      .flatMap(b => b.skills),
  ));

  // Empty state: kill the wall of zeros, replace with a focused "start here" view.
  // The Overview/Strengths/Focus sections all read 0 for new users, which signals
  // "nothing here" instead of "you have somewhere to start".
  if (totalComplete === 0 && nextUp) {
    return (
      <div className="w-full max-w-[720px] mx-auto py-8 px-8 lg:px-12">
        <PageHeader
          eyebrow="Welcome"
          title="Your first lock-in"
          subtitle="One block at a time. Start here and the rest unlocks as you go."
        />

        <section className="mb-8">
          <div
            className="rounded-xl px-6 py-7 border border-blue-400/30"
            style={{
              background: `linear-gradient(135deg, ${pathColor(nextUp.path.order).bg.replace('0.06', '0.12')}, rgba(59,130,246,0.08))`,
            }}
          >
            <p
              className="text-[10px] font-bold tracking-[0.16em] uppercase mb-3"
              style={{ color: pathColor(nextUp.path.order).accent }}
            >
              Start with {nextUp.path.title}
            </p>
            <p
              className="text-[20px] font-semibold leading-snug text-slate-900 mb-2 tracking-[-0.01em]"
              style={SG}
            >
              {nextUp.block.title}
            </p>
            {isLesson(nextUp.block) && (
              <>
                <p className="text-[13.5px] leading-relaxed text-slate-700 mb-4">
                  {nextUp.block.subtitle}
                </p>
                <div className="flex items-center gap-4 mb-5 text-[12px] font-medium tabular-nums text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <BookOpen size={12} strokeWidth={2.25} />
                    {nextUp.block.lessonCount} {nextUp.block.lessonCount === 1 ? 'lesson' : 'lessons'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target size={12} strokeWidth={2.25} />
                    {nextUp.block.problemCount} {nextUp.block.problemCount === 1 ? 'problem' : 'problems'}
                  </span>
                </div>
              </>
            )}
            {isPractice(nextUp.block) && (
              <p className="text-[13.5px] leading-relaxed text-slate-700 mb-4">
                Practice problem · {nextUp.block.difficulty}
              </p>
            )}
            <button
              type="button"
              onClick={() => onResumeBlock(nextUp!.path.id, nextUp!.block.id)}
              className={cn(
                'inline-flex items-center h-11 px-6 rounded-md text-[14px] font-semibold text-slate-900',
                'bg-blue-500 hover:bg-blue-400 border border-blue-400/60',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70',
                'transition-colors',
              )}
              style={SG}
            >
              Start now
            </button>
          </div>
        </section>

        <section className="mb-8">
          <SectionHeader>The roadmap ahead</SectionHeader>
          <div className="space-y-2">
            {stats.map(s => (
              <ProgressPathCard
                key={s.path.id}
                stats={s}
                onClick={() => onNavigateToPath(s.path.id)}
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Gamification precompute — XP/level, achievements, codex universe.
  const pathsComplete  = stats.filter(s => s.pathStatus === 'complete').length;
  const halfwayTarget  = Math.ceil(totalBlocks / 2);
  const { totalXp, level, xpIntoLevel, xpToNext, levelPct } = computeXp(
    totalComplete, totalLessons, totalProblems, skillsMastered.length,
  );

  const allSkills = Array.from(new Set(
    CURRICULUM.flatMap(p => p.blocks).filter(isLesson).flatMap(b => b.skills),
  ));

  const achievements: Array<{
    id: string; name: string; hint: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
    earned: boolean; tier: AchievementTier;
  }> = [
    { id: 'first',         name: 'First Strike',   hint: 'Clear 1 block',                        icon: Zap,    earned: totalComplete >= 1,                       tier: 'bronze' },
    { id: 'warming',       name: 'Warming Up',     hint: 'Clear 5 blocks',                       icon: Flame,  earned: totalComplete >= 5,                       tier: 'bronze' },
    { id: 'momentum',      name: 'Momentum',       hint: 'Clear 10 blocks',                      icon: Swords, earned: totalComplete >= 10,                      tier: 'silver' },
    { id: 'pathfinder',    name: 'Pathfinder',     hint: 'Defeat a boss',                        icon: Shield, earned: pathsComplete >= 1,                       tier: 'silver' },
    { id: 'polymath',      name: 'Polymath',       hint: 'Master 10 skills',                     icon: Brain,  earned: skillsMastered.length >= 10,              tier: 'silver' },
    { id: 'halfway',       name: 'Halfway Hero',   hint: `Clear ${halfwayTarget} blocks`,        icon: Star,   earned: totalComplete >= halfwayTarget,            tier: 'gold' },
    { id: 'champion',      name: 'Champion',       hint: 'Defeat 3 bosses',                      icon: Crown,  earned: pathsComplete >= 3,                        tier: 'gold' },
    { id: 'completionist', name: 'Completionist',  hint: 'Defeat every boss',                    icon: Trophy, earned: pathsComplete === CURRICULUM.length,       tier: 'gold' },
  ];
  const earnedCount = achievements.filter(a => a.earned).length;

  // Active bosses = unlocked paths that aren't complete (show most-engaged first).
  const activeBosses = stats
    .filter(s => s.pathStatus !== 'locked' && s.pathStatus !== 'complete')
    .sort((a, b) => b.pct - a.pct);
  const defeatedBosses = stats.filter(s => s.pathStatus === 'complete');

  return (
    <div className="w-full max-w-[720px] mx-auto py-8 px-8 lg:px-12">
      <PageHeader
        eyebrow="Season 1"
        title="Your Campaign"
        subtitle={
          totalComplete === 0
            ? "You haven't started yet. Pick a block from the Path tab and begin."
            : `Level ${level} · ${totalXp.toLocaleString()} XP earned · ${earnedCount} / ${achievements.length} achievements.`
        }
        right={
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-[0.18em] uppercase text-slate-500">
              <Medal size={12} strokeWidth={2.5} className="text-amber-500" />
              Mastery
            </div>
            <div
              className="text-[38px] font-extrabold tabular-nums leading-none"
              style={{
                ...SG,
                background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 ${overallPct > 0 ? 10 : 0}px rgba(236,72,153,0.45))`,
              }}
            >
              {overallPct}%
            </div>
            <div className="text-[9.5px] font-mono tabular-nums text-slate-500">
              {pathsStarted}/{CURRICULUM.length} paths engaged
            </div>
          </div>
        }
      />

      {/* § 01 — Player Card */}
      <section className="mb-10">
        <DossierHeader number="01" label="Player Card" right={`XP ${totalXp.toLocaleString()}`} />
        <PlayerCard
          level={level}
          xpIntoLevel={xpIntoLevel}
          xpToNext={xpToNext}
          levelPct={levelPct}
          totalXp={totalXp}
          totalComplete={totalComplete}
          totalProblems={totalProblems}
          skillsCount={skillsMastered.length}
        />
      </section>

      {/* § 02 — Achievements */}
      <section className="mb-10">
        <DossierHeader
          number="02"
          label="Trophy Cabinet"
          icon={Trophy}
          iconColor="#f59e0b"
          right={`${earnedCount} / ${achievements.length} earned`}
        />
        <div className="grid grid-cols-4 gap-2">
          {achievements.map(a => (
            <AchievementTile
              key={a.id}
              icon={a.icon}
              name={a.name}
              hint={a.hint}
              earned={a.earned}
              tier={a.tier}
            />
          ))}
        </div>
      </section>

      {/* § 03 — Active Quest */}
      <section className="mb-10">
        <DossierHeader number="03" label="Available Quest" icon={Sparkles} iconColor="#fbbf24" />
        {nextUp ? (
          <QuestCard
            block={nextUp.block}
            path={nextUp.path}
            onAccept={() => onResumeBlock(nextUp!.path.id, nextUp!.block.id)}
          />
        ) : (
          <EmptyHint>All quests completed. Victory.</EmptyHint>
        )}
      </section>

      {/* § 04 — Bosses */}
      <section className="mb-10">
        <DossierHeader
          number="04"
          label="Boss Encounters"
          icon={Swords}
          iconColor="#ef4444"
          right={`${defeatedBosses.length} / ${stats.length} defeated`}
        />
        {activeBosses.length > 0 ? (
          <div className="space-y-2 mb-2">
            {activeBosses.map(s => (
              <BossCard
                key={s.path.id}
                stats={s}
                onClick={() => onNavigateToPath(s.path.id)}
              />
            ))}
          </div>
        ) : null}
        {defeatedBosses.length > 0 && (
          <div className="space-y-2">
            {defeatedBosses.map(s => (
              <BossCard
                key={s.path.id}
                stats={s}
                onClick={() => onNavigateToPath(s.path.id)}
              />
            ))}
          </div>
        )}
        {activeBosses.length === 0 && defeatedBosses.length === 0 && (
          <EmptyHint>No bosses available. Unlock a path to engage.</EmptyHint>
        )}
      </section>

      {/* § 05 — Skill Codex */}
      <section className="mb-6">
        <DossierHeader
          number="05"
          label="Skill Codex"
          icon={Brain}
          iconColor="#8b5cf6"
          count={skillsMastered.length}
        />
        <SkillCodex collected={skillsMastered} all={allSkills} />
      </section>
    </div>
  );
}

// ─── Mobile gate — phones get bounced to the dedicated /m site ────────────────

function MobileGate() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(max-width: 767px)').matches) {
      router.replace('/m');
    }
  }, [router]);
  return (
    <div
      className="fixed inset-0 z-[100] md:hidden flex flex-col items-center justify-center px-6 text-center"
      style={{ background: C.bg }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-6"
        style={{ background: C.cardBg, borderColor: C.borderMid }}
      >
        <h3 className="text-[17px] font-semibold text-slate-900 mb-2" style={SG}>
          Opening mobile view
        </h3>
        <p className="text-[13.5px] text-slate-600 mb-5 leading-relaxed" style={SG}>
          Redirecting to the LeetLockin mobile site.
        </p>
        <button
          type="button"
          onClick={() => router.replace('/m')}
          className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold transition-colors w-full"
          style={SG}
        >
          Continue
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage({ initialCompleted, streakData, heatmapData, weaknessSpotlight }: {
  initialCompleted: string[];
  streakData: StreakData;
  heatmapData: HeatmapDay[];
  weaknessSpotlight: WeaknessSpotlight | null;
}) {
  const pathname = usePathname();
  const router   = useRouter();
  const [viewingPathId,   setViewingPathId]   = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('zl-viewing-path');
      if (saved && CURRICULUM.some(p => p.id === saved)) return saved;
    }
    return CURRICULUM[0].id;
  });
  const [completedIds,    setCompletedIds]    = useState<Set<string>>(() => new Set(initialCompleted));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showGuestGate,   setShowGuestGate]   = useState(false);
  const [, startTransition] = useTransition();
  const isGuestRef = useRef<boolean | null>(null);

  // Check auth once on mount — used to gate write actions for guests.
  // Also sync any already-solved problems with curriculum practice steps.
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      isGuestRef.current = !data.user;
      if (!data.user) return;

      // Catch-up sync: if a user solved a problem before (or from the library),
      // mark the matching curriculum practice steps as complete.
      fetch('/api/solved-slugs')
        .then(r => r.json())
        .then(({ slugs }: { slugs: string[] }) => {
          if (!slugs?.length) return;
          const solvedSet = new Set(slugs);
          const toSync: string[] = [];
          for (const path of CURRICULUM) {
            for (const step of path.blocks) {
              if (isPractice(step) && solvedSet.has(step.problemSlug) && !completedIds.has(step.id)) {
                toSync.push(step.id);
              }
            }
          }
          if (toSync.length > 0) {
            setCompletedIds(prev => {
              const next = new Set(prev);
              for (const id of toSync) next.add(id);
              return next;
            });
            for (const id of toSync) {
              startTransition(() => {
                setBlockCompleted(id, true).catch(err => {
                  console.error(`setBlockCompleted(${id}) catch-up sync failed:`, err);
                });
              });
            }
          }
        })
        .catch(() => { /* non-critical */ });
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const completeAndAdvance = useCallback((blockId: string) => {
    if (isGuestRef.current) {
      setShowGuestGate(true);
      return;
    }
    // Mark the block complete (idempotent — no-op if already complete).
    if (!completedIds.has(blockId)) {
      posthog.capture('block_completed', { block_id: blockId });
      setCompletedIds(prev => {
        if (prev.has(blockId)) return prev;
        const next = new Set(prev);
        next.add(blockId);
        return next;
      });
      startTransition(() => {
        setBlockCompleted(blockId, true).catch(err => {
          console.error(`setBlockCompleted(${blockId}) failed:`, err);
        });
      });
    }
    // Advance to the next block in the same path.
    // If the next step is a practice problem, go back to the path view so the
    // user sees the practice card highlighted as active.
    const path = CURRICULUM.find(p => p.blocks.some(b => b.id === blockId));
    if (!path) return;
    const idx  = path.blocks.findIndex(b => b.id === blockId);
    const next = path.blocks[idx + 1];
    setSelectedBlockId(next && isLesson(next) ? next.id : null);
    // Scroll back to the top so the next lesson starts at the beginning.
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [completedIds]);

  const pathStatuses  = computePathStatuses(completedIds);
  const viewingPath   = CURRICULUM.find(p => p.id === viewingPathId) ?? CURRICULUM[0];
  const viewingStatus = pathStatuses[viewingPath.id] ?? 'locked';

  const blocksWithStatus = getBlocksWithStatus(viewingPath, viewingStatus, completedIds);
  const firstOpenBlock   = blocksWithStatus.find(b => b.blockStatus === 'active' || b.blockStatus === 'available');
  // If a block is currently open, "Next lesson" should advance past it.
  // Otherwise fall back to the first active/available block in the path.
  const nextBlock = (() => {
    if (selectedBlockId) {
      const idx = viewingPath.blocks.findIndex(b => b.id === selectedBlockId);
      if (idx >= 0 && idx + 1 < viewingPath.blocks.length) {
        return viewingPath.blocks[idx + 1];
      }
      return undefined;
    }
    return firstOpenBlock;
  })();

  const handleSelectPath = (id: string) => {
    if (pathStatuses[id] === 'locked') return;
    setViewingPathId(id);
    localStorage.setItem('zl-viewing-path', id);
    setSelectedBlockId(null);
  };

  return (
    <AppShell
      activeTab="Path"
      unconstrained
      sidebar={
        <Sidebar
          pathStatuses={pathStatuses}
          viewingPathId={viewingPathId}
          completedIds={completedIds}
          onSelectPath={handleSelectPath}
          streakData={streakData}
        />
      }
      rail={
        <RightRail
          path={viewingPath}
          pathStatus={viewingStatus}
          completedIds={completedIds}
          pathStatuses={pathStatuses}
          onSelectBlock={(id) => setSelectedBlockId(id)}
          onSelectPath={handleSelectPath}
          streakData={streakData}
          heatmapData={heatmapData}
          weaknessSpotlight={weaknessSpotlight}
        />
      }
    >
      {/* Mobile gate — phones go to the dedicated /m experience, never the desktop UI */}
      <MobileGate />
      <CenterPanel
        path={viewingPath}
        pathStatus={viewingStatus}
        completedIds={completedIds}
        selectedBlockId={selectedBlockId}
        onSelectBlock={setSelectedBlockId}
        onClearBlock={() => setSelectedBlockId(null)}
        onCompleteAndAdvance={completeAndAdvance}
        onOpenPractice={(slug) => router.push(`/solve/${slug}?from=dashboard`)}
      />
      {nextBlock && viewingStatus !== 'complete' && (
        <button
          type="button"
          onClick={() => {
            if (isPractice(nextBlock)) {
              router.push(`/solve/${nextBlock.problemSlug}?from=dashboard`);
            } else {
              setSelectedBlockId(nextBlock.id);
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }
          }}
          className={cn(
            'fixed z-50 inline-flex items-center justify-center gap-2',
            'bottom-6 right-6 h-14 px-8 w-auto',
            'lg:bottom-4 lg:right-4 lg:h-16 lg:w-[272px] lg:px-6',
            'rounded-xl text-[15px] lg:text-[16px] font-semibold text-white tracking-[-0.005em]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            'transition-all hover:-translate-y-0.5',
            isPractice(nextBlock) ? 'border border-amber-400/60' : 'border border-blue-500/40',
          )}
          style={{
            ...SG,
            background: isPractice(nextBlock)
              ? 'linear-gradient(135deg, #F59E0B, #D97706)'
              : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            boxShadow: isPractice(nextBlock)
              ? '0 10px 25px rgba(251,191,36,0.45)'
              : '0 10px 25px rgba(37,99,235,0.35)',
          }}
        >
          {isPractice(nextBlock) ? 'Solve problem' : 'Next lesson'}
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      )}

      {/* Guest gate overlay */}
      <AnimatePresence>
        {showGuestGate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setShowGuestGate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm mx-4 rounded-xl border p-6 text-center"
              style={{ background: C.cardBg, borderColor: C.borderMid }}
            >
              <Lock size={28} className="mx-auto text-blue-400 mb-3" />
              <h3
                className="text-[16px] font-semibold text-slate-900 mb-1.5"
                style={SG}
              >
                Sign in to save progress
              </h3>
              <p className="text-[13px] text-slate-600 mb-5" style={SG}>
                Create a free account to track completed lessons and unlock your full learning path.
              </p>
              <div className="flex flex-col gap-2.5">
                <Link
                  href={`/sign-in?next=${encodeURIComponent(pathname)}`}
                  className="inline-flex items-center justify-center h-10 rounded-lg bg-blue-600 text-slate-900 text-[13px] font-semibold hover:bg-blue-500 transition-colors"
                  style={SG}
                >
                  Sign in
                </Link>
                <button
                  type="button"
                  onClick={() => setShowGuestGate(false)}
                  className="text-[12.5px] text-slate-500 hover:text-slate-700 transition-colors"
                  style={SG}
                >
                  Keep browsing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
