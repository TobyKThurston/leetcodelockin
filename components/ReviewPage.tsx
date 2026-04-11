'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { X, Eye, Check, RotateCcw, Brain, Code2, Timer, Zap, CheckCircle2, BookOpen, Lock, ArrowRight, Sparkles, GraduationCap } from 'lucide-react';
import AppNav from '@/components/AppNav';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ReviewCard, KeyLinesContent, ApproachContent, ComplexityContent } from '@/lib/review';

const SG: React.CSSProperties = { fontFamily: 'var(--font-space-grotesk), sans-serif' };
const MONO = 'var(--font-geist-mono), ui-monospace, monospace';

// ─── Palette — identical to Library / Dashboard ──────────────────────────────
const C = {
  appBg:      '#0b1220',
  panelBg:    '#070c17',
  cardBg:     '#0f1729',
  cardBgDark: '#070c17',
  border:     'rgba(255,255,255,0.06)',
  text:       '#e5e7eb',
  textSub:    '#cbd5e1',
  textMuted:  '#94a3b8',
  textDim:    '#64748b',
  blue:       '#3b82f6',
  emerald:    '#10b981',
  amber:      '#f59e0b',
  red:        '#ef4444',
};

const CARD_TYPE_META = {
  key_lines:  { icon: Code2,  label: 'Key Lines',  color: C.blue },
  approach:   { icon: Brain,  label: 'Approach',    color: C.emerald },
  complexity: { icon: Timer,  label: 'Complexity',  color: C.amber },
} as const;

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: '#10b981',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

// ─── Quick Review fundamentals (always available) ───────────────────────────

type QuickCardType = 'big_o' | 'pattern' | 'code_reading';

const QUICK_TYPE_META = {
  big_o:        { icon: Timer,        label: 'Big-O',        color: C.amber },
  pattern:      { icon: Brain,        label: 'Pattern',      color: C.emerald },
  code_reading: { icon: Code2,        label: 'Code Reading', color: C.blue },
} as const;

type InteractionMode = 'mcq' | 'type_answer' | 'reveal';

interface QuickCard {
  id: string;
  type: QuickCardType;
  title: string;
  question: string;
  answer: string;
  code?: string;
  interaction: InteractionMode;
  choices?: string[];
  correctChoice?: number;
  typePrompt?: string;
  acceptableAnswers?: string[];
}

