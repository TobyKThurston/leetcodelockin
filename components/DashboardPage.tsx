'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen, Target, CheckCircle2, Lock, TrendingUp, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { CURRICULUM, type PathDef, type BlockDef } from '@/lib/curriculum';
import { setBlockCompleted } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO_FONT = 'var(--font-geist-mono), ui-monospace, monospace';

// ─── Palette ─── matches landing page (#0b1220 main, #070c17 deep) ───────────
const C = {
  appBg:      '#0b1220',
  panelBg:    '#070c17',
  cardBg:     '#0f1729',
  cardBgDark: '#070c17',
  border:     'rgba(255,255,255,0.06)',
  borderMid:  'rgba(255,255,255,0.1)',
  text:       '#e5e7eb',
  textSub:    '#cbd5e1',
  textMuted:  '#94a3b8',
  textDim:    '#64748b',
  blue:       '#3b82f6',
  blueDim:    'rgba(59,130,246,0.12)',
  blueBorder: 'rgba(96,165,250,0.4)',
  emerald:    '#10b981',
  emeraldDim: 'rgba(16,185,129,0.1)',
  emeraldBorder: 'rgba(16,185,129,0.32)',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockStatus = 'locked' | 'available' | 'active' | 'complete';
type PathStatus  = 'locked' | 'unlocked' | 'complete';

interface BlockWithStatus extends BlockDef {
  blockStatus: BlockStatus;
}

// ─── Curriculum helpers ───────────────────────────────────────────────────────

function computePathStatuses(completedIds: Set<string>): Record<string, PathStatus> {
  const result: Record<string, PathStatus> = {};
  for (const path of CURRICULUM) {
    const allDone = path.blocks.every(b => completedIds.has(b.id));
    result[path.id] = allDone ? 'complete' : 'unlocked';
  }
  return result;
}

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
    concept: "Two pointers replaces a nested O(n²) scan with a single O(n) pass. You keep two indices moving across the array — either toward each other from the ends, or in the same direction at different speeds. The key skill is deciding which pointer to move based on the current comparison.",
    code: `# Pair sum on a sorted array — classic inward two-pointer
def pair_sum(nums, target):
    i, j = 0, len(nums) - 1
    while i < j:
        s = nums[i] + nums[j]
        if s == target:
            return [i, j]
        if s < target:
            i += 1   # need a bigger sum
        else:
            j -= 1   # need a smaller sum
    return []

pair_sum([1, 2, 4, 7, 11], 9)   # [1, 3]`,
    breakdown: "Because the array is sorted, comparing `nums[i] + nums[j]` to the target tells you exactly which pointer to move. Too small? Slide `i` right to pull in a larger value. Too big? Slide `j` left. Each element is visited at most once, giving O(n) with O(1) extra space.",
    quiz: {
      setup: `nums = [1, 3, 4, 6]\n# pair_sum(nums, 7) — i, j start at 0, 3`,
      question: 'Which pointer moves first?',
      opts: ['j moves left (1 + 6 = 7 found)', 'i moves right'],
      correct: 0,
    },
  },
  'p3-window': {
    concept: "A sliding window walks a contiguous range through an array or string, expanding on the right and contracting on the left. Instead of recomputing each window from scratch, you update the running state as the window moves — turning O(n·k) into O(n).",
    code: `# Longest substring without repeating chars — variable window
def longest_unique(s):
    seen = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1   # shrink past the duplicate
        seen[ch] = right
        best = max(best, right - left + 1)
    return best

longest_unique("abcabcbb")   # 3  ("abc")`,
    breakdown: "The window `[left, right]` only ever moves forward — `right` expands every iteration, and `left` jumps just past the last duplicate when one appears. Each character is visited at most twice (once by `right`, once when `left` passes it), so the total work is O(n).",
    quiz: {
      setup: `longest_unique("abba")`,
      question: 'What does this return?',
      opts: ['2', '3'],
      correct: 0,
    },
  },
  'p3-prefix': {
    concept: "A prefix sum precomputes cumulative totals so any range sum becomes a single subtraction. Build the prefix array in O(n), then answer any `sum(nums[i..j])` query in O(1). Combining prefix sums with a hash map unlocks subarray-count problems.",
    code: `# Range sums in O(1) after O(n) preprocessing
nums = [3, 1, 4, 1, 5, 9, 2, 6]

prefix = [0]
for n in nums:
    prefix.append(prefix[-1] + n)

def range_sum(i, j):          # inclusive
    return prefix[j + 1] - prefix[i]

range_sum(1, 3)   # 1 + 4 + 1 = 6
range_sum(0, 7)   # 31`,
    breakdown: "`prefix[k]` stores the sum of the first `k` elements. To get `nums[i..j]`, subtract `prefix[i]` (everything before `i`) from `prefix[j+1]` (everything through `j`). The `prefix[0] = 0` sentinel removes edge cases when `i = 0`.",
    quiz: {
      setup: `nums = [2, 4, 6, 8]\n# prefix = [0, 2, 6, 12, 20]\n# range_sum(1, 2)`,
      question: 'What does range_sum(1, 2) return?',
      opts: ['10', '12'],
      correct: 0,
    },
  },
  'p3-bsearch': {
    concept: "Binary search halves the search space each step — O(log n) instead of O(n). The power move is recognizing that \"search space\" doesn't have to be an array: you can binary-search an answer range whenever the predicate \"does value X work?\" is monotonic.",
    code: `# Standard binary search on a sorted array
def bsearch(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

bsearch([1, 3, 5, 7, 9, 11], 7)   # 3`,
    breakdown: "`mid = (lo + hi) // 2` picks the midpoint; the comparison tells you which half to discard. The `lo <= hi` guard (not `<`) is the standard inclusive-bounds version — forgetting the `=` is the classic off-by-one that misses the target when it lives at `lo == hi`.",
    quiz: {
      setup: `bsearch([1, 3, 5, 7, 9], 4)`,
      question: 'What does this return?',
      opts: ['2', '-1'],
      correct: 1,
    },
  },
  'p3-hashing': {
    concept: "Hash-map patterns turn brute-force O(n²) scans into O(n) one-pass solutions. The four shapes to recognize: complement (Two Sum), frequency counting, seen-before tracking, and grouping by key (anagrams). Once you see the shape, the code writes itself.",
    code: `# Group anagrams — key by the sorted letters
def group_anagrams(words):
    groups = {}
    for w in words:
        key = ''.join(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())

group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
# [['eat','tea','ate'], ['tan','nat'], ['bat']]`,
    breakdown: "Anagrams share the same sorted letters, so `sorted(w)` is a canonical key. `setdefault(key, [])` creates an empty list on first sight and returns the existing one afterward — cleaner than `if key not in groups: groups[key] = []`. One pass, O(n·k log k) where k is the word length.",
    quiz: {
      setup: `sorted("tea") == sorted("eat")`,
      question: 'What does this evaluate to?',
      opts: ['True', 'False'],
      correct: 0,
    },
  },
  'p3-stackpat': {
    concept: "Monotonic stacks keep their contents sorted (usually decreasing from bottom to top) so the next greater or next smaller element is always one pop away. Reach for this pattern whenever a problem asks \"for each element, what's the next one that...\" over a sequence.",
    code: `# Next greater element — monotonic decreasing stack
def next_greater(nums):
    res = [-1] * len(nums)
    stack = []                    # holds indices, values decreasing
    for i, n in enumerate(nums):
        while stack and nums[stack[-1]] < n:
            res[stack.pop()] = n
        stack.append(i)
    return res

next_greater([2, 1, 3, 4])   # [3, 3, 4, -1]`,
    breakdown: "Each index is pushed and popped at most once — that's the whole reason the pattern is O(n) despite the inner `while`. When a bigger number arrives, every smaller index waiting on the stack finally gets its answer and leaves. Indices still on the stack at the end have no greater element to the right, so they keep the default -1.",
    quiz: {
      setup: `next_greater([5, 4, 3])`,
      question: 'What does this return?',
      opts: ['[-1, -1, -1]', '[4, 3, -1]'],
      correct: 0,
    },
  },
  'p3-bfs': {
    concept: "BFS explores level by level using a queue, which makes it the tool for shortest-path problems on unweighted graphs and grids. The key trick is tracking levels explicitly — either by snapshotting `len(queue)` at the start of each step, or by tagging nodes with their distance as you enqueue them.",
    code: `from collections import deque

# Shortest path in an unweighted grid
def shortest(grid, start, end):
    R, C = len(grid), len(grid[0])
    q = deque([(start, 0)])         # (cell, distance)
    seen = {start}
    while q:
        (r, c), d = q.popleft()
        if (r, c) == end:
            return d
        for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and (nr,nc) not in seen and grid[nr][nc] == 0:
                seen.add((nr, nc))
                q.append(((nr, nc), d + 1))
    return -1`,
    breakdown: "Because BFS processes every cell in order of distance from the start, the first time you pop the target, its distance is guaranteed to be the shortest. Mark cells as `seen` the moment you enqueue them, not when you pop — otherwise the same cell can be queued many times and BFS degrades.",
    quiz: {
      setup: `# Unweighted BFS, first time we reach the end...`,
      question: 'The first time BFS pops the target, its distance is:',
      opts: ['always the shortest', 'an upper bound, may shorten later'],
      correct: 0,
    },
  },
  'p3-dfs': {
    concept: "Backtracking explores a decision tree by choosing, recursing, and then un-choosing. At each step you commit to a choice, recurse into the smaller problem, and then roll back before trying the next option. This shape powers subsets, permutations, combinations, and most constraint-satisfaction problems.",
    code: `# All subsets — the canonical backtracking template
def subsets(nums):
    res, path = [], []
    def dfs(i):
        if i == len(nums):
            res.append(path[:])       # snapshot!
            return
        dfs(i + 1)                    # skip nums[i]
        path.append(nums[i])          # take nums[i]
        dfs(i + 1)
        path.pop()                    # un-take (backtrack)
    dfs(0)
    return res

subsets([1, 2, 3])   # 8 subsets, [] through [1,2,3]`,
    breakdown: "`path[:]` appends a copy of the current state — without the slice, every stored subset would be the same mutating list. The `append` / recurse / `pop` trio is the backtracking heartbeat: commit → explore → undo. Master that rhythm and the rest of the template is just details.",
    quiz: {
      setup: `len(subsets([1, 2, 3]))`,
      question: 'How many subsets does [1, 2, 3] have?',
      opts: ['6', '8'],
      correct: 1,
    },
  },
  'p3-treepat': {
    concept: "Most tree problems follow the same shape: recurse into the left and right subtrees, then combine the results. You describe what happens at one node and trust the recursion. Diameter, balanced check, path sum, and lowest common ancestor are all variations on this single template.",
    code: `# Diameter of a binary tree — longest path through any node
def diameter(root):
    best = 0
    def depth(node):
        nonlocal best
        if not node:
            return 0
        L = depth(node.left)
        R = depth(node.right)
        best = max(best, L + R)     # path through this node
        return 1 + max(L, R)        # depth returned upward
    depth(root)
    return best`,
    breakdown: "The helper returns one value (depth) and updates another (best) via closure. At each node, `L + R` is the length of the longest path that bends at this node — we track the max across all nodes. The trick is that the function returns depth *up the call stack* but also *mutates* `best` along the way.",
    quiz: {
      setup: `#     1\n#    / \\\n#   2   3\n#  /\n# 4\n# diameter(root)`,
      question: 'What is the diameter?',
      opts: ['2', '3'],
      correct: 1,
    },
  },
  'p3-heappat': {
    concept: "Heap patterns solve problems that need repeated access to the smallest or largest element — top K, K closest, merge K sorted lists, running median. Python's `heapq` is always a min-heap; for a max-heap, push negatives. For running median, combine two heaps: a max-heap for the lower half and a min-heap for the upper half.",
    code: `import heapq

# K closest points to the origin — bounded max-heap
def k_closest(points, k):
    heap = []
    for x, y in points:
        dist = x*x + y*y
        # negate distance to simulate a max-heap
        heapq.heappush(heap, (-dist, x, y))
        if len(heap) > k:
            heapq.heappop(heap)     # drop the farthest
    return [(x, y) for _, x, y in heap]

k_closest([(1,3),(-2,2),(5,8),(0,1)], 2)   # [(-2,2),(0,1)]`,
    breakdown: "Because `heapq` is min-only, we store `-dist` so the largest actual distance sits at the top and gets popped first. The heap size never exceeds `k`, so every operation is O(log k) — overall O(n log k) instead of O(n log n) for a full sort.",
    quiz: {
      setup: `# To track the k LARGEST values, you use a...`,
      question: 'Which heap type?',
      opts: ['min-heap of size k', 'max-heap of size k'],
      correct: 0,
    },
  },
  'p3-dp': {
    concept: "Dynamic programming solves a hard problem by solving smaller overlapping versions of it and caching the answers. Two styles: top-down (recursion + memo) and bottom-up (fill a table). Every DP problem starts by asking: \"what's the smallest piece of state that fully determines the answer?\"",
    code: `# Climbing stairs — 1D DP, bottom-up
def climb(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

climb(5)   # 8   (it's Fibonacci in disguise)`,
    breakdown: "The state is just `i` — the current step — and the recurrence `dp[i] = dp[i-1] + dp[i-2]` says \"ways to reach step i = ways to reach (i-1) + ways to reach (i-2)\" because your last move was either a 1-step or a 2-step. Recognizing the recurrence is the whole challenge; filling the table is mechanical.",
    quiz: {
      setup: `climb(4)`,
      question: 'How many ways to climb 4 stairs (1 or 2 at a time)?',
      opts: ['5', '4'],
      correct: 0,
    },
  },
  'p4-breakdown': {
    concept: "Before writing a single line of code, run every problem through the same four steps: read carefully, identify inputs and outputs, check the constraints for pattern hints, then plan the approach. This ritual stops you from coding random ideas under pressure.",
    code: `# The 4-step breakdown — apply to every problem
# 1. READ       — what is actually being asked?
# 2. IDENTIFY   — inputs, outputs, return type
# 3. CONSTRAIN  — what do the limits tell you?
# 4. PLAN       — pick the pattern, sketch pseudocode

# Example: "Longest substring without repeating chars"
#   input   : str s,  1 <= len(s) <= 5 * 10**4
#   output  : int (length)
#   n ~ 5e4 → O(n**2) is 2.5e9 ops → TOO SLOW
#                     → must be O(n) or O(n log n)
#   pattern : sliding window + hash set`,
    breakdown: "The constraint n ≤ 5·10⁴ is doing real work for you — it rules out O(n²) (≈2.5·10⁹ operations, way over the ~10⁸/sec budget) and tells you to aim for O(n) or O(n log n). Reading constraints first narrows the pattern search before you write any code.",
    quiz: {
      setup: `# n can be up to 10**5\n# is an O(n**2) solution fast enough?`,
      question: 'With n up to 10⁵, is an O(n²) solution fast enough?',
      opts: ['Yes', 'No — need O(n log n) or O(n)'],
      correct: 1,
    },
  },
  'p4-optimize': {
    concept: "Always start with the obvious brute force. It gives you a correctness baseline and exposes the exact bottleneck. Then replace the expensive operation — usually a nested scan — with a better data structure to cut the complexity.",
    code: `# Two Sum — brute force: O(n**2)
def two_sum_brute(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]

# Optimal: hash map gives O(1) lookup → O(n)
def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i`,
    breakdown: "The brute force scans the rest of the array for each element — that inner loop *is* the bottleneck. The moment you notice \"I keep re-searching the same data\", reach for a hash map. Trading space for time (the `seen` dict) collapses O(n²) into O(n). This brute-force-then-optimize move is the single most reusable interview technique.",
    quiz: {
      setup: `# Two Sum brute force — nested loops\nfor i in range(n):\n    for j in range(i + 1, n): ...`,
      question: 'What is the time complexity of the brute force?',
      opts: ['O(n)', 'O(n²)'],
      correct: 1,
    },
  },
  'p4-clean': {
    concept: "Interviewers read your code as you write it. Descriptive names, early returns, and small helpers make your logic legible at a glance. Dense one-liners are a trap — readability beats cleverness every single time.",
    code: `# ✗ Messy — clever but unreadable
def f(a):
    return [x for x in a if x % 2 == 0 and x > 0][:3][::-1]

# ✓ Clean — each step names its intent
def first_three_positive_evens_reversed(nums):
    if not nums:
        return []
    positive_evens = [n for n in nums if n > 0 and n % 2 == 0]
    first_three    = positive_evens[:3]
    return first_three[::-1]`,
    breakdown: "Named intermediate variables act as self-documenting comments. `if not nums:` also reads directly as \"no nums\" — it expresses intent, not mechanics. Compare that to `if len(nums) == 0:` which forces the reader to translate. Small upgrades like this compound across a solution and make your thinking visible to the interviewer.",
    quiz: {
      setup: `nums = []\n# idiomatic empty-list check?`,
      question: 'Which is the idiomatic Python empty-list check?',
      opts: ['if not nums:', 'if len(nums) == 0:'],
      correct: 0,
    },
  },
  'p4-testing': {
    concept: "Before you click submit, trace through at least two test cases by hand: a normal case and an edge case. Empty input, a single element, duplicates, and extreme values are where ~90% of interview bugs hide.",
    code: `def first_duplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return n
        seen.add(n)
    return -1

# Dry run the edges, not just the happy path
first_duplicate([])           # []           → -1
first_duplicate([5])          # [5]          → -1
first_duplicate([1, 1])       # dup at idx 1 → 1
first_duplicate([1, 2, 3, 2]) # dup at idx 3 → 2`,
    breakdown: "Off-by-one errors hide in loop bounds. Always ask two questions about every loop: \"what does `i` equal on the last iteration?\" and \"do I correctly handle index 0 and index len-1?\" If you can't answer both without hesitating, you don't yet understand your own loop — and neither will the interviewer.",
    quiz: {
      setup: `nums = [10, 20, 30, 40, 50]\n# for i in range(len(nums) - 1): ...`,
      question: 'Which indices does this loop visit?',
      opts: ['0, 1, 2, 3', '0, 1, 2, 3, 4'],
      correct: 0,
    },
  },
  'p4-easy': {
    concept: "Easy rounds test fluency, not creativity. The goal is to recognize the pattern in under a minute, implement it in five, and explain it cleanly with time to spare. If you stall on easies, your pattern recall isn't automatic yet — that means more reps, not harder problems.",
    code: `# Target pacing for an EASY problem (30-min round)
# 0:00 - 0:01   read + restate the problem
# 0:01 - 0:03   walk through the example, identify pattern
# 0:03 - 0:05   state approach out loud, confirm with interviewer
# 0:05 - 0:12   code it, narrating as you go
# 0:12 - 0:15   dry-run 2 test cases (normal + edge)
# 0:15 - 0:18   state time & space complexity
# 0:18 - 0:30   follow-up questions

# If you're still coding at 0:20 on an EASY → slow down
# and talk through what you're stuck on. Silence is the enemy.`,
    breakdown: "The goal of an easy isn't just to solve it — it's to solve it *calmly and narrated*. Finishing with time to spare and a clean explanation is the exact behavior an interviewer is grading for. Rushing and silently grinding out a correct answer can still fail you because it doesn't show the signal they're looking for.",
    quiz: {
      setup: `# 30-minute interview round, EASY problem\n# how long should the solve take?`,
      question: 'What is a healthy target time for an easy problem?',
      opts: ['Under 15 minutes', 'The full 30 minutes'],
      correct: 0,
    },
  },
  'p4-medium': {
    concept: "Mediums are the real interview benchmark. Two pointers, sliding window, BFS/DFS, hash maps, and DP dominate this tier. Start by committing out loud to the pattern you think applies, sketch pseudocode, *then* write real code. Pattern-first, code-second.",
    code: `# Medium: "Longest substring without repeating characters"
#
# Pattern recognition (out loud):
#   "contiguous substring" → sliding window
#   "without repeating"    → hash set to track chars in window
#
# Pseudocode FIRST:
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
# Only THEN translate pseudocode → real Python.`,
    breakdown: "Mediums usually have two or three patterns that *could* apply. Commit out loud to one, explain why, then implement. Changing patterns mid-solution is the biggest time sink in interviews — it wastes the code you've already written and rattles your confidence. Pick, commit, execute.",
    quiz: {
      setup: `# problem: "longest substring without repeating characters"\n# which pattern applies first?`,
      question: 'Which pattern should you reach for first?',
      opts: ['Dynamic programming', 'Sliding window'],
      correct: 1,
    },
  },
  'p4-communication': {
    concept: "Think out loud. Narrate your approach, your reasoning, your tradeoffs, and your complexity analysis. Silent coding reads as luck. Narrated coding reads as engineering — and engineering is what gets the offer.",
    code: `# A well-narrated solution sounds like this:
#
# "Okay, I'm going to use a hash map to track each number's
#  index as I iterate. For each element n, I'll check if
#  target - n is already in the map."
#
#  — codes the loop —
#
# "Let me trace this with [2, 7, 11, 15], target = 9:
#   i=0, n=2, need 7, not seen → store 2 → 0
#   i=1, n=7, need 2, seen at 0 → return [0, 1]. Good."
#
# "Time O(n) — single pass, hash lookups are O(1) average.
#  Space O(n) — hash map holds up to n entries."`,
    breakdown: "Always state complexity at the end: \"O(n) time, O(n) space — one pass, hash lookups are O(1) average.\" Leaving this off is the #1 reason solid solutions get marked down. If the interviewer has to ask \"and what's the time complexity?\" you've left free points on the table.",
    quiz: {
      setup: `# Two Sum with a hash map\n# time complexity?`,
      question: 'What is the time complexity of Two Sum with a hash map?',
      opts: ['O(n)', 'O(n²)'],
      correct: 0,
    },
  },
  'p4-review': {
    concept: "Don't re-grind what you already know — that's comfort practice, not real practice. After every session, write down every problem you hesitated on, looked up, or failed. Those topics are your weak spots. Target them exclusively until they become automatic.",
    code: `# A simple weak-spot log beats any fancy tool:
#
# | date       | problem                  | pattern         | status    |
# |------------|--------------------------|-----------------|-----------|
# | 2026-04-02 | Longest Repeating Substr | sliding window  | failed    |
# | 2026-04-03 | Group Anagrams           | hash + sort key | hesitated |
# | 2026-04-04 | Course Schedule          | topo sort / DFS | failed    |
#
# Rule: retire a topic only when you can solve a fresh
# problem from it cold, with no hints, narrated cleanly.`,
    breakdown: "Spaced repetition works here exactly like it does for language learning. A pattern you failed three days ago needs to be re-attempted *today*, not in a month. Keep a plain-text list, schedule quick review sessions, and retire a topic only after a cold, unaided, clean solve. That's the real signal you've learned it.",
    quiz: {
      setup: `# you failed a sliding-window problem 3 days ago\n# when should you re-attempt it?`,
      question: 'When should you re-attempt a recently failed pattern?',
      opts: ['Within a few days, while it is fresh', 'In a month or so'],
      correct: 0,
    },
  },
  'p4-final': {
    concept: "The final benchmark. A curated set of 25 mixed-pattern problems under real time pressure. If you can solve them cleanly, narrate them out loud, and state correct time/space complexities, you are interview-ready — not earlier.",
    code: `# Final readiness checklist — all must be YES
#
# [ ] Can recognize the pattern within 60 seconds on 9/10 mediums
# [ ] Can write bug-free code with minimal edits
# [ ] Can dry-run 2+ test cases without prompting
# [ ] Can state time AND space complexity confidently
# [ ] Can explain tradeoffs (why hash map vs sort, etc.)
# [ ] Can handle follow-up questions without panicking
# [ ] Can finish a medium in ~25 minutes, narrated
#
# If any box is empty → go back to p4-review,
# target that weakness, then retake the benchmark.`,
    breakdown: "Readiness isn't \"I've seen all the patterns\" — it's \"I can produce a correct, narrated, complexity-analyzed solution under time pressure.\" The gap between exposure and fluency is exactly what this block closes. Don't confuse having studied a pattern with being able to execute it cold in front of a stranger.",
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

// ─── DashboardNav ─────────────────────────────────────────────────────────────

type DashView = 'path' | 'progress';

function DashboardNav({
  activeView,
  onSelectView,
}: {
  activeView: DashView;
  onSelectView: (view: DashView) => void;
}) {
  const [user, setUser] = useState<{ name?: string; image?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser({
        name: user.user_metadata?.full_name ?? user.email,
        image: user.user_metadata?.avatar_url,
      });
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  type Tab =
    | { label: string; href: string; view?: undefined }
    | { label: string; view: DashView; href?: undefined };

  const tabs: readonly Tab[] = [
    { label: 'Path',     view: 'path' },
    { label: 'Library',  href: '/library' },
    { label: 'Progress', view: 'progress' },
    { label: 'Settings', href: '/settings' },
  ] as const;

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: C.panelBg, borderBottom: `1px solid ${C.border}` }}>
      <div className="w-full flex items-center gap-3 px-5 h-12">
        <Link
          href="/"
          className="font-bold text-[15px] tracking-tight text-white mr-auto whitespace-nowrap"
          style={SG}
        >
          LeetLockin
        </Link>
        <nav className="flex items-center gap-0.5">
          {tabs.map(tab => {
            const isActive = tab.view !== undefined && tab.view === activeView;
            const classes = cn(
              'text-[12px] px-3',
              isActive ? 'text-white font-medium' : 'text-slate-400 hover:text-slate-200',
            );
            if (tab.href !== undefined) {
              return (
                <Button
                  key={tab.label}
                  variant="ghost"
                  size="sm"
                  className={classes}
                  nativeButton={false}
                  render={<Link href={tab.href} />}
                >
                  {tab.label}
                </Button>
              );
            }
            const view = tab.view;
            return (
              <Button
                key={tab.label}
                variant="ghost"
                size="sm"
                className={classes}
                onClick={() => onSelectView(view)}
              >
                {tab.label}
              </Button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Avatar size="sm" className="size-7">
            <AvatarImage src={user?.image} referrerPolicy="no-referrer" />
            <AvatarFallback className="text-[11px] font-semibold bg-slate-700 text-slate-200">{initial}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[11.5px] text-slate-500 hover:text-slate-300">
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

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
        locked && 'cursor-default opacity-45 bg-slate-900/30 border-slate-800/40',
        !locked && 'cursor-pointer',
        isViewing && 'bg-blue-500/[0.08] border-blue-400/50',
        !isViewing && complete && 'bg-slate-800/30 border-emerald-500/25 hover:border-emerald-500/40',
        !isViewing && !complete && !locked && 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600/70',
      )}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={cn(
            'font-mono text-[10px] font-bold tabular-nums tracking-wider',
            locked && 'text-slate-700',
            isViewing && 'text-blue-300',
            !isViewing && complete && 'text-emerald-400/70',
            !isViewing && !complete && !locked && 'text-slate-500',
          )}
        >
          {n}
        </span>
        {locked && <Lock size={10} className="text-slate-700" />}
        {!locked && complete && <CheckCircle2 size={12} strokeWidth={2.25} className="text-emerald-400" />}
      </div>
      <p
        className={cn(
          'text-[12.5px] font-semibold leading-tight mb-0.5 tracking-[-0.005em]',
          locked && 'text-slate-600',
          isViewing && 'text-white',
          !isViewing && complete && 'text-slate-300',
          !isViewing && !complete && !locked && 'text-slate-200',
        )}
        style={SG}
      >
        {path.title}
      </p>
      <p
        className={cn(
          'text-[10.5px] leading-snug mb-2.5',
          locked && 'text-slate-800',
          isViewing && 'text-slate-300',
          !isViewing && complete && 'text-slate-500',
          !isViewing && !complete && !locked && 'text-slate-400',
        )}
      >
        {path.description}
      </p>
      {!locked && (
        <div>
          <div
            className={cn(
              'flex justify-between mb-1 text-[9.5px] font-medium',
              isViewing && 'text-slate-300',
              !isViewing && complete && 'text-slate-500',
              !isViewing && !complete && 'text-slate-400',
            )}
          >
            <span>{blocksComplete} / {path.blocks.length} blocks</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="h-[2px] rounded-full bg-slate-900/60 overflow-hidden">
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
  pathStatuses, viewingPathId, completedIds, onSelectPath,
}: {
  pathStatuses: Record<string, PathStatus>;
  viewingPathId: string;
  completedIds: Set<string>;
  onSelectPath: (id: string) => void;
}) {
  const totalBlocks   = CURRICULUM.reduce((s, p) => s + p.blocks.length, 0);
  const totalComplete = completedIds.size;
  const masteryPct    = Math.round((totalComplete / totalBlocks) * 100);
  const workingPath   = CURRICULUM.find(p => pathStatuses[p.id] === 'unlocked') ?? CURRICULUM[0];

  return (
    <aside
      className="fixed left-0 bottom-0 flex flex-col"
      style={{
        top: 48,
        width: 304,
        background: C.panelBg,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      <ScrollArea className="flex-1">
        <div className="px-4 pt-5 pb-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
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
        </div>
      </ScrollArea>

      {/* Stats subpanel */}
      <div
        className="px-4 py-4 space-y-4"
        style={{ borderTop: `1px solid ${C.border}`, background: C.cardBgDark }}
      >
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-slate-500 font-medium">Mastery</span>
              <span className="text-slate-300 font-semibold tabular-nums">{masteryPct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${masteryPct}%`, background: C.blue }}
              />
            </div>
          </div>
          {([
            ['Streak',   '0 days'],
            ['Problems', `${totalComplete} done`],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex justify-between text-[11.5px]">
              <span className="text-slate-500">{label}</span>
              <span className="text-slate-400 font-medium tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── RightRail — performance dashboard ────────────────────────────────────────

// Section header — matches the left sidebar's "Learning Paths" label exactly.
function RailHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
      {children}
    </p>
  );
}

// Row with label on the left and a value on the right — matches sidebar stats.
function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11.5px]">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-medium tabular-nums">{value}</span>
    </div>
  );
}

// Big number + small label, stacked. Used in Performance Overview.
function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[18px] leading-none font-semibold text-slate-100 tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-slate-500 mt-1.5">{label}</div>
    </div>
  );
}

// Shared box style: matches an inactive `SidebarPathCard`.
const RAIL_BOX =
  'rounded-lg px-3 py-2.5 bg-slate-800/40 border border-slate-700/60';

function RightRail({
  path, pathStatus, completedIds,
}: {
  path: PathDef;
  pathStatus: PathStatus;
  completedIds: Set<string>;
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

  // Focus Signal — mocked values, deterministic so they don't jitter.
  const timeFocused    = 42;
  const problemsSolved = 5;
  const errors         = 2;

  const n = String(path.order).padStart(2, '0');

  return (
    <aside
      className="hidden lg:flex fixed right-0 flex-col"
      style={{
        top: 48,
        bottom: 0,
        width: 304,
        background: C.panelBg,
        borderLeft: `1px solid ${C.border}`,
      }}
    >
      <ScrollArea className="flex-1">
        <div className="px-4 pt-5 pb-[96px] space-y-5">

          {/* 1 — Path Progress (dominant, mirrors sidebar "viewing" card) */}
          <section>
            <RailHeader>Path Progress</RailHeader>
            <div
              className={cn(
                'rounded-lg px-3 py-2.5 border',
                pathStatus === 'complete'
                  ? 'bg-slate-800/30 border-emerald-500/25'
                  : 'bg-blue-500/[0.08] border-blue-400/50',
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'font-mono text-[10px] font-bold tabular-nums tracking-wider',
                    pathStatus === 'complete' ? 'text-emerald-400/70' : 'text-blue-300',
                  )}
                >
                  {n}
                </span>
                {pathStatus === 'complete' && (
                  <CheckCircle2 size={12} strokeWidth={2.25} className="text-emerald-400" />
                )}
              </div>
              <p
                className="text-[12.5px] font-semibold leading-tight mb-2.5 tracking-[-0.005em] text-white"
                style={SG}
              >
                {path.title}
              </p>
              <div className="flex justify-between mb-1 text-[9.5px] font-medium text-slate-300">
                <span>{blocksComplete} / {blocksTotal} blocks</span>
                <span className="tabular-nums">{pct}%</span>
              </div>
              <div className="h-[2px] rounded-full bg-slate-900/60 overflow-hidden">
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

          {/* 3 — Focus Signal */}
          <section>
            <RailHeader>Focus Signal</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              <MetricRow label="Time Focused"    value={`${timeFocused} min`} />
              <MetricRow label="Problems Solved" value={String(problemsSolved)} />
              <MetricRow label="Errors"          value={String(errors)} />
            </div>
          </section>

        </div>
      </ScrollArea>
    </aside>
  );
}

// ─── Zigzag layout constants ─────────────────────────────────────────────────

const CARD_W      = 272;
const CARD_H      = 158;
const ROW_HEIGHT  = 218;
const CONTAINER_W = 640;
const ZIGZAG_X    = [470, 320, 170, 320, 470, 320, 170, 320, 470, 320, 170];

function connPath(i: number): string {
  const x1 = ZIGZAG_X[i], x2 = ZIGZAG_X[i + 1];
  const y1 = i * ROW_HEIGHT + CARD_H;
  const y2 = (i + 1) * ROW_HEIGHT;
  const m  = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${m} ${x2} ${m} ${x2} ${y2}`;
}

function connStroke(from: BlockStatus, to: BlockStatus): string {
  if (from === 'complete' && to === 'complete') return 'rgba(16,185,129,0.35)';
  if (from === 'complete' && to === 'active')   return 'rgba(96,165,250,0.45)';
  if (from === 'complete')                      return 'rgba(16,185,129,0.3)';
  return 'rgba(255,255,255,0.14)';
}

function connDash(from: BlockStatus): string {
  return from === 'complete' ? '0' : '4 6';
}

// ─── Block Card (zigzag node) ─────────────────────────────────────────────────

function BlockCard({ block, onOpen }: { block: BlockWithStatus; onOpen: () => void }) {
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
      style={{ width: CARD_W, height: CARD_H }}
      className={cn(
        'group relative text-left rounded-lg overflow-hidden p-4 flex flex-col',
        'border transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        locked && 'cursor-default opacity-40 bg-[#0f1729] border-white/[0.04]',
        !locked && 'cursor-pointer',
        active && [
          'bg-blue-500/[0.08] border-blue-400/45',
          'hover:bg-blue-500/[0.12] hover:border-blue-400/60',
        ],
        complete && [
          'bg-[#0f1729] border-emerald-500/25',
          'hover:border-emerald-500/40',
        ],
        !locked && !active && !complete && [
          'bg-[#0f1729] border-white/[0.06]',
          'hover:bg-[#131b30] hover:border-white/[0.12]',
        ],
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <span
          className={cn(
            'font-mono text-[11px] font-bold tabular-nums tracking-[0.12em]',
            locked && 'text-slate-700',
            active && 'text-blue-300',
            complete && 'text-emerald-400/70',
            !locked && !active && !complete && 'text-slate-400',
          )}
        >
          {n}
        </span>
        {complete && <CheckCircle2 size={13} strokeWidth={2.25} className="text-emerald-400" />}
        {locked && <Lock size={11} className="text-slate-700" />}
      </div>

      {/* Title */}
      <p
        className={cn(
          'text-[15px] font-semibold leading-snug mb-1 tracking-[-0.01em]',
          locked && 'text-slate-600',
          active && 'text-white',
          complete && 'text-slate-400',
          !locked && !active && !complete && 'text-slate-100 group-hover:text-white',
        )}
        style={SG}
      >
        {block.title}
      </p>

      {/* Subtitle */}
      <p
        className={cn(
          'text-[12.5px] leading-relaxed',
          locked && 'text-slate-700',
          active && 'text-slate-300',
          complete && 'text-slate-500',
          !locked && !active && !complete && 'text-slate-400',
        )}
      >
        {block.subtitle}
      </p>

      {/* Footer: counts (pinned to bottom via mt-auto) */}
      {!locked && (
        <div
          className={cn(
            'mt-auto pt-3 flex items-center gap-4 text-[11px] font-medium tabular-nums',
            'border-t',
            active && 'border-blue-400/20',
            complete && 'border-emerald-400/15',
            !active && !complete && 'border-white/[0.06]',
          )}
        >
          <span
            className={cn(
              'flex items-center gap-1.5',
              active && 'text-blue-200',
              complete && 'text-slate-600',
              !active && !complete && 'text-slate-400',
            )}
          >
            <BookOpen size={11} strokeWidth={2.25} />
            {block.lessonCount} {block.lessonCount === 1 ? 'lesson' : 'lessons'}
          </span>
          <span
            className={cn(
              'flex items-center gap-1.5',
              active && 'text-blue-200',
              complete && 'text-slate-600',
              !active && !complete && 'text-slate-400',
            )}
          >
            <Target size={11} strokeWidth={2.25} />
            {block.problemCount} {block.problemCount === 1 ? 'problem' : 'problems'}
          </span>
        </div>
      )}
    </button>
  );
}

// ─── Path View (zigzag roadmap) ───────────────────────────────────────────────

function PathView({
  path, pathStatus, completedIds, onSelectBlock,
}: {
  path: PathDef;
  pathStatus: PathStatus;
  completedIds: Set<string>;
  onSelectBlock: (id: string) => void;
}) {
  const blocks         = getBlocksWithStatus(path, pathStatus, completedIds);
  const blocksComplete = blocks.filter(b => b.blockStatus === 'complete').length;
  const totalHeight    = blocks.length * ROW_HEIGHT + 40;
  const pct            = Math.round((blocksComplete / blocks.length) * 100);

  return (
    <div className="w-full max-w-[720px] lg:max-w-none py-8 px-8 lg:px-12">
      {/* Path header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: C.textMuted }}>
            Path {path.order} of {CURRICULUM.length}
          </p>
          <h2 className="text-[22px] font-bold" style={{ ...SG, color: C.text, letterSpacing: '-0.02em' }}>
            {path.title}
          </h2>
          <p className="text-[12.5px] mt-1.5" style={{ color: C.textMuted }}>{path.description}</p>
        </div>
        <div className="text-right pb-0.5 shrink-0 ml-8">
          <div className="h-[4px] w-28 rounded-full bg-slate-800 mb-1.5">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pathStatus === 'complete' ? C.emerald : C.blue }}
            />
          </div>
          <p className="text-[11.5px] font-medium tabular-nums" style={{ color: C.textMuted }}>
            {blocksComplete} / {blocks.length} complete
          </p>
        </div>
      </div>

      {/* Zigzag roadmap */}
      <div className="flex justify-center">
        <div className="relative" style={{ width: CONTAINER_W, height: totalHeight }}>
          <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} width={CONTAINER_W} height={totalHeight}>
            {blocks.slice(0, -1).map((block, i) => (
              <path
                key={block.id}
                d={connPath(i)}
                stroke={connStroke(block.blockStatus, blocks[i + 1].blockStatus)}
                strokeWidth={2}
                strokeDasharray={connDash(block.blockStatus)}
                strokeLinecap="round"
                fill="none"
              />
            ))}
          </svg>
          {blocks.map((block, i) => (
            <div
              key={block.id}
              style={{ position: 'absolute', left: ZIGZAG_X[i] - CARD_W / 2, top: i * ROW_HEIGHT, width: CARD_W }}
            >
              <BlockCard block={block} onOpen={() => onSelectBlock(block.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* Terminal badge */}
      <div className="flex justify-center mt-6">
        <div
          className="px-3 py-1.5 rounded-md text-[10px] font-semibold tracking-[0.12em] uppercase"
          style={{ border: `1px solid ${C.border}`, color: C.textMuted, background: C.cardBgDark }}
        >
          {pathStatus === 'complete' ? `${path.title} — Complete` : `${blocks.length} blocks · ${path.title}`}
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
      <div className="flex-1 h-px bg-white/[0.06]" />
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
          background: 'rgba(255,255,255,0.03)',
          border: `1px solid ${C.border}`,
          borderRadius: 6,
          padding: '12px 16px',
          marginBottom: 14,
          lineHeight: 1.7,
        }}
      >
        {quiz.setup}
      </pre>

      <p className="text-[13px] mb-3 font-medium" style={{ color: C.textSub, ...SG }}>
        {quiz.question}
      </p>

      <div className="flex gap-2 flex-wrap">
        {quiz.opts.map((opt, i) => {
          const isCorrect  = i === quiz.correct;
          const isSelected = answer === i;
          let bg     = 'rgba(255,255,255,0.04)';
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
        <p className="mt-3 text-[12.5px] font-medium" style={{ color: isCorrect ? C.emerald : '#EF4444', ...SG }}>
          {isCorrect
            ? '✓ Correct — advancing to next lesson…'
            : `✗ Incorrect — the answer is ${quiz.opts[quiz.correct]}`}
        </p>
      )}
    </div>
  );
}

// ─── Lesson panel (center when block is selected) ─────────────────────────────

function LessonPanel({
  block, path, blocksWithStatus, onBack, onCompleteAndAdvance,
}: {
  block: BlockWithStatus;
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
          className="gap-1 -ml-2 mb-3 h-7 text-slate-500 hover:text-slate-300 text-[11.5px]"
        >
          <ChevronLeft size={12} />
          {path.title}
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-bold leading-tight" style={{ ...SG, color: C.text, letterSpacing: '-0.02em' }}>
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
        <div className="px-7 py-7" style={{ maxWidth: 840 }}>
          <section className="mb-7">
            <SectionLabel>Concept</SectionLabel>
            <p className="text-[14px] leading-relaxed" style={{ color: C.textSub, ...SG }}>
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
            <p className="text-[14px] leading-relaxed" style={{ color: C.textSub, ...SG }}>
              {preview.breakdown}
            </p>
          </section>

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
              className="gap-1 text-slate-500 hover:text-slate-300 text-[12px]"
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
        <div className="px-7 py-8" style={{ maxWidth: 840 }}>
          <section className="mb-7">
            <SectionLabel>About this block</SectionLabel>
            <p className="text-[14px] leading-relaxed" style={{ color: C.textSub, ...SG }}>
              {block.description}
            </p>
          </section>

          <Separator className="mb-7" style={{ background: C.border }} />

          <section className="mb-7">
            <SectionLabel>Skills covered</SectionLabel>
            <ul className="space-y-2.5">
              {block.skills.map(s => (
                <li key={s} className="flex items-center gap-3 text-[13px]" style={{ color: C.textSub, ...SG }}>
                  <span className="size-1 rounded-full bg-slate-600 shrink-0 inline-block" />
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <Separator className="mb-5" style={{ background: C.border }} />

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-slate-500 hover:text-slate-300 text-[12px]">
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
  path, pathStatus, completedIds, selectedBlockId, onSelectBlock, onClearBlock, onCompleteAndAdvance,
}: {
  path: PathDef;
  pathStatus: PathStatus;
  completedIds: Set<string>;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onClearBlock: () => void;
  onCompleteAndAdvance: (id: string) => void;
}) {
  const blocks        = getBlocksWithStatus(path, pathStatus, completedIds);
  const selectedBlock = selectedBlockId ? blocks.find(b => b.id === selectedBlockId) : null;

  return (
    <AnimatePresence mode="wait">
      {selectedBlock ? (
        <LessonPanel
          key={selectedBlock.id}
          block={selectedBlock}
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
          <PathView
            path={path}
            pathStatus={pathStatus}
            completedIds={completedIds}
            onSelectBlock={onSelectBlock}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── ProgressView (center — when "Progress" tab is active) ───────────────────

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
      lessonsComplete: completedBlocks.reduce((s, b) => s + b.lessonCount, 0),
      problemsComplete: completedBlocks.reduce((s, b) => s + b.problemCount, 0),
    };
  });
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-3.5 py-3"
      style={{ background: C.cardBg, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center gap-1.5 text-slate-500 mb-2">
        {icon}
      </div>
      <div className="text-[22px] leading-none font-bold text-white tabular-nums" style={SG}>
        {value}
      </div>
      <div className="text-[10.5px] text-slate-500 mt-1.5 leading-tight">{label}</div>
    </div>
  );
}

function ProgressPathCard({
  stats, tone, onClick,
}: {
  stats: PathStats;
  tone: 'strength' | 'focus';
  onClick: () => void;
}) {
  const { path, blocksComplete, blocksTotal, pct, pathStatus } = stats;
  const n = String(path.order).padStart(2, '0');
  const complete = pathStatus === 'complete';
  const isStrength = tone === 'strength';

  const label = complete
    ? 'Mastered'
    : isStrength
      ? pct >= 75 ? 'Nearly complete' : 'Strong footing'
      : pct === 0 ? 'Not started' : 'Getting started';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-lg px-3.5 py-3 border transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        complete && 'bg-slate-800/40 border-emerald-500/30 hover:border-emerald-500/50',
        !complete && isStrength && 'bg-slate-800/40 border-emerald-500/20 hover:border-emerald-500/40',
        !complete && !isStrength && 'bg-slate-800/40 border-blue-400/25 hover:border-blue-400/50',
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={cn(
              'font-mono text-[10px] font-bold tabular-nums tracking-wider',
              complete || isStrength ? 'text-emerald-400/70' : 'text-blue-300',
            )}
          >
            {n}
          </span>
          <p
            className="text-[13.5px] font-semibold leading-tight text-slate-100 truncate"
            style={{ ...SG, letterSpacing: '-0.005em' }}
          >
            {path.title}
          </p>
        </div>
        <span className="text-[11.5px] font-semibold text-slate-300 tabular-nums shrink-0">{pct}%</span>
      </div>
      <div className="flex items-center justify-between text-[10.5px] text-slate-500 mb-2">
        <span>{label}</span>
        <span className="tabular-nums">{blocksComplete} / {blocksTotal} blocks</span>
      </div>
      <div className="h-[2px] rounded-full bg-slate-900/60 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            complete || isStrength ? 'bg-emerald-500' : 'bg-blue-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </button>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg px-3.5 py-3 text-[12px] text-slate-500"
      style={{ background: C.cardBg, border: `1px dashed ${C.border}` }}
    >
      {children}
    </div>
  );
}

function ProgressView({
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
  let nextUp: { path: PathDef; block: BlockDef } | null = null;
  for (const s of stats) {
    if (s.pathStatus !== 'unlocked') continue;
    const block = s.path.blocks.find(b => !completedIds.has(b.id));
    if (block) { nextUp = { path: s.path, block }; break; }
  }

  // Skills mastered: flatten skills[] from every completed block, deduped.
  const skillsMastered = Array.from(new Set(
    CURRICULUM.flatMap(p => p.blocks)
      .filter(b => completedIds.has(b.id))
      .flatMap(b => b.skills),
  ));

  return (
    <div className="w-full max-w-[880px] mx-auto py-8 px-8 lg:px-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: C.textMuted }}>
          Overview
        </p>
        <h2 className="text-[26px] font-bold" style={{ ...SG, color: C.text, letterSpacing: '-0.02em' }}>
          Your Progress
        </h2>
        <p className="text-[13px] mt-1.5" style={{ color: C.textMuted }}>
          {totalComplete === 0
            ? "You haven't started yet — pick a block from the Path tab and begin."
            : `You've completed ${totalComplete} of ${totalBlocks} blocks across ${CURRICULUM.length} paths.`}
        </p>
      </div>

      {/* Overall metrics */}
      <section className="mb-9">
        <SectionLabel>Overall</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatCard value={`${totalComplete}`}                 label="blocks complete"   icon={<CheckCircle2 size={12} strokeWidth={2.25} />} />
          <StatCard value={`${totalLessons}`}                  label="lessons covered"   icon={<BookOpen size={12} strokeWidth={2.25} />} />
          <StatCard value={`${totalProblems}`}                 label="problems practiced" icon={<Target size={12} strokeWidth={2.25} />} />
          <StatCard value={`${pathsStarted}/${CURRICULUM.length}`} label="paths started" icon={<Flame size={12} strokeWidth={2.25} />} />
        </div>
        <div
          className="rounded-lg px-4 py-3.5 border"
          style={{ background: C.cardBg, borderColor: C.borderMid }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11.5px] font-medium text-slate-400">Overall mastery</span>
            <span className="text-[11.5px] font-semibold text-slate-200 tabular-nums">{overallPct}%</span>
          </div>
          <div className="h-[3px] rounded-full bg-slate-900/60 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${overallPct}%`, background: C.blue }}
            />
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="mb-9">
        <div className="flex items-center gap-2 mb-3.5">
          <TrendingUp size={13} strokeWidth={2.25} className="text-emerald-400/80" />
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: C.textMuted }}>
            Strengths
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        {strengths.length > 0 ? (
          <div className="space-y-2.5">
            {strengths.map(s => (
              <ProgressPathCard
                key={s.path.id}
                stats={s}
                tone="strength"
                onClick={() => onNavigateToPath(s.path.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyHint>
            Complete at least half of a path to see strengths here.
          </EmptyHint>
        )}
      </section>

      {/* Focus Areas */}
      <section className="mb-9">
        <div className="flex items-center gap-2 mb-3.5">
          <Target size={13} strokeWidth={2.25} className="text-blue-300" />
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: C.textMuted }}>
            Focus Areas
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        {focusAreas.length > 0 ? (
          <div className="space-y-2.5">
            {focusAreas.map(s => (
              <ProgressPathCard
                key={s.path.id}
                stats={s}
                tone="focus"
                onClick={() => onNavigateToPath(s.path.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyHint>
            Nothing to focus on — you&apos;re crushing it.
          </EmptyHint>
        )}
      </section>

      {/* What's Next */}
      <section className="mb-9">
        <div className="flex items-center gap-2 mb-3.5">
          <ArrowRight size={13} strokeWidth={2.25} className="text-blue-300" />
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: C.textMuted }}>
            What&apos;s Next
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        {nextUp ? (
          <div
            className="rounded-lg px-4 py-4 border"
            style={{ background: 'rgba(59,130,246,0.08)', borderColor: C.blueBorder }}
          >
            <p className="text-[10px] font-bold text-blue-300/80 tracking-[0.14em] uppercase mb-1.5">
              Up next in {nextUp.path.title}
            </p>
            <p
              className="text-[17px] font-semibold leading-tight text-white mb-1"
              style={{ ...SG, letterSpacing: '-0.01em' }}
            >
              {nextUp.block.title}
            </p>
            <p className="text-[12.5px] leading-relaxed text-slate-300 mb-3.5">
              {nextUp.block.subtitle}
            </p>
            <div className="flex items-center gap-4 mb-3.5 text-[11px] font-medium tabular-nums text-blue-200">
              <span className="flex items-center gap-1.5">
                <BookOpen size={11} strokeWidth={2.25} />
                {nextUp.block.lessonCount} {nextUp.block.lessonCount === 1 ? 'lesson' : 'lessons'}
              </span>
              <span className="flex items-center gap-1.5">
                <Target size={11} strokeWidth={2.25} />
                {nextUp.block.problemCount} {nextUp.block.problemCount === 1 ? 'problem' : 'problems'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onResumeBlock(nextUp!.path.id, nextUp!.block.id)}
              className={cn(
                'inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-[12px] font-semibold text-blue-200',
                'bg-blue-500/[0.15] border border-blue-400/50',
                'hover:bg-blue-500/[0.22] hover:border-blue-400/70',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
                'transition-colors',
              )}
              style={SG}
            >
              Resume training
              <ArrowRight size={12} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <EmptyHint>
            No unlocked blocks remaining — you&apos;ve reached the end of the road.
          </EmptyHint>
        )}
      </section>

      {/* Skills Mastered */}
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3.5">
          <Sparkles size={13} strokeWidth={2.25} className="text-emerald-400/80" />
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: C.textMuted }}>
            Skills Mastered
          </span>
          <span className="text-[10px] font-medium text-slate-500 tabular-nums">
            {skillsMastered.length}
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        {skillsMastered.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {skillsMastered.map(skill => (
              <span
                key={skill}
                className="rounded-md px-2.5 py-1 text-[11.5px] font-medium text-emerald-200/90"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.22)',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <EmptyHint>
            Complete your first block to start collecting skills here.
          </EmptyHint>
        )}
      </section>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage({ initialCompleted }: { initialCompleted: string[] }) {
  const [activeView,      setActiveView]      = useState<DashView>('path');
  const [viewingPathId,   setViewingPathId]   = useState(CURRICULUM[0].id);
  const [completedIds,    setCompletedIds]    = useState<Set<string>>(() => new Set(initialCompleted));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const completeAndAdvance = useCallback((blockId: string) => {
    // Mark the block complete (idempotent — no-op if already complete).
    if (!completedIds.has(blockId)) {
      setCompletedIds(prev => {
        if (prev.has(blockId)) return prev;
        const next = new Set(prev);
        next.add(blockId);
        return next;
      });
      startTransition(() => {
        setBlockCompleted(blockId, true);
      });
    }
    // Advance to the next block in the same path.
    const path = CURRICULUM.find(p => p.blocks.some(b => b.id === blockId));
    if (!path) return;
    const idx  = path.blocks.findIndex(b => b.id === blockId);
    const next = path.blocks[idx + 1];
    setSelectedBlockId(next ? next.id : null);
    // Scroll back to the top so the next lesson starts at the beginning.
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [completedIds]);

  const pathStatuses  = computePathStatuses(completedIds);
  const viewingPath   = CURRICULUM.find(p => p.id === viewingPathId) ?? CURRICULUM[0];
  const viewingStatus = pathStatuses[viewingPath.id] ?? 'locked';

  const blocksWithStatus = getBlocksWithStatus(viewingPath, viewingStatus, completedIds);
  const nextBlock        = blocksWithStatus.find(b => b.blockStatus === 'active' || b.blockStatus === 'available');

  const handleSelectPath = (id: string) => {
    if (pathStatuses[id] === 'locked') return;
    setViewingPathId(id);
    setSelectedBlockId(null);
    setActiveView('path');
  };

  const handleNavigateToPath = (pathId: string) => {
    if (pathStatuses[pathId] === 'locked') return;
    setViewingPathId(pathId);
    setSelectedBlockId(null);
    setActiveView('path');
  };

  const handleResumeBlock = (pathId: string, blockId: string) => {
    if (pathStatuses[pathId] === 'locked') return;
    setViewingPathId(pathId);
    setSelectedBlockId(blockId);
    setActiveView('path');
  };

  const isProgressView = activeView === 'progress';

  return (
    <div className="min-h-screen" style={{ background: C.appBg }}>
      <DashboardNav activeView={activeView} onSelectView={setActiveView} />
      <Sidebar
        pathStatuses={pathStatuses}
        viewingPathId={viewingPathId}
        completedIds={completedIds}
        onSelectPath={handleSelectPath}
      />
      {!isProgressView && (
        <RightRail
          path={viewingPath}
          pathStatus={viewingStatus}
          completedIds={completedIds}
        />
      )}
      <main
        style={{ paddingLeft: 304, paddingTop: 48 }}
        className={cn(
          'min-h-screen overflow-x-auto',
          !isProgressView && 'lg:pr-[296px]',
        )}
      >
        {isProgressView ? (
          <ProgressView
            pathStatuses={pathStatuses}
            completedIds={completedIds}
            onNavigateToPath={handleNavigateToPath}
            onResumeBlock={handleResumeBlock}
          />
        ) : (
          <CenterPanel
            path={viewingPath}
            pathStatus={viewingStatus}
            completedIds={completedIds}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onClearBlock={() => setSelectedBlockId(null)}
            onCompleteAndAdvance={completeAndAdvance}
          />
        )}
      </main>
      {!isProgressView && nextBlock && viewingStatus !== 'complete' && (
        <button
          type="button"
          onClick={() => setSelectedBlockId(nextBlock.id)}
          className={cn(
            'fixed z-50 inline-flex items-center justify-center gap-2',
            'bottom-6 right-6 h-14 px-8 w-auto',
            'lg:bottom-4 lg:right-4 lg:h-16 lg:w-[272px] lg:px-6',
            'rounded-xl text-[15px] lg:text-[16px] font-semibold text-white tracking-[-0.005em]',
            'bg-blue-500 hover:bg-blue-400 border border-blue-400/60',
            'shadow-[0_10px_30px_-10px_rgba(59,130,246,0.7),0_0_0_1px_rgba(96,165,250,0.35)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
            'transition-colors',
          )}
          style={SG}
        >
          Continue
          <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
