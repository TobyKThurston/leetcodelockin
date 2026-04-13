// ─── Curriculum Data ──────────────────────────────────────────────────────────
// Edit this file to add, reorder, or update paths and blocks.
// Statuses (locked/unlocked/complete) are derived at runtime from user progress.

export interface LessonBlockDef {
  type: 'lesson';
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  skills: string[];
  lessonCount: number;
  problemCount: number;
}

export interface PracticeStepDef {
  type: 'practice';
  id: string;
  order: number;
  problemSlug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type CurriculumStep = LessonBlockDef | PracticeStepDef;

/** @deprecated Use LessonBlockDef */
export type BlockDef = LessonBlockDef;

export function isLesson(step: CurriculumStep): step is LessonBlockDef {
  return step.type === 'lesson';
}

export function isPractice(step: CurriculumStep): step is PracticeStepDef {
  return step.type === 'practice';
}

export interface PathDef {
  id: string;
  order: number;          // 1-indexed, determines unlock sequence
  title: string;
  description: string;
  blocks: CurriculumStep[];
}

/** Find all practice step IDs that reference a given problem slug. */
export function findPracticeStepsBySlug(slug: string): string[] {
  const ids: string[] = [];
  for (const path of CURRICULUM) {
    for (const step of path.blocks) {
      if (step.type === 'practice' && step.problemSlug === slug) {
        ids.push(step.id);
      }
    }
  }
  return ids;
}

// Helper to reduce practice step boilerplate
function practice(
  parentId: string,
  n: number,
  slug: string,
  title: string,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  order: number,
): PracticeStepDef {
  return { type: 'practice', id: `${parentId}-practice-${n}`, order, problemSlug: slug, title, difficulty };
}

export const CURRICULUM: PathDef[] = [
  // ── PATH 1 ──────────────────────────────────────────────────────────────────
  {
    id: 'python-foundations',
    order: 1,
    title: 'Python Foundations',
    description: 'Start from zero. You\'ll leave knowing enough Python to read and write solutions with confidence.',
    blocks: [
      {
        type: 'lesson',
        id: 'p1-variables',
        order: 1,
        title: 'Variables and Basic Types',
        subtitle: 'Numbers, text, and true/false values',
        description: 'Meet the basic kinds of data you\'ll work with: numbers, text, and yes/no values. Everything else builds on these.',
        skills: ['Storing values in variables', 'Whole numbers and decimals', 'Text (strings)', 'True and false values', 'Printing results to the screen', 'Getting comfortable with input and output'],
        lessonCount: 5,
        problemCount: 3,
      },
      {
        type: 'lesson',
        id: 'p1-operators',
        order: 2,
        title: 'Operators and Expressions',
        subtitle: 'Math, comparisons, and yes/no logic',
        description: 'Do math, compare things, and combine yes/no questions. These are the tools you\'ll reach for in almost every problem.',
        skills: ['Doing math with numbers', 'Comparing values', 'Combining conditions with and / or / not', 'Shortcut assignments like += and -=', 'How Python reads an expression'],
        lessonCount: 4,
        problemCount: 4,
      },
      {
        type: 'lesson',
        id: 'p1-conditionals',
        order: 3,
        title: 'Conditionals',
        subtitle: 'Making your code decide what to do',
        description: 'Teach your code to make decisions — do one thing if something is true, and something else if it\'s not.',
        skills: ['Using if, elif, and else', 'Choices inside other choices', 'Writing yes/no conditions', 'Simple decision making'],
        lessonCount: 4,
        problemCount: 5,
      },
      {
        type: 'lesson',
        id: 'p1-loops',
        order: 4,
        title: 'Loops',
        subtitle: 'Repeating steps over a list of things',
        description: 'Walk through a list of items one by one, or repeat something until you\'re done. Loops do most of the heavy lifting in code.',
        skills: ['Walking through a list with a for loop', 'Repeating until done with while', 'Counting with range()', 'Tracking position with enumerate()', 'Stopping or skipping steps', 'Loops inside loops'],
        lessonCount: 5,
        problemCount: 6,
      },
      {
        type: 'lesson',
        id: 'p1-functions',
        order: 5,
        title: 'Functions',
        subtitle: 'Reusable blocks of code',
        description: 'Package your code into little reusable blocks you can call by name. Every interview problem is solved inside a function.',
        skills: ['Creating a function with def', 'Giving your function inputs', 'Getting a result back with return', 'Where variables live', 'Breaking work into helper functions', 'The class Solution format used in interviews'],
        lessonCount: 5,
        problemCount: 5,
      },
      {
        type: 'lesson',
        id: 'p1-lists',
        order: 6,
        title: 'Lists and Strings',
        subtitle: 'Working with sequences of items',
        description: 'Lists are the workhorse of Python — almost every problem uses one. Get fully comfortable reading, changing, and looping through them.',
        skills: ['Making a list', 'Picking items by position', 'Taking a slice of a list', 'Looping through the items', 'Adding and removing items', 'Checking how many items are in it', 'Working with text letter by letter', 'Built-in tools for strings'],
        lessonCount: 6,
        problemCount: 8,
      },
      {
        type: 'lesson',
        id: 'p1-dicts',
        order: 7,
        title: 'Dictionaries and Sets',
        subtitle: 'Fast lookups and counting things',
        description: 'Dictionaries let you look things up instantly. Sets let you track what you\'ve already seen. Between them, they unlock dozens of problem patterns.',
        skills: ['Storing and looking up key-value pairs', 'Updating a value', 'Looping through a dictionary', 'Counting how often things appear', 'Checking if an item is in a set', 'Finding duplicates'],
        lessonCount: 5,
        problemCount: 7,
      },
      {
        type: 'lesson',
        id: 'p1-solve',
        order: 8,
        title: 'Your First Problems',
        subtitle: 'Putting it all together',
        description: 'Time for your first real problems. Learn how to read the question, plan your approach, and write a solution that works.',
        skills: ['Understanding what a problem is asking', 'Walking through code by hand', 'Writing simple solutions', 'Thinking about tricky edge cases', 'Warmup practice problems'],
        lessonCount: 4,
        problemCount: 10,
      },
      practice('p1-solve', 1, 'fibonacci-number', 'Fibonacci Number', 'Easy', 9),
    ],
  },

  // ── PATH 2 ──────────────────────────────────────────────────────────────────
  {
    id: 'core-data-structures',
    order: 2,
    title: 'Core Data Structures',
    description: 'The building blocks every interview problem is made from. Get comfortable with these and the hard stuff gets much easier.',
    blocks: [
      {
        type: 'lesson',
        id: 'p2-arrays',
        order: 1,
        title: 'Arrays and Strings',
        subtitle: 'The most common interview structure',
        description: 'By far the most common thing you\'ll see in an interview. Get so comfortable with lists and text that you can work with them without thinking.',
        skills: ['Walking through a list', 'Working with two positions at once', 'Building up running totals', 'Counting items', 'Changing text'],
        lessonCount: 5,
        problemCount: 8,
      },
      practice('p2-arrays', 1, 'contains-duplicate', 'Contains Duplicate', 'Easy', 2),
      practice('p2-arrays', 2, 'valid-anagram', 'Valid Anagram', 'Easy', 3),
      {
        type: 'lesson',
        id: 'p2-hashmaps',
        order: 4,
        title: 'Hash Maps',
        subtitle: 'Instant lookups with key-value pairs',
        description: 'Hash maps (dictionaries in Python) let you find anything instantly. They\'re behind almost every fast, efficient solution.',
        skills: ['Looking things up in a dictionary', 'The "find the other half" trick', 'Counting how often things appear', 'Grouping items together', 'Remembering what you\'ve seen'],
        lessonCount: 4,
        problemCount: 8,
      },
      practice('p2-hashmaps', 1, 'two-sum', 'Two Sum', 'Easy', 5),
      practice('p2-hashmaps', 2, 'unique-number-of-occurrences', 'Unique Number of Occurrences', 'Easy', 6),
      {
        type: 'lesson',
        id: 'p2-sets',
        order: 7,
        title: 'Sets',
        subtitle: 'Tracking unique items and what you\'ve seen',
        description: 'Sets are a simple tool with a superpower: they tell you instantly whether you\'ve seen something before.',
        skills: ['Creating a set', 'Checking if something is in a set', 'Removing duplicates', 'Tracking visited items', 'Combining and comparing sets'],
        lessonCount: 3,
        problemCount: 5,
      },
      practice('p2-sets', 1, 'intersection-of-two-arrays', 'Intersection of Two Arrays', 'Easy', 8),
      {
        type: 'lesson',
        id: 'p2-stacks',
        order: 9,
        title: 'Stacks',
        subtitle: 'Last in, first out',
        description: 'A stack remembers things in the order you added them — the last thing in is the first thing out. Great for matching pairs and looking backwards.',
        skills: ['Adding and removing items', 'The "last in, first out" idea', 'Matching brackets and pairs', 'Remembering recent history', 'A gentle intro to monotonic stacks'],
        lessonCount: 4,
        problemCount: 7,
      },
      practice('p2-stacks', 1, 'valid-parentheses', 'Valid Parentheses', 'Easy', 10),
      practice('p2-stacks', 2, 'baseball-game', 'Baseball Game', 'Easy', 11),
      {
        type: 'lesson',
        id: 'p2-queues',
        order: 12,
        title: 'Queues and Deques',
        subtitle: 'First in, first out',
        description: 'Queues process items in the order they arrive, like a line at a coffee shop. They\'re how you explore things level by level.',
        skills: ['The "first in, first out" idea', 'Using collections.deque', 'Processing items in order', 'Sliding window tricks with a deque', 'Setting up for breadth-first search'],
        lessonCount: 4,
        problemCount: 6,
      },
      practice('p2-queues', 1, 'implement-queue-using-stacks', 'Implement Queue using Stacks', 'Easy', 13),
      {
        type: 'lesson',
        id: 'p2-linked',
        order: 14,
        title: 'Linked Lists',
        subtitle: 'Chains of connected nodes',
        description: 'A classic interview favorite. You\'ll learn to walk through a chain of connected nodes, reverse it, and even detect loops.',
        skills: ['Nodes and the "next" pointer', 'Walking down a list', 'Reversing a list', 'The slow and fast pointer trick', 'Spotting loops in a list'],
        lessonCount: 5,
        problemCount: 8,
      },
      practice('p2-linked', 1, 'reverse-linked-list', 'Reverse Linked List', 'Easy', 15),
      practice('p2-linked', 2, 'linked-list-cycle', 'Linked List Cycle', 'Easy', 16),
      {
        type: 'lesson',
        id: 'p2-trees',
        order: 17,
        title: 'Trees',
        subtitle: 'Branching structures with parents and children',
        description: 'Trees show up in about 1 in 4 interview questions. You\'ll learn to walk through branching structures using recursion.',
        skills: ['How a binary tree is shaped', 'Exploring deep first (DFS)', 'Exploring level by level (BFS)', 'Three ways to visit every node', 'Common traversal patterns'],
        lessonCount: 6,
        problemCount: 10,
      },
      practice('p2-trees', 1, 'maximum-depth-of-binary-tree', 'Maximum Depth of Binary Tree', 'Easy', 18),
      practice('p2-trees', 2, 'invert-binary-tree', 'Invert Binary Tree', 'Easy', 19),
      {
        type: 'lesson',
        id: 'p2-heaps',
        order: 20,
        title: 'Heaps and Priority Queues',
        subtitle: 'Always grabbing the smallest or largest',
        description: 'A heap always gives you the smallest (or largest) item instantly. Perfect for "find the top few" problems.',
        skills: ['Python\'s heapq module', 'Getting the smallest item fast', 'Trick for getting the largest instead', 'The top K pattern', 'Processing by priority'],
        lessonCount: 4,
        problemCount: 7,
      },
      practice('p2-heaps', 1, 'kth-largest-element-in-a-stream', 'Kth Largest Element in a Stream', 'Easy', 21),
      practice('p2-heaps', 2, 'last-stone-weight', 'Last Stone Weight', 'Easy', 22),
      {
        type: 'lesson',
        id: 'p2-graphs',
        order: 23,
        title: 'Graph Basics',
        subtitle: 'Connecting the dots',
        description: 'Graphs are how you model anything connected — friends on a network, cities on a map, steps in a puzzle. Start by learning how to walk through one.',
        skills: ['Storing a graph as a list of connections', 'Breadth-first search (BFS)', 'Depth-first search (DFS)', 'Keeping track of what you\'ve visited', 'Finding connected groups'],
        lessonCount: 5,
        problemCount: 8,
      },
      practice('p2-graphs', 1, 'flood-fill', 'Flood Fill', 'Easy', 24),
      practice('p2-graphs', 2, 'number-of-islands', 'Number of Islands', 'Medium', 25),
    ],
  },

  // ── PATH 3 ──────────────────────────────────────────────────────────────────
  {
    id: 'pattern-library',
    order: 3,
    title: 'Pattern Library',
    description: 'Every interview problem is a remix of a few reusable patterns. Learn them once, recognize them forever.',
    blocks: [
      {
        type: 'lesson',
        id: 'p3-twopointers',
        order: 1,
        title: 'Two Pointers',
        subtitle: 'Two positions at once — no nested loops',
        description: 'Instead of looping inside a loop, use two pointers that move through the list. It\'s simpler, shorter, and much faster.',
        skills: ['Pointers moving toward each other', 'Pointers moving the same direction', 'The slow and fast pointer pattern', 'Splitting items into groups'],
        lessonCount: 3,
        problemCount: 10,
      },
      practice('p3-twopointers', 1, 'valid-palindrome', 'Valid Palindrome', 'Easy', 2),
      practice('p3-twopointers', 2, 'move-zeroes', 'Move Zeroes', 'Easy', 3),
      {
        type: 'lesson',
        id: 'p3-window',
        order: 4,
        title: 'Sliding Window',
        subtitle: 'Scanning a range that slides along',
        description: 'Look at a chunk of items at a time, then slide the chunk along without re-counting what you already know. Saves a ton of work.',
        skills: ['Windows of a fixed size', 'Windows that grow and shrink', 'Expanding and contracting logic', 'Counting letters inside a window'],
        lessonCount: 3,
        problemCount: 9,
      },
      practice('p3-window', 1, 'maximum-average-subarray-i', 'Maximum Average Subarray I', 'Easy', 5),
      practice('p3-window', 2, 'best-time-to-buy-and-sell-stock', 'Best Time to Buy and Sell Stock', 'Easy', 6),
      {
        type: 'lesson',
        id: 'p3-prefix',
        order: 7,
        title: 'Prefix Sum',
        subtitle: 'Precomputing running totals',
        description: 'Add up numbers as you go once, then answer "what\'s the sum between here and here?" instantly.',
        skills: ['Building a running total', 'Answering range questions', 'Finding subarrays that hit a target sum', 'Combining running totals with a dictionary'],
        lessonCount: 3,
        problemCount: 7,
      },
      practice('p3-prefix', 1, 'find-all-numbers-disappeared-in-an-array', 'Find All Numbers Disappeared in an Array', 'Easy', 8),
      {
        type: 'lesson',
        id: 'p3-bsearch',
        order: 9,
        title: 'Binary Search',
        subtitle: 'Cutting the search in half every step',
        description: 'Each step, throw away half of what\'s left. It\'s elegant, fast, and shows up far more than you\'d expect.',
        skills: ['The basic binary search', 'Finding the leftmost or rightmost match', 'Shrinking the search space', 'Binary searching on the answer itself'],
        lessonCount: 4,
        problemCount: 10,
      },
      practice('p3-bsearch', 1, 'binary-search', 'Binary Search', 'Easy', 10),
      practice('p3-bsearch', 2, 'search-insert-position', 'Search Insert Position', 'Easy', 11),
      {
        type: 'lesson',
        id: 'p3-hashing',
        order: 12,
        title: 'Hashing Patterns',
        subtitle: 'The dictionary tricks you\'ll see over and over',
        description: 'The same handful of dictionary tricks show up in dozens of problems. Learn them once and they become automatic.',
        skills: ['The two-sum complement trick', 'Counting how often items appear', 'Tracking what you\'ve seen', 'Grouping by a shared key', 'Spotting anagrams'],
        lessonCount: 3,
        problemCount: 9,
      },
      practice('p3-hashing', 1, 'group-anagrams', 'Group Anagrams', 'Medium', 13),
      practice('p3-hashing', 2, 'subarray-sum-equals-k', 'Subarray Sum Equals K', 'Medium', 14),
      {
        type: 'lesson',
        id: 'p3-stackpat',
        order: 15,
        title: 'Stack Patterns',
        subtitle: 'Clever tricks with stacks',
        description: 'Go beyond the basics. You\'ll learn the "monotonic stack" — a counterintuitive trick that makes some hard problems feel easy.',
        skills: ['Matching brackets', 'Monotonic decreasing stacks', 'The "next greater element" pattern', 'Daily temperatures-style problems'],
        lessonCount: 3,
        problemCount: 8,
      },
      practice('p3-stackpat', 1, 'remove-all-adjacent-duplicates-in-string', 'Remove All Adjacent Duplicates In String', 'Easy', 16),
      practice('p3-stackpat', 2, 'backspace-string-compare', 'Backspace String Compare', 'Easy', 17),
      {
        type: 'lesson',
        id: 'p3-bfs',
        order: 18,
        title: 'BFS Patterns',
        subtitle: 'Exploring layer by layer',
        description: 'Explore outward in widening rings — the standard trick for finding shortest paths and working level by level.',
        skills: ['Visiting a tree level by level', 'Shortest path on a simple graph', 'BFS on a grid', 'Starting from several places at once'],
        lessonCount: 4,
        problemCount: 10,
      },
      practice('p3-bfs', 1, 'rotting-oranges', 'Rotting Oranges', 'Medium', 19),
      practice('p3-bfs', 2, 'island-perimeter', 'Island Perimeter', 'Easy', 20),
      {
        type: 'lesson',
        id: 'p3-dfs',
        order: 21,
        title: 'DFS and Backtracking',
        subtitle: 'Exploring every possible path',
        description: 'Try every possibility, and back out when you hit a dead end. This is how you solve "find all the ways" problems.',
        skills: ['Recursive depth-first search', 'The backtracking template', 'Generating every subset', 'Generating every ordering', 'Cutting off bad branches early'],
        lessonCount: 4,
        problemCount: 12,
      },
      practice('p3-dfs', 1, 'same-tree', 'Same Tree', 'Easy', 22),
      practice('p3-dfs', 2, 'symmetric-tree', 'Symmetric Tree', 'Easy', 23),
      {
        type: 'lesson',
        id: 'p3-treepat',
        order: 24,
        title: 'Tree Patterns',
        subtitle: 'Solving tree problems with recursion',
        description: 'A reliable recipe for tree problems: break the tree into smaller trees, solve those, and combine the answers.',
        skills: ['The recursive DFS recipe', 'Measuring tree height', 'Measuring tree diameter', 'Reasoning about subtrees', 'Finding paths through a tree'],
        lessonCount: 4,
        problemCount: 10,
      },
      practice('p3-treepat', 1, 'diameter-of-binary-tree', 'Diameter of Binary Tree', 'Easy', 25),
      practice('p3-treepat', 2, 'balanced-binary-tree', 'Balanced Binary Tree', 'Easy', 26),
      {
        type: 'lesson',
        id: 'p3-heappat',
        order: 27,
        title: 'Heap Patterns',
        subtitle: 'Problems that keep grabbing the extremes',
        description: 'Any time a problem needs "the top few" or "the smallest so far, over and over," a heap is your friend.',
        skills: ['Finding the top K items', 'K closest points to a target', 'Running median with two heaps', 'Merging K sorted lists'],
        lessonCount: 3,
        problemCount: 8,
      },
      practice('p3-heappat', 1, 'k-closest-points-to-origin', 'K Closest Points to Origin', 'Medium', 28),
      {
        type: 'lesson',
        id: 'p3-dp',
        order: 29,
        title: 'Dynamic Programming Intro',
        subtitle: 'Breaking problems into smaller problems',
        description: 'The pattern everyone dreads — demystified. You\'ll see it\'s really just "solve a big problem by solving smaller versions of it, and remember the answers."',
        skills: ['Spotting repeated subproblems', 'Top-down with memoization', 'Bottom-up with a table', '1D DP basics', 'Writing the step from one state to the next'],
        lessonCount: 5,
        problemCount: 10,
      },
      practice('p3-dp', 1, 'climbing-stairs', 'Climbing Stairs', 'Easy', 30),
      practice('p3-dp', 2, 'house-robber', 'House Robber', 'Medium', 31),
    ],
  },

  // ── PATH 4 ──────────────────────────────────────────────────────────────────
  {
    id: 'interview-ready',
    order: 4,
    title: 'Interview Ready',
    description: 'Turn what you\'ve learned into real, consistent interview performance.',
    blocks: [
      {
        type: 'lesson',
        id: 'p4-breakdown',
        order: 1,
        title: 'Problem Breakdown Framework',
        subtitle: 'A repeatable way to tackle any problem',
        description: 'A step-by-step process you can run on any problem you\'ve never seen before. Stops you from panicking and staring at the screen.',
        skills: ['Reading the question carefully', 'Spotting the inputs and outputs', 'Understanding the constraints', 'Picking the right pattern', 'Planning before you type'],
        lessonCount: 4,
        problemCount: 5,
      },
      practice('p4-breakdown', 1, 'plus-one', 'Plus One', 'Easy', 2),
      practice('p4-breakdown', 2, 'reverse-string', 'Reverse String', 'Easy', 3),
      {
        type: 'lesson',
        id: 'p4-optimize',
        order: 4,
        title: 'From Messy to Optimal',
        subtitle: 'Start simple, then clean it up',
        description: 'Don\'t aim for perfect on the first try. Get something working, then look for what\'s slow and make it faster.',
        skills: ['Writing the obvious solution first', 'Finding the slow part', 'Making it run faster', 'Explaining your tradeoffs out loud'],
        lessonCount: 3,
        problemCount: 8,
      },
      practice('p4-optimize', 1, 'maximum-subarray', 'Maximum Subarray', 'Medium', 5),
      practice('p4-optimize', 2, 'product-of-array-except-self', 'Product of Array Except Self', 'Medium', 6),
      {
        type: 'lesson',
        id: 'p4-clean',
        order: 7,
        title: 'Writing Clean Interview Code',
        subtitle: 'Code the interviewer enjoys reading',
        description: 'Interviewers care how your code looks, not just whether it runs. Learn to write clean code even when the clock is ticking.',
        skills: ['Naming variables clearly', 'Breaking things into helper functions', 'Handling edge cases', 'Keeping code easy to read', 'Avoiding the common mistakes'],
        lessonCount: 3,
        problemCount: 5,
      },
      practice('p4-clean', 1, 'merge-two-sorted-lists', 'Merge Two Sorted Lists', 'Easy', 8),
      practice('p4-clean', 2, 'longest-common-prefix', 'Longest Common Prefix', 'Easy', 9),
      {
        type: 'lesson',
        id: 'p4-testing',
        order: 10,
        title: 'Testing and Debugging',
        subtitle: 'Checking your work before you submit',
        description: 'Before you hit submit, walk through your code yourself. Interviewers love candidates who catch their own bugs.',
        skills: ['Tracing through code by hand', 'Making your own test cases', 'Common bug patterns to watch for', 'Off-by-one mistakes', 'Empty list and single item cases'],
        lessonCount: 3,
        problemCount: 5,
      },
      practice('p4-testing', 1, 'palindrome-number', 'Palindrome Number', 'Easy', 11),
      practice('p4-testing', 2, 'happy-number', 'Happy Number', 'Easy', 12),
      {
        type: 'lesson',
        id: 'p4-easy',
        order: 13,
        title: 'Timed Easy Interviews',
        subtitle: 'Easy problems, on the clock',
        description: 'Practice with a timer. Easy problems should feel quick and smooth — this is where you build that fluency.',
        skills: ['Working against a timer', 'Recognizing patterns fast', 'Explaining as you go', 'Building real confidence'],
        lessonCount: 1,
        problemCount: 15,
      },
      practice('p4-easy', 1, 'squares-of-a-sorted-array', 'Squares of a Sorted Array', 'Easy', 14),
      practice('p4-easy', 2, 'missing-number', 'Missing Number', 'Easy', 15),
      {
        type: 'lesson',
        id: 'p4-medium',
        order: 16,
        title: 'Timed Medium Interviews',
        subtitle: 'Medium problems under pressure',
        description: 'Mediums are the real test of an interview. Practice spotting the pattern fast, even when you\'re nervous.',
        skills: ['Pacing a medium problem', 'Staying calm under pressure', 'Talking while you code', 'Handling hints gracefully'],
        lessonCount: 1,
        problemCount: 15,
      },
      practice('p4-medium', 1, 'container-with-most-water', 'Container With Most Water', 'Medium', 17),
      practice('p4-medium', 2, 'validate-binary-search-tree', 'Validate Binary Search Tree', 'Medium', 18),
      {
        type: 'lesson',
        id: 'p4-communication',
        order: 19,
        title: 'Communication and Explanation',
        subtitle: 'Thinking out loud like a pro',
        description: 'In an interview, how you explain your thinking matters as much as your code. Learn to narrate your work without freezing up.',
        skills: ['Walking through your approach', 'Explaining how fast your code is', 'Explaining how much memory it uses', 'Asking good clarifying questions'],
        lessonCount: 3,
        problemCount: 5,
      },
      practice('p4-communication', 1, 'remove-duplicates-from-sorted-array', 'Remove Duplicates from Sorted Array', 'Easy', 20),
      practice('p4-communication', 2, 'min-cost-climbing-stairs', 'Min Cost Climbing Stairs', 'Easy', 21),
      {
        type: 'lesson',
        id: 'p4-review',
        order: 22,
        title: 'Find and Fix Your Weak Spots',
        subtitle: 'Targeted practice where you need it',
        description: 'Honestly look at where you\'re still shaky, then work on exactly those spots. No wasted effort.',
        skills: ['Spotting the patterns you forget', 'Targeted re-practice', 'Reinforcing weak areas', 'Measuring your own progress'],
        lessonCount: 2,
        problemCount: 20,
      },
      practice('p4-review', 1, 'single-number', 'Single Number', 'Easy', 23),
      practice('p4-review', 2, 'middle-of-the-linked-list', 'Middle of the Linked List', 'Easy', 24),
      {
        type: 'lesson',
        id: 'p4-final',
        order: 25,
        title: 'Final Readiness Check',
        subtitle: 'The final gauntlet',
        description: 'A mixed set of problems covering every major pattern. If you can handle these, you\'re ready for the real thing.',
        skills: ['Every major pattern covered', 'A mix of difficulties', 'A timed benchmark run', 'Your final readiness score'],
        lessonCount: 1,
        problemCount: 25,
      },
      practice('p4-final', 1, 'first-bad-version', 'First Bad Version', 'Easy', 26),
      practice('p4-final', 2, 'longest-substring-without-repeating-characters', 'Longest Substring Without Repeating Characters', 'Medium', 27),
    ],
  },

  // ── PATH 5 ──────────────────────────────────────────────────────────────────
  {
    id: 'hundred-lockin',
    order: 5,
    title: 'The 100 Lock In',
    description:
      "A curated grind of 100+ problems. No lessons, no hand-holding, just the essential set of LeetCode problems every serious candidate should solve, ordered to build pattern recognition fastest. Unlocks when you finish Interview Ready.",
    blocks: [
      // Arrays & Hashing
      practice('p5-arrays-hashing', 1, 'majority-element',                   'Majority Element',                   'Easy',    1),
      practice('p5-arrays-hashing', 2, 'concatenation-of-array',             'Concatenation of Array',             'Easy',    2),
      practice('p5-arrays-hashing', 3, 'top-k-frequent-elements',            'Top K Frequent Elements',            'Medium',  3),
      practice('p5-arrays-hashing', 4, 'valid-sudoku',                       'Valid Sudoku',                       'Medium',  4),
      practice('p5-arrays-hashing', 5, 'longest-consecutive-sequence',       'Longest Consecutive Sequence',       'Medium',  5),

      // Two Pointers
      practice('p5-two-pointers',   1, 'merge-sorted-array',                 'Merge Sorted Array',                 'Easy',    6),
      practice('p5-two-pointers',   2, 'remove-element',                     'Remove Element',                     'Easy',    7),
      practice('p5-two-pointers',   3, 'two-sum-ii-input-array-is-sorted',   'Two Sum II',                         'Medium',  8),
      practice('p5-two-pointers',   4, '3sum',                               '3Sum',                               'Medium',  9),
      practice('p5-two-pointers',   5, 'sort-colors',                        'Sort Colors',                        'Medium', 10),
      practice('p5-two-pointers',   6, '4sum',                               '4Sum',                               'Medium', 11),
      practice('p5-two-pointers',   7, 'trapping-rain-water',                'Trapping Rain Water',                'Hard',   12),

      // Sliding Window
      practice('p5-sliding-window', 1, 'contains-duplicate-ii',              'Contains Duplicate II',              'Easy',   13),
      practice('p5-sliding-window', 2, 'longest-repeating-character-replacement', 'Longest Repeating Character Replacement', 'Medium', 14),
      practice('p5-sliding-window', 3, 'permutation-in-string',              'Permutation in String',              'Medium', 15),
      practice('p5-sliding-window', 4, 'find-all-anagrams-in-a-string',      'Find All Anagrams in a String',      'Medium', 16),
      practice('p5-sliding-window', 5, 'minimum-size-subarray-sum',          'Minimum Size Subarray Sum',          'Medium', 17),
      practice('p5-sliding-window', 6, 'fruit-into-baskets',                 'Fruit Into Baskets',                 'Medium', 18),
      practice('p5-sliding-window', 7, 'minimum-window-substring',           'Minimum Window Substring',           'Hard',   19),

      // Stack
      practice('p5-stack',          1, 'make-the-string-great',              'Make The String Great',              'Easy',   20),
      practice('p5-stack',          2, 'removing-stars-from-a-string',       'Removing Stars From a String',       'Easy',   21),
      practice('p5-stack',          3, 'min-stack',                          'Min Stack',                          'Medium', 22),
      practice('p5-stack',          4, 'evaluate-reverse-polish-notation',   'Evaluate Reverse Polish Notation',   'Medium', 23),
      practice('p5-stack',          5, 'daily-temperatures',                 'Daily Temperatures',                 'Medium', 24),
      practice('p5-stack',          6, 'decode-string',                      'Decode String',                      'Medium', 25),
      practice('p5-stack',          7, 'online-stock-span',                  'Online Stock Span',                  'Medium', 26),
      practice('p5-stack',          8, 'largest-rectangle-in-histogram',     'Largest Rectangle in Histogram',     'Hard',   27),

      // Binary Search
      practice('p5-binary-search',  1, 'guess-number-higher-or-lower',                          'Guess Number Higher or Lower',         'Easy',   28),
      practice('p5-binary-search',  2, 'sqrtx',                                                 'Sqrt(x)',                              'Easy',   29),
      practice('p5-binary-search',  3, 'find-minimum-in-rotated-sorted-array',                  'Find Minimum in Rotated Sorted Array', 'Medium', 30),
      practice('p5-binary-search',  4, 'search-in-rotated-sorted-array',                        'Search in Rotated Sorted Array',       'Medium', 31),
      practice('p5-binary-search',  5, 'find-first-and-last-position-of-element-in-sorted-array','Find First and Last Position',        'Medium', 32),
      practice('p5-binary-search',  6, 'koko-eating-bananas',                                   'Koko Eating Bananas',                  'Medium', 33),
      practice('p5-binary-search',  7, 'capacity-to-ship-packages-within-d-days',               'Capacity to Ship Packages',            'Medium', 34),
      practice('p5-binary-search',  8, 'median-of-two-sorted-arrays',                           'Median of Two Sorted Arrays',          'Hard',   35),

      // Linked List
      practice('p5-linked-list',    1, 'palindrome-linked-list',             'Palindrome Linked List',             'Easy',   36),
      practice('p5-linked-list',    2, 'remove-linked-list-elements',        'Remove Linked List Elements',        'Easy',   37),
      practice('p5-linked-list',    3, 'remove-duplicates-from-sorted-list', 'Remove Duplicates from Sorted List', 'Easy',   38),
      practice('p5-linked-list',    4, 'remove-nth-node-from-end-of-list',   'Remove Nth Node From End of List',   'Medium', 39),
      practice('p5-linked-list',    5, 'reorder-list',                       'Reorder List',                       'Medium', 40),
      practice('p5-linked-list',    6, 'add-two-numbers',                    'Add Two Numbers',                    'Medium', 41),
      practice('p5-linked-list',    7, 'copy-list-with-random-pointer',      'Copy List with Random Pointer',      'Medium', 42),
      practice('p5-linked-list',    8, 'reverse-nodes-in-k-group',           'Reverse Nodes in K-Group',           'Hard',   43),

      // Trees
      practice('p5-trees',          1, 'range-sum-of-bst',                                         'Range Sum of BST',                    'Easy',   44),
      practice('p5-trees',          2, 'binary-tree-paths',                                        'Binary Tree Paths',                   'Easy',   45),
      practice('p5-trees',          3, 'subtree-of-another-tree',                                  'Subtree of Another Tree',             'Easy',   46),
      practice('p5-trees',          4, 'lowest-common-ancestor-of-a-binary-search-tree',           'LCA of a BST',                        'Medium', 47),
      practice('p5-trees',          5, 'binary-tree-level-order-traversal',                        'Binary Tree Level Order Traversal',   'Medium', 48),
      practice('p5-trees',          6, 'construct-binary-tree-from-preorder-and-inorder-traversal','Construct Tree from Preorder/Inorder','Medium', 49),
      practice('p5-trees',          7, 'binary-tree-maximum-path-sum',                             'Binary Tree Maximum Path Sum',        'Hard',   50),

      // Tries
      practice('p5-tries',          1, 'implement-trie-prefix-tree',                 'Implement Trie (Prefix Tree)',  'Medium', 51),
      practice('p5-tries',          2, 'design-add-and-search-words-data-structure', 'Design Add and Search Words',   'Medium', 52),
      practice('p5-tries',          3, 'search-suggestions-system',                  'Search Suggestions System',     'Medium', 53),
      practice('p5-tries',          4, 'word-search-ii',                             'Word Search II',                'Hard',   54),

      // Heap / Priority Queue
      practice('p5-heap',           1, 'relative-ranks',                              'Relative Ranks',                  'Easy',   55),
      practice('p5-heap',           2, 'kth-largest-element-in-an-array',             'Kth Largest Element in an Array', 'Medium', 56),
      practice('p5-heap',           3, 'top-k-frequent-words',                        'Top K Frequent Words',            'Medium', 57),
      practice('p5-heap',           4, 'task-scheduler',                              'Task Scheduler',                  'Medium', 58),
      practice('p5-heap',           5, 'reorganize-string',                           'Reorganize String',               'Medium', 59),
      practice('p5-heap',           6, 'kth-smallest-element-in-a-sorted-matrix',     'Kth Smallest in a Sorted Matrix', 'Medium', 60),
      practice('p5-heap',           7, 'find-median-from-data-stream',                'Find Median from Data Stream',    'Hard',   61),

      // Backtracking
      practice('p5-backtracking',   1, 'subsets',                               'Subsets',                                'Medium', 62),
      practice('p5-backtracking',   2, 'combination-sum',                       'Combination Sum',                        'Medium', 63),
      practice('p5-backtracking',   3, 'permutations',                          'Permutations',                           'Medium', 64),
      practice('p5-backtracking',   4, 'subsets-ii',                            'Subsets II',                             'Medium', 65),
      practice('p5-backtracking',   5, 'combination-sum-ii',                    'Combination Sum II',                     'Medium', 66),
      practice('p5-backtracking',   6, 'letter-combinations-of-a-phone-number', 'Letter Combinations of a Phone Number',  'Medium', 67),
      practice('p5-backtracking',   7, 'word-search',                           'Word Search',                            'Medium', 68),

      // Graphs
      practice('p5-graphs',         1, 'find-if-path-exists-in-graph',          'Find if Path Exists in Graph',    'Easy',   69),
      practice('p5-graphs',         2, 'find-the-town-judge',                   'Find the Town Judge',             'Easy',   70),
      practice('p5-graphs',         3, 'max-area-of-island',                    'Max Area of Island',              'Medium', 71),
      practice('p5-graphs',         4, 'clone-graph',                           'Clone Graph',                     'Medium', 72),
      practice('p5-graphs',         5, 'number-of-provinces',                   'Number of Provinces',             'Medium', 73),
      practice('p5-graphs',         6, 'pacific-atlantic-water-flow',           'Pacific Atlantic Water Flow',     'Medium', 74),
      practice('p5-graphs',         7, 'surrounded-regions',                    'Surrounded Regions',              'Medium', 75),
      practice('p5-graphs',         8, 'shortest-path-in-binary-matrix',        'Shortest Path in Binary Matrix',  'Medium', 76),

      // Advanced Graphs
      practice('p5-advanced-graphs',1, 'course-schedule',                                         'Course Schedule',              'Medium', 77),
      practice('p5-advanced-graphs',2, 'course-schedule-ii',                                      'Course Schedule II',           'Medium', 78),
      practice('p5-advanced-graphs',3, 'number-of-connected-components-in-an-undirected-graph',   'Connected Components',         'Medium', 79),
      practice('p5-advanced-graphs',4, 'min-cost-to-connect-all-points',                          'Min Cost to Connect Points',   'Medium', 80),
      practice('p5-advanced-graphs',5, 'network-delay-time',                                      'Network Delay Time',           'Medium', 81),
      practice('p5-advanced-graphs',6, 'alien-dictionary',                                        'Alien Dictionary',             'Hard',   82),

      // 1-D DP
      practice('p5-dp-1d',          1, 'n-th-tribonacci-number',         'N-th Tribonacci Number',        'Easy',   83),
      practice('p5-dp-1d',          2, 'pascals-triangle',               "Pascal's Triangle",             'Easy',   84),
      practice('p5-dp-1d',          3, 'house-robber-ii',                'House Robber II',               'Medium', 85),
      practice('p5-dp-1d',          4, 'decode-ways',                    'Decode Ways',                   'Medium', 86),
      practice('p5-dp-1d',          5, 'coin-change',                    'Coin Change',                   'Medium', 87),
      practice('p5-dp-1d',          6, 'maximum-product-subarray',       'Maximum Product Subarray',      'Medium', 88),
      practice('p5-dp-1d',          7, 'word-break',                     'Word Break',                    'Medium', 89),
      practice('p5-dp-1d',          8, 'longest-increasing-subsequence', 'Longest Increasing Subsequence','Medium', 90),
      practice('p5-dp-1d',          9, 'perfect-squares',                'Perfect Squares',               'Medium', 91),

      // 2-D DP
      practice('p5-dp-2d',          1, 'is-subsequence',               'Is Subsequence',               'Easy',   92),
      practice('p5-dp-2d',          2, 'unique-paths',                 'Unique Paths',                 'Medium', 93),
      practice('p5-dp-2d',          3, 'longest-common-subsequence',   'Longest Common Subsequence',   'Medium', 94),
      practice('p5-dp-2d',          4, 'target-sum',                   'Target Sum',                   'Medium', 95),
      practice('p5-dp-2d',          5, 'coin-change-ii',               'Coin Change II',               'Medium', 96),
      practice('p5-dp-2d',          6, 'partition-equal-subset-sum',   'Partition Equal Subset Sum',   'Medium', 97),
      practice('p5-dp-2d',          7, 'edit-distance',                'Edit Distance',                'Medium', 98),
      practice('p5-dp-2d',          8, 'regular-expression-matching',  'Regular Expression Matching',  'Hard',   99),

      // Greedy
      practice('p5-greedy',         1, 'assign-cookies',           'Assign Cookies',           'Easy',   100),
      practice('p5-greedy',         2, 'lemonade-change',          'Lemonade Change',          'Easy',   101),
      practice('p5-greedy',         3, 'can-place-flowers',        'Can Place Flowers',        'Easy',   102),
      practice('p5-greedy',         4, 'jump-game',                'Jump Game',                'Medium', 103),
      practice('p5-greedy',         5, 'jump-game-ii',             'Jump Game II',             'Medium', 104),
      practice('p5-greedy',         6, 'gas-station',              'Gas Station',              'Medium', 105),
      practice('p5-greedy',         7, 'partition-labels',         'Partition Labels',         'Medium', 106),
      practice('p5-greedy',         8, 'valid-parenthesis-string', 'Valid Parenthesis String', 'Medium', 107),

      // Intervals
      practice('p5-intervals',      1, 'meeting-rooms',             'Meeting Rooms',             'Easy',   108),
      practice('p5-intervals',      2, 'summary-ranges',            'Summary Ranges',            'Easy',   109),
      practice('p5-intervals',      3, 'insert-interval',           'Insert Interval',           'Medium', 110),
      practice('p5-intervals',      4, 'merge-intervals',           'Merge Intervals',           'Medium', 111),
      practice('p5-intervals',      5, 'non-overlapping-intervals', 'Non-overlapping Intervals', 'Medium', 112),
      practice('p5-intervals',      6, 'meeting-rooms-ii',          'Meeting Rooms II',          'Medium', 113),

      // Math & Geometry
      practice('p5-math',           1, 'fizz-buzz',         'Fizz Buzz',         'Easy',   114),
      practice('p5-math',           2, 'add-digits',        'Add Digits',        'Easy',   115),
      practice('p5-math',           3, 'ugly-number',       'Ugly Number',       'Easy',   116),
      practice('p5-math',           4, 'rotate-image',      'Rotate Image',      'Medium', 117),
      practice('p5-math',           5, 'spiral-matrix',     'Spiral Matrix',     'Medium', 118),
      practice('p5-math',           6, 'set-matrix-zeroes', 'Set Matrix Zeroes', 'Medium', 119),
      practice('p5-math',           7, 'multiply-strings',  'Multiply Strings',  'Medium', 120),

      // Bit Manipulation
      practice('p5-bit',            1, 'hamming-distance',    'Hamming Distance',    'Easy',   121),
      practice('p5-bit',            2, 'number-of-1-bits',    'Number of 1 Bits',    'Easy',   122),
      practice('p5-bit',            3, 'counting-bits',       'Counting Bits',       'Easy',   123),
      practice('p5-bit',            4, 'reverse-bits',        'Reverse Bits',        'Easy',   124),
      practice('p5-bit',            5, 'sum-of-two-integers', 'Sum of Two Integers', 'Medium', 125),
    ],
  },
];