const QUICK_CARDS: QuickCard[] = [
  {
    id: 'qr-bigo-1',
    type: 'big_o',
    title: 'Array: Access by Index',
    question: 'What is the time complexity of accessing an element by index in an array?',
    answer: 'O(1) -- Arrays store elements in contiguous memory. Index access computes the memory address directly: base + (index * element_size). No iteration needed.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 0,
  },
  {
    id: 'qr-bigo-2',
    type: 'big_o',
    title: 'Array: Search (Unsorted)',
    question: 'What is the time complexity of searching for a value in an unsorted array?',
    answer: 'O(n) -- Without any ordering, you must check every element in the worst case. There is no shortcut to skip elements.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctChoice: 2,
  },
  {
    id: 'qr-bigo-3',
    type: 'big_o',
    title: 'Array: Insert at Beginning',
    question: 'What is the time complexity of inserting at the beginning of a dynamic array?',
    answer: 'O(n) -- Every existing element must shift one position to the right to make room at index 0.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctChoice: 2,
  },
  {
    id: 'qr-bigo-4',
    type: 'big_o',
    title: 'Hash Map: Average Lookup',
    question: 'What is the average time complexity of looking up a key in a hash map?',
    answer: 'O(1) average -- The hash function maps keys to bucket indices directly. Worst case is O(n) when all keys collide into the same bucket.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 0,
  },
  {
    id: 'qr-bigo-5',
    type: 'big_o',
    title: 'Merge Sort',
    question: 'What is the time complexity of Merge Sort?',
    answer: 'O(n log n) -- The array is split in half log(n) times, and each level does O(n) work to merge. Space complexity is O(n) for the auxiliary arrays.',
    interaction: 'mcq',
    choices: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
    correctChoice: 1,
  },
  {
    id: 'qr-bigo-6',
    type: 'big_o',
    title: 'Binary Search',
    question: 'What is the time complexity of binary search on a sorted array?',
    answer: 'O(log n) -- Each comparison eliminates half the remaining elements. After log(n) comparisons, only one element remains.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 1,
  },
  {
    id: 'qr-bigo-7',
    type: 'big_o',
    title: 'BFS / DFS on a Graph',
    question: 'What is the time complexity of BFS or DFS on a graph with V vertices and E edges (adjacency list)?',
    answer: 'O(V + E) -- Every vertex is visited once, and every edge is examined once. An adjacency matrix would be O(V^2) since you check every possible edge.',
    interaction: 'mcq',
    choices: ['O(V)', 'O(E)', 'O(V + E)', 'O(V * E)'],
    correctChoice: 2,
  },
  {
    id: 'qr-pattern-1',
    type: 'pattern',
    title: 'Sorted Array Pair Sum',
    question: 'You have a SORTED array and need to find two numbers that sum to a target in O(n) time. Which approach takes advantage of the sort order?',
    answer: 'Two Pointers -- Place one pointer at the start and one at the end. If the sum is too small, move the left pointer right. If too big, move the right pointer left. O(n) time, O(1) space.\n\nA hash map also works for pair sum in O(n) time, but it uses O(n) space and doesn\'t leverage the sorted property.',
    interaction: 'mcq',
    choices: ['Sliding Window', 'Two Pointers', 'Binary Search on each element', 'Brute Force nested loops'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-2',
    type: 'pattern',
    title: 'Contiguous Subarray',
    question: 'You need to find the longest contiguous substring with at most k distinct characters. What pattern is this?',
    answer: 'Sliding Window -- Maintain a window [left, right] with a frequency map. Expand right to add characters; when distinct count exceeds k, shrink from the left. Each element is added/removed at most once, so it runs in O(n).',
    interaction: 'mcq',
    choices: ['Two Pointers', 'Dynamic Programming', 'Sliding Window', 'Backtracking'],
    correctChoice: 2,
  },
  {
    id: 'qr-pattern-3',
    type: 'pattern',
    title: 'Shortest Path (Unweighted)',
    question: 'You need to find the minimum number of moves to reach a target in a grid where each move costs the same. Which traversal guarantees the shortest path?',
    answer: 'BFS -- BFS explores all nodes at the current depth before moving deeper, so the first time it reaches any node is via the shortest path. DFS may find a path, but not necessarily the shortest one.',
    interaction: 'mcq',
    choices: ['DFS with backtracking', 'BFS', 'Dijkstra\'s Algorithm', 'Topological Sort'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-4',
    type: 'pattern',
    title: 'Fibonacci-style Problem',
    question: 'You\'re computing the number of ways to climb n stairs, taking 1 or 2 steps at a time. The answer for n depends on answers for n-1 and n-2, and these sub-problems repeat. What technique should you use?',
    answer: 'Dynamic Programming -- This has both required properties:\n1. Optimal substructure: ways(n) = ways(n-1) + ways(n-2)\n2. Overlapping subproblems: ways(3) is needed by both ways(4) and ways(5)\n\nWithout memoization, the naive recursion is O(2^n). With DP it\'s O(n).',
    interaction: 'mcq',
    choices: [
      'Greedy algorithm',
      'Dynamic Programming',
      'Divide and conquer',
      'Backtracking with pruning',
    ],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-5',
    type: 'pattern',
    title: 'Next Greater Element',
    question: 'For each element in an array, you need to find the next element to its right that is strictly greater. What data structure gives you O(n) total time?',
    answer: 'Monotonic Stack -- Iterate left to right, maintaining a stack of elements (or indices) in decreasing order. When you see a larger element, pop everything smaller and record the answer for each popped item. Each element is pushed and popped at most once, so total work is O(n).',
    interaction: 'mcq',
    choices: ['Queue', 'Stack', 'Heap / Priority Queue', 'Balanced BST'],
    correctChoice: 1,
  },
  {
    id: 'qr-code-1',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this function return for nums = [2, 7, 11, 15] and target = 9?',
    code: 'def solve(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        comp = target - n\n        if comp in seen:\n            return [seen[comp], i]\n        seen[n] = i\n    return []',
    answer: '[0, 1] -- This is the Two Sum pattern using a hash map.\n\ni=0: n=2, comp=7, not in seen, store {2:0}\ni=1: n=7, comp=2, 2 IS in seen, return [0, 1]\n\nIndices 0 and 1 point to values 2 and 7, which sum to 9.',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (e.g. [0, 1])',
    acceptableAnswers: ['[0, 1]', '[0,1]', '0, 1', '0,1'],
  },
  {
    id: 'qr-code-2',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for s = "abcabcbb"?',
    code: 'def solve(s):\n    seen = set()\n    l = ans = 0\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(s[r])\n        ans = max(ans, r - l + 1)\n    return ans',
    answer: '3 -- This is the Sliding Window pattern for longest substring without repeating characters.\n\nThe longest non-repeating substring is "abc" (length 3). When a duplicate is found, the left pointer shrinks the window until the duplicate is removed.',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (a number)',
    acceptableAnswers: ['3'],
  },
  {
    id: 'qr-code-3',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for nums = [3, 2, 1, 5, 6, 4] and k = 2?',
    code: 'import heapq\n\ndef solve(nums, k):\n    heap = []\n    for n in nums:\n        heapq.heappush(heap, n)\n        if len(heap) > k:\n            heapq.heappop(heap)\n    return heap[0]',
    answer: '5 -- This finds the kth largest element using a min-heap of size k.\n\nThe heap keeps the k largest values seen so far. The smallest of those (the root) is the kth largest overall.\n\nAfter processing all elements, heap = [5, 6]. heap[0] = 5 (2nd largest).\n\nTime: O(n log k), Space: O(k)',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (a number)',
    acceptableAnswers: ['5'],
  },
  {
    id: 'qr-code-4',
    type: 'code_reading',
    title: 'Name That Pattern',
    question: 'What algorithmic pattern does this code implement?',
    code: 'def solve(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
    answer: 'Binary Search -- The code repeatedly halves the search space by comparing the middle element to the target. If the middle is too small, search the right half; if too large, search the left half.\n\nTime: O(log n), Space: O(1)',
    interaction: 'mcq',
    choices: ['Two Pointers', 'Binary Search', 'Sliding Window', 'Divide and Conquer'],
    correctChoice: 1,
  },
  // ─── Big-O: Data Structure Operations ─────────────────────────────────────
  {
    id: 'qr-bigo-10',
    type: 'big_o',
    title: 'Linked List Head Insertion',
    question: 'What is the time complexity of inserting a node at the head of a singly linked list?',
    answer: 'O(1). Inserting at the head only requires creating a new node and updating the head pointer -- no traversal is needed regardless of list size.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 0,
  },
  {
    id: 'qr-bigo-11',
    type: 'big_o',
    title: 'Linked List Value Lookup',
    question: 'What is the time complexity of searching for a specific value in an unsorted singly linked list of n elements?',
    answer: 'O(n). There is no random access in a linked list, so you must traverse nodes one by one from the head. In the worst case the value is at the end or not present.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctChoice: 2,
  },
  {
    id: 'qr-bigo-12',
    type: 'big_o',
    title: 'Linked List Node Removal',
    question: 'Given a direct reference to a node in a doubly linked list, what is the time complexity of deleting that node?',
    answer: 'O(1). With a direct reference to the node and back-pointers available, you simply update the previous and next neighbors to point to each other. No search or traversal is required.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctChoice: 0,
  },
  {
    id: 'qr-bigo-13',
    type: 'big_o',
    title: 'Stack Push and Pop',
    question: 'What is the time complexity of push and pop operations on a stack (implemented with an array or linked list)?',
    answer: 'O(1). Both push and pop operate only on the top of the stack. No elements need to be shifted or traversed.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 0,
  },
  {
    id: 'qr-bigo-14',
    type: 'big_o',
    title: 'Queue Operations via Linked List',
    question: 'What is the time complexity of enqueue and dequeue on a queue implemented with a linked list (with head and tail pointers)?',
    answer: 'O(1). Enqueue appends at the tail pointer and dequeue removes from the head pointer. Both are constant-time pointer updates with no traversal needed.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
    correctChoice: 0,
  },
  {
    id: 'qr-bigo-15',
    type: 'big_o',
    title: 'Heap Insertion',
    question: 'What is the time complexity of inserting an element into a binary heap with n elements?',
    answer: 'O(log n). The new element is placed at the bottom of the heap and then "bubbled up" by swapping with its parent. The heap has log n levels, so at most log n swaps are needed.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 1,
  },
  {
    id: 'qr-bigo-16',
    type: 'big_o',
    title: 'Heap Extract Operation',
    question: 'What is the time complexity of extracting the minimum (or maximum) element from a binary heap of n elements?',
    answer: 'O(log n). The root is removed and replaced by the last element, which is then "sifted down" through at most log n levels to restore the heap property.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 1,
  },
  {
    id: 'qr-bigo-17',
    type: 'big_o',
    title: 'Building a Heap from an Array',
    question: 'What is the time complexity of building a binary heap from an unsorted array of n elements using the heapify algorithm?',
    answer: 'O(n). Although each sift-down is O(log n), most nodes are near the bottom and sift down very few levels. A mathematical analysis shows the total work sums to O(n), not O(n log n).',
    interaction: 'mcq',
    choices: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'],
    correctChoice: 1,
  },
  {
    id: 'qr-bigo-18',
    type: 'big_o',
    title: 'Trie Word Insertion',
    question: 'What is the time complexity of inserting a word of length L into a trie?',
    answer: 'O(L). You traverse or create one node per character in the word. The operation depends only on the length of the word, not on how many words are already in the trie.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(L)', 'O(n)', 'O(n * L)'],
    correctChoice: 1,
  },
  {
    id: 'qr-bigo-19',
    type: 'big_o',
    title: 'Balanced BST Search',
    question: 'What is the time complexity of searching for a value in a balanced binary search tree (e.g. AVL tree) with n nodes?',
    answer: 'O(log n). Balancing guarantees the tree height is O(log n). Each comparison eliminates half the remaining nodes.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 1,
  },
  {
    id: 'qr-bigo-20',
    type: 'big_o',
    title: 'Balanced BST Insertion',
    question: 'What is the time complexity of inserting a value into a balanced BST (e.g. AVL tree) with n nodes?',
    answer: 'O(log n). The insertion itself takes O(log n) to find the correct position. Rebalancing (rotations) after insertion takes O(1) for AVL trees, so the overall cost is O(log n).',
    interaction: 'mcq',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctChoice: 1,
  },
  {
    id: 'qr-bigo-21',
    type: 'big_o',
    title: 'Python List Append Cost',
    question: 'What is the amortized time complexity of Python\'s list.append() operation?',
    answer: 'O(1) amortized. Python lists use a dynamic array that over-allocates space. Most appends simply place the element in pre-allocated memory. Occasionally the array must be resized (an O(n) copy), but this cost is spread across many appends.',
    interaction: 'mcq',
    choices: ['O(1) amortized', 'O(log n)', 'O(n)', 'O(n) amortized'],
    correctChoice: 0,
  },
  // ─── Pattern Recognition ──────────────────────────────────────────────────
  {
    id: 'qr-pattern-10',
    type: 'pattern',
    title: 'Linked List Cycle Detection',
    question: 'You have a singly linked list and need to determine if it contains a cycle. You want O(1) space complexity. Which technique should you use?',
    answer: 'Fast & Slow Pointers. By advancing one pointer by 1 step and another by 2 steps, if a cycle exists they will eventually meet. This avoids using a hash set (O(n) space) and solves it in O(n) time with O(1) space.',
    interaction: 'mcq',
    choices: ['Fast & Slow Pointers', 'Hash Map', 'Binary Search', 'Stack-based traversal'],
    correctChoice: 0,
  },
  {
    id: 'qr-pattern-11',
    type: 'pattern',
    title: 'Undirected Graph Grouping',
    question: 'Given n nodes and a list of undirected edges, you need to find how many connected components exist in the graph. Which technique is most appropriate?',
    answer: 'Union Find (Disjoint Set Union). It efficiently merges components as you process edges and can answer connectivity queries in near O(1). DFS can also traverse each component, but Union Find is the classic choice for grouping problems.',
    interaction: 'mcq',
    choices: ['Union Find', 'Topological Sort', 'Dijkstra\'s Algorithm', 'Binary Search'],
    correctChoice: 0,
  },
  {
    id: 'qr-pattern-12',
    type: 'pattern',
    title: 'Course Scheduling with Prerequisites',
    question: 'You have a list of courses and prerequisite pairs. You need to find a valid order to take all courses, or determine if it is impossible. Which technique should you use?',
    answer: 'Topological Sort. Prerequisites form a directed acyclic graph (DAG). Topological sort produces a linear ordering where for every edge u->v, u comes before v. If a cycle is detected, no valid ordering exists.',
    interaction: 'mcq',
    choices: ['BFS (level order)', 'Topological Sort', 'Union Find', 'Dynamic Programming'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-13',
    type: 'pattern',
    title: 'Subarray Sum Equals Target',
    question: 'Given an integer array (which may contain negative numbers) and a target K, you need to count contiguous subarrays whose elements sum to exactly K. Which technique should you use?',
    answer: 'Prefix Sum + Hash Map. Compute a running prefix sum and store the frequency of each sum in a hash map. At each index, check if (currentSum - K) exists. Sliding window does NOT work here because negative numbers prevent monotonic growth.',
    interaction: 'mcq',
    choices: ['Sliding Window', 'Prefix Sum + Hash Map', 'Two Pointers', 'Sorting + Binary Search'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-14',
    type: 'pattern',
    title: 'Generating Valid Parentheses',
    question: 'You need to generate all combinations of n pairs of well-formed parentheses. Which technique is best suited?',
    answer: 'Backtracking. Build the string character by character, choosing to add "(" or ")" at each step. Prune invalid states by tracking open and close counts, backtracking when a choice would lead to an invalid combination.',
    interaction: 'mcq',
    choices: ['Dynamic Programming', 'BFS (level order generation)', 'Backtracking', 'Greedy'],
    correctChoice: 2,
  },
  {
    id: 'qr-pattern-15',
    type: 'pattern',
    title: 'Minimum Coins for Change',
    question: 'Given coin denominations [1, 3, 4] and a target amount of 6, you need the minimum number of coins. Greedy gives 4+1+1 = 3 coins. Can you do better?',
    answer: 'Dynamic Programming. The optimal is 3+3 = 2 coins. Greedy (always pick the largest coin) fails for many denomination sets. DP builds up solutions for every sub-amount, guaranteeing the true minimum.',
    interaction: 'mcq',
    choices: ['Greedy (largest coin first)', 'Dynamic Programming', 'Backtracking', 'BFS on a graph'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-16',
    type: 'pattern',
    title: 'Maximum Non-Overlapping Intervals',
    question: 'Given activities with start and end times, you want to select the maximum number of non-overlapping activities. Which technique should you use?',
    answer: 'Greedy. Sort intervals by end time and greedily pick each activity that starts after the last selected one ends. This classic activity selection problem has an optimal greedy solution because locally optimal choices (earliest finish) lead to a globally optimal result.',
    interaction: 'mcq',
    choices: ['Dynamic Programming', 'Greedy', 'Divide and Conquer', 'Backtracking'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-17',
    type: 'pattern',
    title: 'Streaming Median Finder',
    question: 'You are receiving integers one at a time from a data stream and need to efficiently return the median after each insertion. Which data structure should you use?',
    answer: 'Two Heaps (a max-heap for the lower half and a min-heap for the upper half). By keeping both heaps balanced in size, the median is always available from the tops of the heaps in O(1), with O(log n) insertion.',
    interaction: 'mcq',
    choices: ['Sorted Array with Binary Insertion', 'Two Heaps (max-heap + min-heap)', 'Balanced BST', 'Quickselect on each query'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-18',
    type: 'pattern',
    title: 'Merging K Sorted Lists',
    question: 'You have K sorted linked lists and need to merge them into one sorted list. Which approach is most efficient?',
    answer: 'Heap / Priority Queue (min-heap). Insert the head of each list into a min-heap. Repeatedly extract the minimum, append it to the result, and insert that node\'s next element. This runs in O(N log K) where N is the total number of elements.',
    interaction: 'mcq',
    choices: ['Merge all then sort', 'Heap / Priority Queue', 'Merge Sort (pairwise)', 'Linked List splicing with two pointers'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-19',
    type: 'pattern',
    title: 'Almost-Palindrome Validation',
    question: 'Given a string, determine if it can become a palindrome by removing at most one character. Which technique should you use?',
    answer: 'Two Pointers. Start pointers at both ends and move inward. When a mismatch is found, try skipping either the left or right character and check if the remaining substring is a palindrome. O(n) time, O(1) space.',
    interaction: 'mcq',
    choices: ['Dynamic Programming (LPS)', 'Two Pointers', 'Recursion with memoization', 'Hash Map character counting'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-20',
    type: 'pattern',
    title: 'Word Search in a Grid',
    question: 'Given a 2D grid of characters and a target word, determine if the word exists by following adjacent cells (no cell reused). Which technique should you use?',
    answer: 'DFS + Backtracking. Start DFS from each cell matching the first character. At each step, mark the cell as visited and explore all four directions. If a path fails, backtrack by unmarking the cell.',
    interaction: 'mcq',
    choices: ['BFS with queue', 'DFS + Backtracking', 'Trie-based search', 'Dynamic Programming'],
    correctChoice: 1,
  },
  {
    id: 'qr-pattern-21',
    type: 'pattern',
    title: 'Trapping Rain Water',
    question: 'Given an array of non-negative integers representing an elevation map, compute how much water can be trapped after raining. Which technique should you use?',
    answer: 'Two Pointers. Track the max height seen from each side, computing trapped water in O(n) time and O(1) space. A monotonic stack approach also works in O(n) time but uses O(n) space.',
    interaction: 'mcq',
    choices: ['Sliding Window', 'Two Pointers', 'Prefix/Suffix Arrays only', 'Greedy with sorting'],
    correctChoice: 1,
  },
  // ─── Code Tracing ─────────────────────────────────────────────────────────
  {
    id: 'qr-code-5',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for head = 1->2->3->4?',
    code: 'def solve(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev',
    answer: '4->3->2->1 -- This reverses a linked list iteratively.\n\nprev=None, curr=1: point 1.next to None, prev=1, curr=2\nprev=1, curr=2: point 2.next to 1, prev=2, curr=3\nprev=2, curr=3: point 3.next to 2, prev=3, curr=4\nprev=3, curr=4: point 4.next to 3, prev=4, curr=None\n\nReturn prev = node 4, chain 4->3->2->1.',
    interaction: 'type_answer',
    typePrompt: 'Type the resulting list (e.g. 4->3->2->1)',
    acceptableAnswers: ['4->3->2->1', '[4, 3, 2, 1]', '[4,3,2,1]', '4,3,2,1'],
  },
  {
    id: 'qr-code-6',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for grid = [["1","1","0"],["1","0","0"],["0","0","1"]]?',
    code: 'def solve(grid):\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols:\n            return\n        if grid[r][c] != "1":\n            return\n        grid[r][c] = "0"\n        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:\n            dfs(r + dr, c + dc)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == "1":\n                count += 1\n                dfs(r, c)\n    return count',
    answer: '2 -- This counts islands using DFS flood fill.\n\nIsland 1: cells (0,0), (0,1), (1,0) -- connected\nIsland 2: cell (2,2) -- isolated\n\nEach time we find an unvisited "1", we increment count and DFS-mark the whole island as visited.',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (a number)',
    acceptableAnswers: ['2'],
  },
  {
    id: 'qr-code-7',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for height = [1, 8, 6, 2, 5, 4, 8, 3, 7]?',
    code: 'def solve(height):\n    l, r = 0, len(height) - 1\n    best = 0\n    while l < r:\n        w = r - l\n        h = min(height[l], height[r])\n        best = max(best, w * h)\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return best',
    answer: '49 -- This is the Container With Most Water two-pointer approach.\n\nThe optimal container uses indices 1 and 8 (values 8 and 7).\nWidth = 8 - 1 = 7, height = min(8, 7) = 7, area = 7 * 7 = 49.',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (a number)',
    acceptableAnswers: ['49'],
  },
  {
    id: 'qr-code-8',
    type: 'code_reading',
    title: 'Name That Pattern',
    question: 'What algorithmic pattern does this code implement?',
    code: 'from collections import deque\n\ndef solve(n, edges):\n    adj = [[] for _ in range(n)]\n    indeg = [0] * n\n    for u, v in edges:\n        adj[u].append(v)\n        indeg[v] += 1\n    q = deque(i for i in range(n) if indeg[i] == 0)\n    order = []\n    while q:\n        node = q.popleft()\n        order.append(node)\n        for nei in adj[node]:\n            indeg[nei] -= 1\n            if indeg[nei] == 0:\n                q.append(nei)\n    return order if len(order) == n else []',
    answer: 'Topological Sort (Kahn\'s Algorithm) -- Builds an in-degree table, seeds a queue with zero-in-degree nodes, and peels them off layer by layer. Each removed node decrements its neighbors\' in-degrees. If the final order has all n nodes, the graph is a valid DAG.\n\nTime: O(V + E)',
    interaction: 'mcq',
    choices: ['BFS (Level Order)', 'Topological Sort (Kahn\'s Algorithm)', 'Shortest Path (BFS)', 'Strongly Connected Components'],
    correctChoice: 1,
  },
  {
    id: 'qr-code-9',
    type: 'code_reading',
    title: 'Name That Pattern',
    question: 'What algorithmic pattern does this code implement?',
    code: 'def solve(n, edges):\n    parent = list(range(n))\n    rank = [0] * n\n    def find(x):\n        while parent[x] != x:\n            parent[x] = parent[parent[x]]\n            x = parent[x]\n        return x\n    def union(a, b):\n        ra, rb = find(a), find(b)\n        if ra == rb:\n            return False\n        if rank[ra] < rank[rb]:\n            ra, rb = rb, ra\n        parent[rb] = ra\n        if rank[ra] == rank[rb]:\n            rank[ra] += 1\n        return True\n    return all(union(u, v) for u, v in edges)',
    answer: 'Union-Find / Disjoint Set Union -- Maintains a parent array with path compression and union by rank. find() locates the root representative, union() merges two sets. Returns False if an edge connects two already-connected nodes (cycle detection).',
    interaction: 'mcq',
    choices: ['Graph Coloring', 'Union-Find / Disjoint Set', 'Adjacency List BFS', 'Minimum Spanning Tree (Prim\'s)'],
    correctChoice: 1,
  },
  {
    id: 'qr-code-10',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for n = 7?',
    code: 'def solve(n):\n    memo = {}\n    def fib(k):\n        if k in memo:\n            return memo[k]\n        if k <= 1:\n            return k\n        memo[k] = fib(k - 1) + fib(k - 2)\n        return memo[k]\n    return fib(n)',
    answer: '13 -- This computes Fibonacci with memoization (top-down DP).\n\nfib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3, fib(5)=5, fib(6)=8, fib(7)=13\n\nThe memo dict caches results so each fib(k) is computed only once. Time: O(n).',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (a number)',
    acceptableAnswers: ['13'],
  },
  {
    id: 'qr-code-11',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for s = "({[]})"?',
    code: 'def solve(s):\n    stack = []\n    pairs = {")": "(", "]": "[", "}": "{"}\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack[-1] != pairs[ch]:\n                return False\n            stack.pop()\n        else:\n            stack.append(ch)\n    return len(stack) == 0',
    answer: 'True -- This is the Valid Parentheses checker using a stack.\n\n"(" push, "{" push, "[" push, "]" matches "[" pop, "}" matches "{" pop, ")" matches "(" pop.\nStack is empty -> return True.',
    interaction: 'type_answer',
    typePrompt: 'Type True or False',
    acceptableAnswers: ['True', 'true', 'TRUE'],
  },
  {
    id: 'qr-code-12',
    type: 'code_reading',
    title: 'Name That Pattern',
    question: 'What algorithmic pattern does this code implement?',
    code: 'def solve(nums, queries):\n    prefix = [0] * (len(nums) + 1)\n    for i in range(len(nums)):\n        prefix[i + 1] = prefix[i] + nums[i]\n    result = []\n    for l, r in queries:\n        result.append(prefix[r + 1] - prefix[l])\n    return result',
    answer: 'Prefix Sum / Cumulative Sum -- Builds a prefix sum array where prefix[i] = sum of nums[0..i-1]. Any subarray sum nums[l..r] can be answered in O(1) as prefix[r+1] - prefix[l].\n\nBuild: O(n), Each query: O(1)',
    interaction: 'mcq',
    choices: ['Sliding Window', 'Prefix Sum / Cumulative Sum', 'Segment Tree', 'Difference Array'],
    correctChoice: 1,
  },
  {
    id: 'qr-code-13',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for nums1 = [1, 2, 3, 0, 0, 0], m = 3, nums2 = [2, 5, 6], n = 3?',
    code: 'def solve(nums1, m, nums2, n):\n    p1, p2, p = m - 1, n - 1, m + n - 1\n    while p2 >= 0:\n        if p1 >= 0 and nums1[p1] > nums2[p2]:\n            nums1[p] = nums1[p1]\n            p1 -= 1\n        else:\n            nums1[p] = nums2[p2]\n            p2 -= 1\n        p -= 1\n    return nums1',
    answer: '[1, 2, 2, 3, 5, 6] -- Merges two sorted arrays in-place by filling from the back.\n\nWorking right to left avoids overwriting unprocessed elements.',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (e.g. [1, 2, 3])',
    acceptableAnswers: ['[1, 2, 2, 3, 5, 6]', '[1,2,2,3,5,6]', '1, 2, 2, 3, 5, 6', '1,2,2,3,5,6'],
  },
  {
    id: 'qr-code-14',
    type: 'code_reading',
    title: 'Name That Pattern',
    question: 'What algorithmic pattern does this code implement?',
    code: 'import heapq\n\ndef solve(graph, src):\n    dist = {src: 0}\n    heap = [(0, src)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d > dist.get(u, float("inf")):\n            continue\n        for v, w in graph[u]:\n            nd = d + w\n            if nd < dist.get(v, float("inf")):\n                dist[v] = nd\n                heapq.heappush(heap, (nd, v))\n    return dist',
    answer: 'Dijkstra\'s Algorithm -- Finds shortest paths from a single source in a weighted graph using a min-heap. Greedily processes the closest unfinalized node and relaxes its edges.\n\nTime: O((V + E) log V)',
    interaction: 'mcq',
    choices: ['Bellman-Ford Algorithm', 'Prim\'s MST Algorithm', 'Dijkstra\'s Algorithm', 'A* Search'],
    correctChoice: 2,
  },
  {
    id: 'qr-code-15',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for s = "the sky is blue"?',
    code: 'def solve(s):\n    words = s.split()\n    left, right = 0, len(words) - 1\n    while left < right:\n        words[left], words[right] = words[right], words[left]\n        left += 1\n        right -= 1\n    return " ".join(words)',
    answer: '"blue is sky the" -- Reverses the order of words in a string.\n\nAfter split: ["the", "sky", "is", "blue"]\nSwap 0 and 3: ["blue", "sky", "is", "the"]\nSwap 1 and 2: ["blue", "is", "sky", "the"]\nJoin: "blue is sky the"',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (a string)',
    acceptableAnswers: ['blue is sky the', '"blue is sky the"'],
  },
  {
    id: 'qr-code-16',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this return for nums = [2, 2, 1, 1, 1, 2, 2]?',
    code: 'def solve(nums):\n    candidate = None\n    count = 0\n    for n in nums:\n        if count == 0:\n            candidate = n\n        count += 1 if n == candidate else -1\n    return candidate',
    answer: '2 -- This is Boyer-Moore Majority Vote.\n\nThe candidate changes as count hits zero, but the majority element (2, appearing 4/7 times) always survives. Final candidate = 2.',
    interaction: 'type_answer',
    typePrompt: 'Type the return value (a number)',
    acceptableAnswers: ['2'],
  },
  // ─── Concept / Tradeoff Questions ─────────────────────────────────────────
  {
    id: 'qr-concept-1',
    type: 'pattern',
    title: 'Map Implementation Choice',
    question: 'You need a key-value store with the fastest possible lookups and you do NOT need keys in sorted order. Which should you use?',
    answer: 'HashMap. It provides O(1) average-case lookup via hashing, while TreeMap provides O(log n) because it maintains sorted order using a balanced BST. If you don\'t need ordering, HashMap is the better choice.',
    interaction: 'mcq',
    choices: ['TreeMap -- balanced tree gives consistent performance', 'HashMap -- O(1) average lookup when order is not needed', 'LinkedHashMap -- insertion order is always required', 'SortedSet -- sets are faster than maps'],
    correctChoice: 1,
  },
  {
    id: 'qr-concept-2',
    type: 'pattern',
    title: 'Data Structure for Middle Insertions',
    question: 'You need to frequently insert and delete elements in the MIDDLE of a collection. Which data structure is more efficient for the insert/delete itself?',
    answer: 'Linked List. Inserting or deleting in the middle of an array requires shifting all subsequent elements -- O(n). A linked list only requires updating a few pointers -- O(1) once you have a reference to the node. The tradeoff: linked lists have O(n) access by index.',
    interaction: 'mcq',
    choices: ['Array -- contiguous memory makes all operations fast', 'Linked List -- pointer updates avoid shifting elements', 'Stack -- LIFO structure optimizes middle operations', 'Hash Map -- hashing allows O(1) insertion anywhere'],
    correctChoice: 1,
  },
  {
    id: 'qr-concept-3',
    type: 'pattern',
    title: 'Graph Representation for Sparse Graphs',
    question: 'For a graph with 10,000 vertices but only 15,000 edges, which representation is more space-efficient?',
    answer: 'Adjacency list. It uses O(V + E) space (~25,000). An adjacency matrix uses O(V^2) (100,000,000). Adjacency matrices are only space-efficient when the graph is dense (E approaches V^2).',
    interaction: 'mcq',
    choices: ['Adjacency matrix -- O(V^2) is fine for any graph', 'Edge list -- storing pairs is always most compact', 'Adjacency list -- O(V + E) is far smaller for sparse graphs', 'Incidence matrix -- it compresses better'],
    correctChoice: 2,
  },
  {
    id: 'qr-concept-4',
    type: 'pattern',
    title: 'Quick Sort Worst Case',
    question: 'Under what condition does Quick Sort degrade from O(n log n) to O(n^2)?',
    answer: 'When the pivot selection consistently produces maximally unbalanced partitions -- e.g., always picking the first element on an already-sorted array. Each partition only removes one element, leading to n levels of recursion with O(n) work each. Randomized pivot selection avoids this in practice.',
    interaction: 'mcq',
    choices: ['When the array contains duplicate values', 'When the array is already sorted and the pivot is always the first or last element', 'When the array size exceeds available memory', 'When the array contains negative numbers'],
    correctChoice: 1,
  },
  {
    id: 'qr-concept-5',
    type: 'pattern',
    title: 'Auxiliary Structure for DFS',
    question: 'When implementing DFS iteratively (without recursion), which data structure replaces the call stack?',
    answer: 'A stack (LIFO). DFS explores as deep as possible before backtracking -- this matches LIFO behavior perfectly. The last node pushed is the first explored, mirroring how recursive calls unwind. A queue (FIFO) would give you BFS instead.',
    interaction: 'mcq',
    choices: ['Queue -- FIFO order ensures full depth exploration', 'Stack -- LIFO order matches DFS backtracking behavior', 'Priority Queue -- ordering nodes by depth is required', 'Deque -- bidirectional access is needed'],
    correctChoice: 1,
  },
  {
    id: 'qr-concept-6',
    type: 'pattern',
    title: 'Finding the K Largest Elements',
    question: 'You need the top 5 largest elements from a list of 1,000,000 items. What is the most efficient approach?',
    answer: 'Use a min-heap of size 5. Iterate through all elements: if the current element is larger than the heap\'s minimum, replace it. O(n log k) time. Sorting would cost O(n log n), which is significantly more when k << n.',
    interaction: 'mcq',
    choices: ['Sort the entire array and take the last 5', 'Use a min-heap of size k -- O(n log k)', 'Use a max-heap of all elements and extract 5 times', 'Use binary search to find the 5th largest'],
    correctChoice: 1,
  },
  {
    id: 'qr-concept-7',
    type: 'pattern',
    title: 'Recursion vs Iteration Tradeoff',
    question: 'When is a recursive solution problematic compared to an equivalent iterative one?',
    answer: 'When the recursion depth is very large (e.g., processing a linked list of 100,000 nodes). Each recursive call adds a frame to the call stack, and most languages limit stack size (~10,000 frames). Exceeding this causes a stack overflow. An iterative loop uses constant stack space.',
    interaction: 'mcq',
    choices: ['When the problem has overlapping subproblems', 'When the input size could cause recursion depth to exceed the call stack limit', 'When the function has more than two parameters', 'When the base case returns a non-primitive type'],
    correctChoice: 1,
  },
  {
    id: 'qr-concept-8',
    type: 'pattern',
    title: 'Set Lookup Time Complexity',
    question: 'Why does a HashSet provide O(1) average lookup while a TreeSet provides O(log n)?',
    answer: 'A HashSet computes a hash and jumps directly to the correct bucket -- constant time on average. A TreeSet stores elements in a balanced BST, so lookup requires traversing from root to leaf -- O(log n). The tradeoff: TreeSet keeps elements sorted, HashSet does not.',
    interaction: 'mcq',
    choices: ['HashSet uses more memory, which makes it faster', 'HashSet uses hashing for direct access; TreeSet uses tree traversal requiring O(log n) comparisons', 'TreeSet is O(log n) because it must rebalance on every lookup', 'HashSet is only O(1) for integers; for strings it is also O(log n)'],
    correctChoice: 1,
  },
  {
    id: 'qr-concept-9',
    type: 'pattern',
    title: 'Deque vs Standard Queue',
    question: 'In a sliding window maximum problem, why is a deque preferred over a standard queue?',
    answer: 'A deque allows adding and removing from BOTH ends in O(1). For sliding window maximum, you need to: (1) remove from the front when elements leave the window, and (2) remove from the back elements smaller than the new one to maintain decreasing order. A standard queue only supports removal from the front.',
    interaction: 'mcq',
    choices: ['A deque is faster because it uses a linked list', 'A deque allows O(1) insertion and removal from both ends', 'A standard queue cannot hold more than a fixed number of elements', 'A deque automatically sorts elements in decreasing order'],
    correctChoice: 1,
  },
  // ─── Advanced Topics ──────────────────────────────────────────────────────
  {
    id: 'qr-adv-1',
    type: 'big_o',
    title: 'Shortest Path with a Heap',
    question: 'What is the time complexity of Dijkstra\'s algorithm when implemented with a min-heap (binary heap)?',
    answer: 'O((V + E) log V). Each vertex is extracted from the heap once (V log V), and each edge relaxation may trigger a heap insert (E log V). Combined: O((V + E) log V).',
    interaction: 'mcq',
    choices: ['O(V^2)', 'O((V + E) log V)', 'O(V * E)', 'O(E log E)'],
    correctChoice: 1,
  },
  {
    id: 'qr-adv-2',
    type: 'pattern',
    title: 'Splitting a Word into Dictionary Parts',
    question: 'Given a string and a dictionary of words, determine if the string can be segmented into a sequence of one or more dictionary words. Which technique is most appropriate?',
    answer: 'Dynamic Programming (Word Break). Use a boolean DP array where dp[i] is true if the substring s[0..i] can be segmented using dictionary words. For each position, check all possible word endings.',
    interaction: 'mcq',
    choices: ['Greedy with sorting', 'Dynamic Programming', 'Sliding Window', 'Trie-only traversal'],
    correctChoice: 1,
  },
  {
    id: 'qr-adv-3',
    type: 'big_o',
    title: 'Recursive Tree Traversal Memory',
    question: 'What is the space complexity of a recursive DFS traversal on a tree with height h?',
    answer: 'O(h). The call stack grows proportionally to the depth of recursion, which equals the height of the tree. For a balanced tree h = log n, but for a skewed tree h = n.',
    interaction: 'mcq',
    choices: ['O(1)', 'O(n)', 'O(h)', 'O(n log n)'],
    correctChoice: 2,
  },
  {
    id: 'qr-adv-4',
    type: 'pattern',
    title: 'Comparing Two Sequences',
    question: 'You need to find the longest common subsequence (LCS) of two strings. Which approach is standard?',
    answer: 'DP with a 2D table. Build an (m+1) x (n+1) table where dp[i][j] stores the LCS length of the first i characters of A and first j of B. If characters match, dp[i][j] = dp[i-1][j-1] + 1; otherwise take max of dp[i-1][j] and dp[i][j-1].',
    interaction: 'mcq',
    choices: ['Two-pointer technique', 'DP with a 2D table', 'Sliding window with hash map', 'Divide and conquer'],
    correctChoice: 1,
  },
  {
    id: 'qr-adv-5',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this print?',
    code: 'def count_bits(n):\n    count = 0\n    while n:\n        count += n & 1\n        n >>= 1\n    return count\n\nprint(count_bits(13))',
    answer: '3 -- 13 in binary is 1101, which has three 1-bits. The loop checks the last bit with n & 1, then right-shifts until n becomes 0.',
    interaction: 'type_answer',
    typePrompt: 'Type the printed value',
    acceptableAnswers: ['3'],
  },
  {
    id: 'qr-adv-6',
    type: 'pattern',
    title: 'Two-Sided Graph Classification',
    question: 'You need to detect whether an undirected graph is bipartite (vertices can be divided into two groups with no edges within a group). Which technique is most appropriate?',
    answer: 'BFS/DFS with 2-coloring. Assign one color to a starting node, then alternate colors for neighbors. If you ever find a neighbor already colored with the same color as the current node, the graph is not bipartite.',
    interaction: 'mcq',
    choices: ['Topological sort', 'Union-Find with path compression', 'BFS/DFS with 2-coloring', 'Minimum spanning tree'],
    correctChoice: 2,
  },
  {
    id: 'qr-adv-7',
    type: 'big_o',
    title: 'Substring Search Efficiency',
    question: 'What is the time complexity of checking whether a pattern of length n exists within a text of length m, using KMP vs. the naive approach?',
    answer: 'O(n + m) with KMP. KMP preprocesses the pattern to build a failure function in O(n), then scans the text in O(m). The naive approach checks every starting position, giving O(n * m) worst case.',
    interaction: 'mcq',
    choices: ['O(n + m) with KMP; O(n * m) naive', 'O(n log m) with KMP; O(n * m) naive', 'O(n * m) for both', 'O(n + m) for both'],
    correctChoice: 0,
  },
  {
    id: 'qr-adv-8',
    type: 'code_reading',
    title: 'Trace the Output',
    question: 'What does this print?',
    code: 'def find_unique(nums):\n    result = 0\n    for n in nums:\n        result ^= n\n    return result\n\nprint(find_unique([4, 1, 2, 1, 2]))',
    answer: '4 -- XOR of a number with itself is 0, and XOR with 0 is the number itself. The duplicate pairs cancel out (1^1=0, 2^2=0), leaving only 4.',
    interaction: 'type_answer',
    typePrompt: 'Type the printed value',
    acceptableAnswers: ['4'],
  },
  {
    id: 'qr-adv-9',
    type: 'pattern',
    title: 'Eviction-Based Cache Design',
    question: 'You need to implement an LRU (Least Recently Used) cache with O(1) get and put operations. Which data structure combination is standard?',
    answer: 'Hash Map + Doubly Linked List. The hash map provides O(1) key lookup, while the doubly linked list maintains access order so the least recently used item can be evicted from the tail in O(1). On access, a node is moved to the head in O(1).',
    interaction: 'mcq',
    choices: ['Min-heap + hash set', 'Hash Map + Doubly Linked List', 'Balanced BST + queue', 'Array + hash map'],
    correctChoice: 1,
  },
  {
    id: 'qr-adv-10',
    type: 'big_o',
    title: 'Growing Array Cost Per Insert',
    question: 'What is the amortized time complexity of appending to a dynamic array that doubles in capacity when full?',
    answer: 'O(1) amortized. Most appends are O(1). Occasionally the array must be copied to a new buffer of double size, costing O(n). But after n inserts only log n resizes occur, so the total cost over n appends is O(n), giving O(1) amortized per append.',
    interaction: 'mcq',
    choices: ['O(n)', 'O(log n)', 'O(1) amortized', 'O(n log n) amortized'],
    correctChoice: 2,
  },
];

// ─── Shared rail primitives ────────────────────────────────────────────────

function RailHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
      {children}
    </p>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11.5px]">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-300 font-medium tabular-nums">{value}</span>
    </div>
  );
}

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

const RAIL_BOX =
  'rounded-lg px-3 py-2.5 bg-slate-800/40 border border-slate-700/60';

// ─── Code display with optional blanks ───────────────────────────────────────

function CodeBlock({
  code,
  blankIndices,
  revealed,
  originalLines,
}: {
  code: string;
  blankIndices?: number[];
  revealed: boolean;
  originalLines?: string[];
}) {
  const lines = code.split('\n');
  const blanks = new Set(blankIndices ?? []);

  return (
    <pre
      className="rounded-lg p-4 text-[13px] leading-[1.7] overflow-x-auto"
      style={{ background: 'rgba(0,0,0,0.4)', fontFamily: MONO }}
    >
      {lines.map((line, i) => {
        const isBlanked = blanks.has(i);
        if (isBlanked && !revealed) {
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[11px] font-medium">
                {'_'.repeat(Math.max(line.trim().length, 12))} -- recall this line
              </span>
            </div>
          );
        }
        if (isBlanked && revealed) {
          const blankIdx = blankIndices!.indexOf(i);
          const original = originalLines?.[blankIdx] ?? line;
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
              <span className="bg-emerald-500/15 text-emerald-300 px-1 rounded">
                {original}
              </span>
            </div>
          );
        }
        return (
          <div key={i} className="flex">
            <span className="text-slate-600 select-none w-6 text-right mr-2">{i + 1}</span>
            <span className="text-slate-300">{line || ' '}</span>
          </div>
        );
      })}
    </pre>
  );
}

// ─── Card front/back renderers (SR mode) ────────────────────────────────────

function KeyLinesFront({ card }: { card: ReviewCard }) {
  const content = card.content as KeyLinesContent;
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-slate-400">
        Fill in the blanked-out lines from your solution:
      </p>
      <CodeBlock
        code={card.codeSnapshot}
        blankIndices={content.blank_indices}
        revealed={false}
      />
    </div>
  );
}

function KeyLinesBack({ card }: { card: ReviewCard }) {
  const content = card.content as KeyLinesContent;
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-emerald-400 font-medium">Here are the key lines:</p>
      <CodeBlock
        code={card.codeSnapshot}
        blankIndices={content.blank_indices}
        revealed={true}
        originalLines={content.original_lines}
      />
    </div>
  );
}

function ApproachFront({ card }: { card: ReviewCard }) {
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-slate-400">
        What pattern and approach did you use to solve this problem?
      </p>
      <p className="text-[13px] text-slate-500 italic">
        Think about the algorithmic pattern, key data structures, and your step-by-step approach before revealing.
      </p>
    </div>
  );
}

function ApproachBack({ card }: { card: ReviewCard }) {
  const content = card.content as ApproachContent;
  return (
    <div className="space-y-4">
      <div>
        <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Pattern</span>
        <p className="text-[15px] text-white font-semibold mt-1" style={SG}>{content.pattern}</p>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Approach</span>
        <p className="text-[14px] text-slate-300 leading-relaxed mt-1">{content.explanation}</p>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Your Code</span>
        <CodeBlock code={card.codeSnapshot} revealed={true} />
      </div>
    </div>
  );
}

function ComplexityFront({ card }: { card: ReviewCard }) {
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-slate-400">
        What is the time and space complexity of your solution?
      </p>
      <CodeBlock code={card.codeSnapshot} revealed={true} />
    </div>
  );
}

function ComplexityBack({ card }: { card: ReviewCard }) {
  const content = card.content as ComplexityContent;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Time</span>
          <p className="text-[20px] text-white font-bold mt-1" style={{ fontFamily: MONO }}>{content.time}</p>
        </div>
        <div className="rounded-lg p-3 bg-amber-500/10 border border-amber-500/20">
          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">Space</span>
          <p className="text-[20px] text-white font-bold mt-1" style={{ fontFamily: MONO }}>{content.space}</p>
        </div>
      </div>
      <p className="text-[14px] text-slate-400 leading-relaxed">{content.reasoning}</p>
    </div>
  );
}

// ─── Interactive Quick Card Components ──────────────────────────────────────

function MCQCard({
  card,
  onAnswer,
}: {
  card: QuickCard;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === card.correctChoice;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    onAnswer(idx === card.correctChoice!);
  }

  return (
    <div className="space-y-5">
      <p className="text-[15px] text-slate-200 leading-relaxed">
        {card.question}
      </p>

      {card.code && (
        <pre
          className="rounded-lg p-5 text-[13px] leading-[1.7] overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.4)', fontFamily: MONO }}
        >
          {card.code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-slate-600 select-none w-6 text-right mr-3">{i + 1}</span>
              <span className="text-slate-300">{line || ' '}</span>
            </div>
          ))}
        </pre>
      )}

      <div className="grid grid-cols-1 gap-2.5">
        {card.choices!.map((choice, idx) => {
          const isThis = selected === idx;
          const isCorrectChoice = idx === card.correctChoice;

          let borderColor = 'border-slate-700/60';
          let bg = 'bg-slate-800/40';
          let textColor = 'text-slate-200';
          let labelColor = 'text-slate-500';
          let labelBg = 'bg-slate-700/40';

          if (answered && isCorrectChoice) {
            borderColor = 'border-emerald-500/50';
            bg = 'bg-emerald-500/[0.08]';
            textColor = 'text-emerald-300';
            labelColor = 'text-emerald-400';
            labelBg = 'bg-emerald-500/20';
          } else if (answered && isThis && !isCorrect) {
            borderColor = 'border-red-500/50';
            bg = 'bg-red-500/[0.08]';
            textColor = 'text-red-300';
            labelColor = 'text-red-400';
            labelBg = 'bg-red-500/20';
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={cn(
                'w-full text-left rounded-lg px-4 py-3.5 border transition-all duration-150',
                'flex items-center gap-3',
                borderColor, bg,
                !answered && 'hover:bg-slate-700/50 hover:border-slate-600/80 cursor-pointer',
                answered && 'cursor-default',
              )}
            >
              <span className={cn(
                'shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-bold',
                labelBg, labelColor,
              )}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className={cn('text-[14px] font-medium', textColor)}>
                {choice}
              </span>
              {answered && isCorrectChoice && (
                <Check size={16} className="ml-auto text-emerald-400 shrink-0" />
              )}
              {answered && isThis && !isCorrect && (
                <X size={16} className="ml-auto text-red-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className={cn(
            'rounded-lg p-4 border text-[14px] leading-relaxed',
            isCorrect
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-slate-300'
              : 'bg-red-500/[0.06] border-red-500/20 text-slate-300',
          )}
        >
          <p className={cn(
            'text-[12px] font-bold uppercase tracking-wider mb-2',
            isCorrect ? 'text-emerald-400' : 'text-red-400',
          )}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </p>
          <p className="whitespace-pre-line">{card.answer}</p>
        </div>
      )}
    </div>
  );
}

function TypeAnswerCard({
  card,
  onAnswer,
}: {
  card: QuickCard;
  onAnswer: (correct: boolean) => void;
}) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCorrect = submitted && card.acceptableAnswers?.some(
    a => a.trim().toLowerCase() === input.trim().toLowerCase()
  );

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (submitted || !input.trim()) return;
    setSubmitted(true);
    const correct = card.acceptableAnswers?.some(
      a => a.trim().toLowerCase() === input.trim().toLowerCase()
    ) ?? false;
    onAnswer(correct);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-5">
      <p className="text-[15px] text-slate-200 leading-relaxed">
        {card.question}
      </p>

      {card.code && (
        <pre
          className="rounded-lg p-5 text-[13px] leading-[1.7] overflow-x-auto"
          style={{ background: 'rgba(0,0,0,0.4)', fontFamily: MONO }}
        >
          {card.code.split('\n').map((line, i) => (
            <div key={i} className="flex">
              <span className="text-slate-600 select-none w-6 text-right mr-3">{i + 1}</span>
              <span className="text-slate-300">{line || ' '}</span>
            </div>
          ))}
        </pre>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-[12px] text-slate-500 font-medium">
          {card.typePrompt ?? 'Type your answer'}
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={submitted}
            placeholder="Your answer..."
            className={cn(
              'flex-1 rounded-lg px-4 py-3 text-[15px] font-medium border outline-none transition-colors',
              'bg-slate-800/60 text-white placeholder:text-slate-600',
              !submitted && 'border-slate-700/60 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20',
              submitted && isCorrect && 'border-emerald-500/50 bg-emerald-500/[0.06]',
              submitted && !isCorrect && 'border-red-500/50 bg-red-500/[0.06]',
            )}
            style={{ fontFamily: MONO }}
          />
          {!submitted && (
            <Button
              type="submit"
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-5 shrink-0"
            >
              Check
            </Button>
          )}
        </div>
      </form>

      {submitted && (
        <div
          className={cn(
            'rounded-lg p-4 border text-[14px] leading-relaxed',
            isCorrect
              ? 'bg-emerald-500/[0.06] border-emerald-500/20 text-slate-300'
              : 'bg-red-500/[0.06] border-red-500/20 text-slate-300',
          )}
        >
          <p className={cn(
            'text-[12px] font-bold uppercase tracking-wider mb-2',
            isCorrect ? 'text-emerald-400' : 'text-red-400',
          )}>
            {isCorrect ? 'Correct' : `Not quite -- the answer is ${card.acceptableAnswers?.[0]}`}
          </p>
          <p className="whitespace-pre-line">{card.answer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar card — one row per review card in the queue ─────────────────────

function SidebarCardRow({
  card, isActive, isReviewed, onClick,
}: {
  card: ReviewCard;
  isActive: boolean;
  isReviewed: boolean;
  onClick: () => void;
}) {
  const meta = CARD_TYPE_META[card.cardType];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-lg px-3 py-2.5 border transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        isActive && 'bg-blue-500/[0.08] border-blue-400/50',
        !isActive && isReviewed && 'bg-slate-800/30 border-emerald-500/25 hover:border-emerald-500/40',
        !isActive && !isReviewed && 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600/70',
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div
          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{ background: `${meta.color}15`, color: meta.color }}
        >
          <Icon size={10} />
          {meta.label}
        </div>
        {isReviewed && <CheckCircle2 size={12} strokeWidth={2.25} className="text-emerald-400" />}
      </div>
      <p
        className={cn(
          'text-[12.5px] font-semibold leading-tight mb-0.5 tracking-[-0.005em] truncate',
          isActive && 'text-white',
          !isActive && isReviewed && 'text-slate-300',
          !isActive && !isReviewed && 'text-slate-200',
        )}
        style={SG}
      >
        {card.problemTitle}
      </p>
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-medium"
          style={{ color: DIFFICULTY_COLOR[card.difficulty] ?? C.textMuted }}
        >
          {card.difficulty}
        </span>
        {card.pattern && (
          <span className="text-[10px] text-slate-500">{card.pattern}</span>
        )}
      </div>
    </button>
  );
}

// ─── Left Sidebar (SR mode) ─────────────────────────────────────────────────

function ReviewSidebar({
  cards, currentIdx, reviewedSet, onSelectCard,
}: {
  cards: ReviewCard[];
  currentIdx: number;
  reviewedSet: Set<number>;
  onSelectCard: (idx: number) => void;
}) {
  const totalCards = cards.length;
  const reviewedCount = reviewedSet.size;
  const pct = totalCards === 0 ? 0 : Math.round((reviewedCount / totalCards) * 100);

  return (
    <aside
      className="fixed left-0 bottom-0 hidden md:flex flex-col"
      style={{
        top: 48,
        width: 304,
        background: C.panelBg,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="px-4 pt-5 pb-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-3 px-1">
            Due for Review
          </p>
          {cards.map((card, idx) => (
            <SidebarCardRow
              key={card.id}
              card={card}
              isActive={idx === currentIdx}
              isReviewed={reviewedSet.has(idx)}
              onClick={() => onSelectCard(idx)}
            />
          ))}
        </div>
      </div>

      {/* Stats subpanel */}
      <div
        className="px-4 py-4 space-y-4"
        style={{ borderTop: `1px solid ${C.border}`, background: C.cardBgDark }}
      >
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-slate-500 font-medium">Session</span>
              <span className="text-slate-300 font-semibold tabular-nums">{pct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: C.blue }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-slate-500">Reviewed</span>
            <span className="text-slate-400 font-medium tabular-nums">
              {reviewedCount} / {totalCards}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Right Rail (SR mode only) ──────────────────────────────────────────────

function ReviewRightRail({
  card, cards, reviewedCount, totalDue, forgotCount, gotItCount,
}: {
  card: ReviewCard | undefined;
  cards: ReviewCard[];
  reviewedCount: number;
  totalDue: number;
  forgotCount: number;
  gotItCount: number;
}) {
  const remaining = cards.length - reviewedCount;
  const accuracy = reviewedCount === 0 ? 0 : Math.round((gotItCount / reviewedCount) * 100);

  const typeCounts = useMemo(() => {
    const counts = { key_lines: 0, approach: 0, complexity: 0 };
    for (const c of cards) counts[c.cardType]++;
    return counts;
  }, [cards]);

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
        <div className="px-4 pt-5 pb-5 space-y-5">

          {/* Current Card */}
          {card && (
            <section>
              <RailHeader>Current Card</RailHeader>
              <div
                className={cn(
                  'rounded-lg px-3 py-2.5 border',
                  'bg-blue-500/[0.08] border-blue-400/50',
                )}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  {(() => {
                    const meta = CARD_TYPE_META[card.cardType];
                    const Icon = meta.icon;
                    return (
                      <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{ background: `${meta.color}15`, color: meta.color }}
                      >
                        <Icon size={10} />
                        {meta.label}
                      </div>
                    );
                  })()}
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: DIFFICULTY_COLOR[card.difficulty] ?? C.textMuted }}
                  >
                    {card.difficulty}
                  </span>
                </div>
                <p
                  className="text-[12.5px] font-semibold leading-tight text-white tracking-[-0.005em]"
                  style={SG}
                >
                  {card.problemTitle}
                </p>
                {card.pattern && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{card.pattern}</p>
                )}
                {card.reviewCount > 0 && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Reviewed {card.reviewCount}x before
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Session Progress */}
          <section>
            <RailHeader>Session Progress</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-3 gap-3')}>
              <Metric value={String(reviewedCount)} label="reviewed" />
              <Metric value={String(remaining)} label="left" />
              <Metric value={`${accuracy}%`} label="accuracy" />
            </div>
          </section>

          {/* Results */}
          <section>
            <RailHeader>Results</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              <MetricRow label="Got it" value={String(gotItCount)} />
              <MetricRow label="Forgot" value={String(forgotCount)} />
              <MetricRow label="Total due" value={String(totalDue)} />
            </div>
          </section>

          {/* Card Types */}
          <section>
            <RailHeader>Queue Breakdown</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2')}>
              {(['key_lines', 'approach', 'complexity'] as const).map(type => {
                const meta = CARD_TYPE_META[type];
                return (
                  <div key={type} className="flex items-center justify-between text-[11.5px]">
                    <div className="flex items-center gap-1.5">
                      <meta.icon size={11} style={{ color: meta.color }} />
                      <span className="text-slate-500">{meta.label}</span>
                    </div>
                    <span className="text-slate-300 font-medium tabular-nums">
                      {typeCounts[type]}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </ScrollArea>
    </aside>
  );
}

// ─── Pro upgrade banner ─────────────────────────────────────────────────────

function ProGateBanner() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY ?? '';
  const yearlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY ?? '';

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-amber-500/10">
          <Lock size={18} className="text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-white mb-1" style={SG}>
            Upgrade to Pro for Spaced Repetition
          </h3>
          <p className="text-[12.5px] text-slate-400 leading-relaxed mb-3">
            When you solve problems, Pro automatically generates personalized flashcards
            from your accepted solutions. Cards are scheduled using spaced repetition -- you review
            them at increasing intervals to build long-term recall.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-white text-zinc-900 hover:bg-zinc-100 text-[12px] font-semibold h-7 px-3"
              onClick={() => handleUpgrade(monthlyPriceId)}
              disabled={loading || !monthlyPriceId}
            >
              {loading ? 'Loading...' : '$9/month'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-[12px] font-semibold h-7 px-3"
              onClick={() => handleUpgrade(yearlyPriceId)}
              disabled={loading || !yearlyPriceId}
            >
              $90/year (save $18)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Review sidebar row ───────────────────────────────────────────────

function QuickSidebarRow({
  card, isActive, isReviewed, result, onClick,
}: {
  card: QuickCard;
  isActive: boolean;
  isReviewed: boolean;
  result?: 'correct' | 'incorrect';
  onClick: () => void;
}) {
  const meta = QUICK_TYPE_META[card.type];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-lg px-3 py-2.5 border transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
        isActive && 'bg-blue-500/[0.08] border-blue-400/50',
        !isActive && isReviewed && result === 'correct' && 'bg-slate-800/30 border-emerald-500/25 hover:border-emerald-500/40',
        !isActive && isReviewed && result === 'incorrect' && 'bg-slate-800/30 border-red-500/25 hover:border-red-500/40',
        !isActive && !isReviewed && 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60 hover:border-slate-600/70',
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div
          className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{ background: `${meta.color}15`, color: meta.color }}
        >
          <Icon size={10} />
          {meta.label}
        </div>
        {isReviewed && result === 'correct' && <Check size={12} strokeWidth={2.25} className="text-emerald-400" />}
        {isReviewed && result === 'incorrect' && <X size={12} strokeWidth={2.25} className="text-red-400" />}
      </div>
      <p
        className={cn(
          'text-[12.5px] font-semibold leading-tight tracking-[-0.005em] truncate',
          isActive && 'text-white',
          !isActive && isReviewed && 'text-slate-300',
          !isActive && !isReviewed && 'text-slate-200',
        )}
        style={SG}
      >
        {card.title}
      </p>
    </button>
  );
}

// ─── Quick Review Right Rail ────────────────────────────────────────────────

function QuickReviewRightRail({
  reviewedCount, totalCards, correctCount, isPro, srDueCount, srReviewed,
}: {
  reviewedCount: number;
  totalCards: number;
  correctCount: number;
  isPro: boolean;
  srDueCount: number;
  srReviewed: number;
}) {
  const remaining = totalCards - reviewedCount;

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
        <div className="px-4 pt-5 pb-5 space-y-5">

          {/* Session Score */}
          <section>
            <RailHeader>Session Score</RailHeader>
            <div className={cn(RAIL_BOX, 'grid grid-cols-3 gap-3')}>
              <Metric value={String(correctCount)} label="correct" />
              <Metric value={String(reviewedCount - correctCount)} label="wrong" />
              <Metric value={String(remaining)} label="remaining" />
            </div>
          </section>

          {/* Spaced Repetition -- the key feature */}
          <section>
            <RailHeader>Spaced Repetition</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-3')}>
              {isPro ? (
                <>
                  <div className="space-y-2">
                    <MetricRow label="Cards due now" value={String(srDueCount)} />
                    {srReviewed > 0 && (
                      <MetricRow label="Reviewed this session" value={String(srReviewed)} />
                    )}
                  </div>
                  {srDueCount === 0 && (
                    <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t" style={{ borderColor: C.border }}>
                      No cards due right now. As you solve more problems, personalized review cards are generated from your accepted solutions and scheduled at increasing intervals.
                    </p>
                  )}
                </>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11.5px] text-slate-400 leading-relaxed">
                    Pro generates personalized flashcards every time you solve a problem. Cards come back at increasing intervals so you review right before you forget.
                  </p>
                  <div className="space-y-1.5 pt-1 border-t" style={{ borderColor: C.border }}>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span className="text-[11px] text-slate-500">Day 1: first review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span className="text-[11px] text-slate-500">Day 2: second review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                      <span className="text-[11px] text-slate-500">Day 4, 8, 16, 30...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* How it works */}
          <section>
            <RailHeader>How Review Works</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-3')}>
              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-500/15 text-blue-400 flex items-center justify-center text-[10px] font-bold mt-0.5">1</span>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">Quick Review</span> -- random fundamentals to test Big-O, patterns, and code reading
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[10px] font-bold mt-0.5">2</span>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">Solve problems</span> -- AI generates flashcards from your accepted code
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-[10px] font-bold mt-0.5">3</span>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed">
                    <span className="text-slate-300 font-medium">Spaced repetition</span> -- your cards come back at optimized intervals so you never forget
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Coming up */}
          <section>
            <RailHeader>Coming Up</RailHeader>
            <div className={cn(RAIL_BOX, 'space-y-2.5')}>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                The more problems you solve, the more personalized this page becomes. Instead of random fundamentals, you will review:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Code2 size={11} className="text-blue-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">Key lines from your solutions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain size={11} className="text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">Patterns and approaches you used</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer size={11} className="text-amber-400 shrink-0" />
                  <span className="text-[11px] text-slate-300">Time and space complexity</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </ScrollArea>
    </aside>
  );
}

// ─── Empty / sign-in / upgrade states ───────────────────────────────────────

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: C.appBg }}>
      <AppNav activeTab="Review" />
      <main className="pt-12">
        {children}
      </main>
    </div>
  );
}

// ─── Quick Review Left Sidebar ──────────────────────────────────────────────

function QuickReviewSidebar({
  cards, currentIdx, reviewedSet, results, onSelectCard, srDueCount, mode, isPro,
}: {
  cards: QuickCard[];
  currentIdx: number;
  reviewedSet: Set<number>;
  results: Map<number, 'correct' | 'incorrect'>;
  onSelectCard: (idx: number) => void;
  srDueCount: number;
  mode: 'quick' | 'sr';
  isPro: boolean;
}) {
  const totalCards = cards.length;
  const reviewedCount = reviewedSet.size;
  const correctCount = Array.from(results.values()).filter(r => r === 'correct').length;
  const pct = totalCards === 0 ? 0 : Math.round((reviewedCount / totalCards) * 100);

  return (
    <aside
      className="fixed left-0 bottom-0 hidden md:flex flex-col"
      style={{
        top: 48,
        width: 304,
        background: C.panelBg,
        borderRight: `1px solid ${C.border}`,
      }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="px-4 pt-5 pb-3 space-y-2">
          <p className="text-[10px] font-bold text-slate-600 tracking-[0.16em] uppercase mb-1 px-1">
            {mode === 'sr' ? 'Due for Review' : 'Quick Review'}
          </p>

          {/* Context message */}
          <div className="px-1 pb-2">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isPro
                ? 'These are random fundamentals. As you solve more problems, your review cards will be based on your actual solutions.'
                : 'Random fundamentals to sharpen your foundations. Upgrade to Pro to get personalized cards from problems you solve.'}
            </p>
          </div>

          {cards.map((card, idx) => (
            <QuickSidebarRow
              key={card.id}
              card={card}
              isActive={idx === currentIdx}
              isReviewed={reviewedSet.has(idx)}
              result={results.get(idx)}
              onClick={() => onSelectCard(idx)}
            />
          ))}
        </div>
      </div>

      {/* Stats subpanel */}
      <div
        className="px-4 py-4 space-y-4"
        style={{ borderTop: `1px solid ${C.border}`, background: C.cardBgDark }}
      >
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[11.5px] mb-1.5">
              <span className="text-slate-500 font-medium">Session</span>
              <span className="text-slate-300 font-semibold tabular-nums">{pct}%</span>
            </div>
            <div className="h-[3px] rounded-full bg-slate-800">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: C.blue }}
              />
            </div>
          </div>
          <div className="flex justify-between text-[11.5px]">
            <span className="text-slate-500">Score</span>
            <span className="text-slate-400 font-medium tabular-nums">
              {correctCount} / {reviewedCount} correct
            </span>
          </div>
          {srDueCount > 0 && mode === 'quick' && (
            <div className="flex justify-between text-[11.5px]">
              <span className="text-slate-500">SR cards due</span>
              <span className="text-amber-400 font-medium tabular-nums">{srDueCount}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Main review page ────────────────────────────────────────────────────────

export default function ReviewPageClient({
  isPro,
  isSignedIn,
}: {
  isPro: boolean;
  isSignedIn: boolean;
}) {
  // ── SR card state ──
  const [srCards, setSrCards] = useState<ReviewCard[]>([]);
  const [srLoading, setSrLoading] = useState(true);
  const [srCurrentIdx, setSrCurrentIdx] = useState(0);
  const [srRevealed, setSrRevealed] = useState(false);
  const [totalDue, setTotalDue] = useState(0);
  const [srReviewed, setSrReviewed] = useState(0);
  const [srReviewedSet, setSrReviewedSet] = useState<Set<number>>(new Set());
  const [srGotIt, setSrGotIt] = useState(0);
  const [srForgot, setSrForgot] = useState(0);

  // ── Quick review state ──
  // Shuffle cards on each mount so they're different every session
  const shuffledQuickCards = useMemo(() => {
    const arr = [...QUICK_CARDS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);
  const [quickIdx, setQuickIdx] = useState(0);
  const [quickReviewedSet, setQuickReviewedSet] = useState<Set<number>>(new Set());
  const [quickResults, setQuickResults] = useState<Map<number, 'correct' | 'incorrect'>>(new Map());
  // Key to force remount of interactive cards when switching
  const [cardKey, setCardKey] = useState(0);

  // Are we in SR mode (have due cards) or quick review mode?
  const mode = srCards.length > 0 ? 'sr' : 'quick';

  const fetchCards = useCallback(async () => {
    setSrLoading(true);
    try {
      const res = await fetch('/api/review/due');
      const data = await res.json();
      setSrCards(data.cards ?? []);
      setTotalDue(data.totalDue ?? 0);
    } catch {
      setSrCards([]);
    }
    setSrLoading(false);
  }, []);

  useEffect(() => {
    if (isPro && isSignedIn) fetchCards();
    else setSrLoading(false);
  }, [isPro, isSignedIn, fetchCards]);

  async function handleSrResult(result: 'got_it' | 'forgot') {
    const card = srCards[srCurrentIdx];
    if (!card) return;

    await fetch('/api/review/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id, result }),
    });

    setSrReviewed(r => r + 1);
    setSrReviewedSet(prev => new Set(prev).add(srCurrentIdx));
    if (result === 'got_it') setSrGotIt(c => c + 1);
    else setSrForgot(c => c + 1);
    setSrRevealed(false);

    if (srCurrentIdx < srCards.length - 1) {
      setSrCurrentIdx(i => i + 1);
    } else {
      setSrCards([]);
    }
  }

  async function handleDismiss() {
    const card = srCards[srCurrentIdx];
    if (!card) return;

    await fetch('/api/review/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: card.id }),
    });

    const next = srCards.filter((_, i) => i !== srCurrentIdx);
    setSrCards(next);
    if (srCurrentIdx >= next.length) setSrCurrentIdx(Math.max(0, next.length - 1));
    setSrRevealed(false);
  }

  function handleQuickAnswer(correct: boolean) {
    setQuickReviewedSet(prev => new Set(prev).add(quickIdx));
    setQuickResults(prev => {
      const next = new Map(prev);
      next.set(quickIdx, correct ? 'correct' : 'incorrect');
      return next;
    });
  }

  function handleQuickNext() {
    if (quickIdx < shuffledQuickCards.length - 1) {
      setQuickIdx(i => i + 1);
      setCardKey(k => k + 1);
    }
  }

  function handleQuickSelectCard(idx: number) {
    setQuickIdx(idx);
    setCardKey(k => k + 1);
  }

  // ─── Sign-in state ────────────────────────────────────────────────────────

  if (!isSignedIn) {
    return (
      <CenteredMessage>
        <div className="max-w-lg mx-auto mt-24 text-center space-y-4">
          <Brain size={32} className="text-slate-500 mx-auto" />
          <h2 className="text-[18px] font-bold text-white" style={SG}>Sign in to review</h2>
          <p className="text-[13px] text-slate-400">
            Spaced repetition review requires an account to track your progress.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 border-slate-700 text-slate-200"
            nativeButton={false}
            render={<Link href="/sign-in?next=/review" />}
          >
            Sign in
          </Button>
        </div>
      </CenteredMessage>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (isPro && srLoading) {
    return (
      <CenteredMessage>
        <div className="flex items-center justify-center mt-32">
          <div className="animate-pulse text-[13px] text-slate-500">Loading review cards...</div>
        </div>
      </CenteredMessage>
    );
  }

  // ─── SR mode: 3-column layout with spaced repetition cards ────────────────

  if (mode === 'sr' && isPro) {
    const card = srCards[srCurrentIdx];
    const meta = card ? CARD_TYPE_META[card.cardType] : null;
    const Icon = meta?.icon ?? Brain;

    return (
      <div className="min-h-screen text-slate-200" style={{ background: C.appBg }}>
        <AppNav activeTab="Review" />
        <ReviewSidebar
          cards={srCards}
          currentIdx={srCurrentIdx}
          reviewedSet={srReviewedSet}
          onSelectCard={(idx) => { setSrCurrentIdx(idx); setSrRevealed(false); }}
        />
        <ReviewRightRail
          card={card}
          cards={srCards}
          reviewedCount={srReviewed}
          totalDue={totalDue}
          forgotCount={srForgot}
          gotItCount={srGotIt}
        />
        <main
          className="min-h-screen"
          style={{
            paddingTop: 48,
            paddingLeft: 304,
            paddingRight: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        >
          <div className="lg:pr-[304px]">
            <div className="max-w-3xl mx-auto px-8 pt-10">
              {card && meta ? (
                <>
                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[12px] text-slate-500 font-medium tabular-nums">
                      {srCurrentIdx + 1} of {srCards.length}
                    </span>
                    <div className="flex-1 h-[3px] rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${((srCurrentIdx + 1) / srCards.length) * 100}%` }}
                      />
                    </div>
                    {srReviewed > 0 && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {srReviewed} reviewed
                      </span>
                    )}
                  </div>

                  {/* Card */}
                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{ background: C.cardBg, borderColor: C.border }}
                  >
                    {/* Card header */}
                    <div
                      className="flex items-center justify-between px-5 py-3 border-b"
                      style={{ borderColor: C.border }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
                          style={{ background: `${meta.color}15`, color: meta.color }}
                        >
                          <Icon size={12} />
                          {meta.label}
                        </div>
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: DIFFICULTY_COLOR[card.difficulty] ?? C.textMuted }}
                        >
                          {card.difficulty}
                        </span>
                        {card.reviewCount > 0 && (
                          <span className="text-[10px] text-slate-600">
                            reviewed {card.reviewCount}x
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleDismiss}
                        className="text-slate-600 hover:text-slate-400 transition-colors p-1"
                        title="Dismiss this card"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Problem title */}
                    <div className="px-5 pt-4 pb-2">
                      <h2 className="text-[16px] font-bold text-white" style={SG}>
                        {card.problemTitle}
                      </h2>
                      {card.pattern && (
                        <span className="text-[11px] text-slate-500 font-medium">{card.pattern}</span>
                      )}
                    </div>

                    {/* Card content */}
                    <div className="px-5 pb-5">
                      {!srRevealed ? (
                        <>
                          {card.cardType === 'key_lines' && <KeyLinesFront card={card} />}
                          {card.cardType === 'approach' && <ApproachFront card={card} />}
                          {card.cardType === 'complexity' && <ComplexityFront card={card} />}
                        </>
                      ) : (
                        <>
                          {card.cardType === 'key_lines' && <KeyLinesBack card={card} />}
                          {card.cardType === 'approach' && <ApproachBack card={card} />}
                          {card.cardType === 'complexity' && <ComplexityBack card={card} />}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center justify-center gap-3 px-5 py-4 border-t"
                      style={{ borderColor: C.border }}
                    >
                      {!srRevealed ? (
                        <Button
                          onClick={() => setSrRevealed(true)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold px-6"
                        >
                          <Eye size={14} className="mr-2" />
                          Reveal Answer
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleSrResult('forgot')}
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-[13px] font-semibold px-5"
                          >
                            <RotateCcw size={14} className="mr-2" />
                            Forgot
                          </Button>
                          <Button
                            onClick={() => handleSrResult('got_it')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-semibold px-5"
                          >
                            <Check size={14} className="mr-2" />
                            Got it
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Quick Review mode (no SR cards due, or not Pro) ──────────────────────

  const quickCard = shuffledQuickCards[quickIdx];
  const quickMeta = quickCard ? QUICK_TYPE_META[quickCard.type] : null;
  const QuickIcon = quickMeta?.icon ?? Brain;
  const isCurrentAnswered = quickReviewedSet.has(quickIdx);

  return (
    <div className="min-h-screen text-slate-200" style={{ background: C.appBg }}>
      <AppNav activeTab="Review" />
      <QuickReviewSidebar
        cards={shuffledQuickCards}
        currentIdx={quickIdx}
        reviewedSet={quickReviewedSet}
        results={quickResults}
        onSelectCard={handleQuickSelectCard}
        srDueCount={totalDue}
        mode="quick"
        isPro={isPro}
      />
      <QuickReviewRightRail
        reviewedCount={quickReviewedSet.size}
        totalCards={shuffledQuickCards.length}
        correctCount={Array.from(quickResults.values()).filter(r => r === 'correct').length}
        isPro={isPro}
        srDueCount={totalDue}
        srReviewed={srReviewed}
      />
      <main
        className="min-h-screen"
        style={{
          paddingTop: 48,
          paddingLeft: 304,
          paddingRight: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        <div className="lg:pr-[304px]">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-16">

          {/* Pro upgrade banner for non-pro users */}
          {!isPro && <ProGateBanner />}

          {/* Session complete banner */}
          {isPro && srReviewed > 0 && srCards.length === 0 && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-[13px] text-white font-semibold" style={SG}>All caught up</p>
                <p className="text-[12px] text-slate-400">
                  You reviewed {srReviewed} spaced repetition card{srReviewed === 1 ? '' : 's'} this session. Keep sharp with the fundamentals below.
                </p>
              </div>
            </div>
          )}

          {/* Quick Review heading */}
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[20px] font-bold text-white" style={SG}>Quick Review</h1>
          </div>
          <p className="text-[13px] text-slate-500 mb-6">
            Test your knowledge of fundamentals. Pick or type answers -- no peeking.
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[12px] text-slate-500 font-medium tabular-nums">
              {quickIdx + 1} / {shuffledQuickCards.length}
            </span>
            <div className="flex-1 h-[3px] rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${((quickIdx + 1) / shuffledQuickCards.length) * 100}%` }}
              />
            </div>
            {quickReviewedSet.size > 0 && (() => {
              const correct = Array.from(quickResults.values()).filter(r => r === 'correct').length;
              return (
                <span className="text-[11px] text-slate-400 font-medium tabular-nums">
                  {correct}/{quickReviewedSet.size} correct
                </span>
              );
            })()}
          </div>

          {/* Quick card */}
          {quickCard && quickMeta ? (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: C.cardBg, borderColor: C.border }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-6 py-3.5 border-b"
                style={{ borderColor: C.border }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold"
                    style={{ background: `${quickMeta.color}15`, color: quickMeta.color }}
                  >
                    <QuickIcon size={12} />
                    {quickMeta.label}
                  </div>
                </div>
                {isCurrentAnswered && (
                  <span className={cn(
                    'text-[11px] font-semibold',
                    quickResults.get(quickIdx) === 'correct' ? 'text-emerald-400' : 'text-red-400',
                  )}>
                    {quickResults.get(quickIdx) === 'correct' ? 'Correct' : 'Incorrect'}
                  </span>
                )}
              </div>

              {/* Card title */}
              <div className="px-6 pt-5 pb-1">
                <h2 className="text-[18px] font-bold text-white" style={SG}>
                  {quickCard.title}
                </h2>
              </div>

              {/* Card content -- interactive */}
              <div className="px-6 pb-6 pt-3">
                {quickCard.interaction === 'mcq' && (
                  <MCQCard key={cardKey} card={quickCard} onAnswer={handleQuickAnswer} />
                )}
                {quickCard.interaction === 'type_answer' && (
                  <TypeAnswerCard key={cardKey} card={quickCard} onAnswer={handleQuickAnswer} />
                )}
              </div>

              {/* Next button -- only after answering */}
              {isCurrentAnswered && quickIdx < shuffledQuickCards.length - 1 && (
                <div
                  className="flex items-center justify-center px-6 py-4 border-t"
                  style={{ borderColor: C.border }}
                >
                  <Button
                    onClick={handleQuickNext}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[14px] font-semibold px-8 py-2.5"
                  >
                    Next Question
                    <ArrowRight size={15} className="ml-2" />
                  </Button>
                </div>
              )}

              {/* Completion state */}
              {isCurrentAnswered && quickIdx === shuffledQuickCards.length - 1 && (
                <div
                  className="flex flex-col items-center justify-center px-6 py-6 border-t gap-3"
                  style={{ borderColor: C.border }}
                >
                  <p className="text-[15px] font-semibold text-white" style={SG}>
                    Review complete
                  </p>
                  <p className="text-[13px] text-slate-400">
                    {Array.from(quickResults.values()).filter(r => r === 'correct').length} / {shuffledQuickCards.length} correct.
                    {' '}Solve problems to unlock personalized spaced repetition cards.
                  </p>
                  <Button
                    onClick={() => {
                      setQuickIdx(0);
                      setQuickReviewedSet(new Set());
                      setQuickResults(new Map());
                      setCardKey(k => k + 1);
                    }}
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-[13px] mt-1"
                  >
                    <RotateCcw size={13} className="mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          ) : null}

        </div>
        </div>
      </main>
    </div>
  );
}
