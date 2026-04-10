// ─── Library — NeetCode 150–style problem catalogue ──────────────────────────
//
// 18 categories, 12 problems each (Tries has 10). Slugs match LeetCode URL
// slugs where possible so `/solve?problem=<slug>` can deep-link.
//
// Note: a handful of problems appear in multiple categories by design
// (e.g. "Top K Frequent Elements" in both Arrays & Hashing and Heap,
// "Best Time to Buy and Sell Stock" in both Sliding Window and Greedy).
// They share a slug so marking solved in one category marks the other.

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ProblemDef {
  slug: string;
  number: number;
  title: string;
  difficulty: Difficulty;
  pattern: string;
  leetcodeUrl: string;
}

export interface CategoryDef {
  id: string;
  order: number;
  title: string;
  description: string;
  problems: ProblemDef[];
}

const lc = (slug: string) => `https://leetcode.com/problems/${slug}/`;

export const LIBRARY: CategoryDef[] = [
  {
    id: 'arrays-hashing',
    order: 1,
    title: 'Arrays & Hashing',
    description: 'Direct map/set counting first, then prefix tricks and harder pattern recognition.',
    problems: [
      { slug: 'contains-duplicate',                     number: 217,  title: 'Contains Duplicate',                     difficulty: 'Easy',   pattern: 'Hash Set',      leetcodeUrl: lc('contains-duplicate') },
      { slug: 'valid-anagram',                          number: 242,  title: 'Valid Anagram',                          difficulty: 'Easy',   pattern: 'Hash Map',      leetcodeUrl: lc('valid-anagram') },
      { slug: 'two-sum',                                number: 1,    title: 'Two Sum',                                difficulty: 'Easy',   pattern: 'Hash Map',      leetcodeUrl: lc('two-sum') },
      { slug: 'intersection-of-two-arrays',             number: 349,  title: 'Intersection of Two Arrays',             difficulty: 'Easy',   pattern: 'Hash Set',      leetcodeUrl: lc('intersection-of-two-arrays') },
      { slug: 'find-all-numbers-disappeared-in-an-array', number: 448, title: 'Find All Numbers Disappeared in an Array', difficulty: 'Easy', pattern: 'Cyclic Sort',   leetcodeUrl: lc('find-all-numbers-disappeared-in-an-array') },
      { slug: 'unique-number-of-occurrences',           number: 1207, title: 'Unique Number of Occurrences',           difficulty: 'Easy',   pattern: 'Hash Map',      leetcodeUrl: lc('unique-number-of-occurrences') },
      { slug: 'group-anagrams',                         number: 49,   title: 'Group Anagrams',                         difficulty: 'Medium', pattern: 'Hash Map',      leetcodeUrl: lc('group-anagrams') },
      { slug: 'top-k-frequent-elements',                number: 347,  title: 'Top K Frequent Elements',                difficulty: 'Medium', pattern: 'Bucket Sort',   leetcodeUrl: lc('top-k-frequent-elements') },
      { slug: 'valid-sudoku',                           number: 36,   title: 'Valid Sudoku',                           difficulty: 'Medium', pattern: 'Hash Set',      leetcodeUrl: lc('valid-sudoku') },
      { slug: 'product-of-array-except-self',           number: 238,  title: 'Product of Array Except Self',           difficulty: 'Medium', pattern: 'Prefix Product',leetcodeUrl: lc('product-of-array-except-self') },
      { slug: 'subarray-sum-equals-k',                  number: 560,  title: 'Subarray Sum Equals K',                  difficulty: 'Medium', pattern: 'Prefix Sum',    leetcodeUrl: lc('subarray-sum-equals-k') },
      { slug: 'longest-consecutive-sequence',           number: 128,  title: 'Longest Consecutive Sequence',           difficulty: 'Medium', pattern: 'Hash Set',      leetcodeUrl: lc('longest-consecutive-sequence') },
    ],
  },

  {
    id: 'two-pointers',
    order: 2,
    title: 'Two Pointers',
    description: 'Simple inward pointers first, then partitioning and cycle-style reasoning.',
    problems: [
      { slug: 'valid-palindrome',                    number: 125, title: 'Valid Palindrome',                    difficulty: 'Easy',   pattern: 'Two Pointers', leetcodeUrl: lc('valid-palindrome') },
      { slug: 'reverse-string',                      number: 344, title: 'Reverse String',                      difficulty: 'Easy',   pattern: 'Two Pointers', leetcodeUrl: lc('reverse-string') },
      { slug: 'remove-duplicates-from-sorted-array', number: 26,  title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy',   pattern: 'Two Pointers', leetcodeUrl: lc('remove-duplicates-from-sorted-array') },
      { slug: 'move-zeroes',                         number: 283, title: 'Move Zeroes',                         difficulty: 'Easy',   pattern: 'Two Pointers', leetcodeUrl: lc('move-zeroes') },
      { slug: 'squares-of-a-sorted-array',           number: 977, title: 'Squares of a Sorted Array',           difficulty: 'Easy',   pattern: 'Two Pointers', leetcodeUrl: lc('squares-of-a-sorted-array') },
      { slug: 'two-sum-ii-input-array-is-sorted',    number: 167, title: 'Two Sum II, Input Array Is Sorted',   difficulty: 'Medium', pattern: 'Two Pointers', leetcodeUrl: lc('two-sum-ii-input-array-is-sorted') },
      { slug: 'container-with-most-water',           number: 11,  title: 'Container With Most Water',           difficulty: 'Medium', pattern: 'Two Pointers', leetcodeUrl: lc('container-with-most-water') },
      { slug: '3sum',                                number: 15,  title: '3Sum',                                difficulty: 'Medium', pattern: 'Two Pointers', leetcodeUrl: lc('3sum') },
      { slug: '4sum',                                number: 18,  title: '4Sum',                                difficulty: 'Medium', pattern: 'Two Pointers', leetcodeUrl: lc('4sum') },
      { slug: 'sort-colors',                         number: 75,  title: 'Sort Colors',                         difficulty: 'Medium', pattern: 'Dutch Flag',   leetcodeUrl: lc('sort-colors') },
      { slug: 'trapping-rain-water',                 number: 42,  title: 'Trapping Rain Water',                 difficulty: 'Hard',   pattern: 'Two Pointers', leetcodeUrl: lc('trapping-rain-water') },
      { slug: 'boats-to-save-people',                number: 881, title: 'Boats to Save People',                difficulty: 'Medium', pattern: 'Two Pointers', leetcodeUrl: lc('boats-to-save-people') },
    ],
  },

  {
    id: 'sliding-window',
    order: 3,
    title: 'Sliding Window',
    description: 'Progression from fixed windows to variable windows to frequency-map windows.',
    problems: [
      { slug: 'maximum-average-subarray-i',                              number: 643,  title: 'Maximum Average Subarray I',                              difficulty: 'Easy',   pattern: 'Fixed Window',     leetcodeUrl: lc('maximum-average-subarray-i') },
      { slug: 'best-time-to-buy-and-sell-stock',                         number: 121,  title: 'Best Time to Buy and Sell Stock',                         difficulty: 'Easy',   pattern: 'Sliding Window',   leetcodeUrl: lc('best-time-to-buy-and-sell-stock') },
      { slug: 'contains-duplicate-ii',                                   number: 219,  title: 'Contains Duplicate II',                                   difficulty: 'Easy',   pattern: 'Hash Map',         leetcodeUrl: lc('contains-duplicate-ii') },
      { slug: 'longest-substring-without-repeating-characters',          number: 3,    title: 'Longest Substring Without Repeating Characters',          difficulty: 'Medium', pattern: 'Variable Window',  leetcodeUrl: lc('longest-substring-without-repeating-characters') },
      { slug: 'minimum-size-subarray-sum',                               number: 209,  title: 'Minimum Size Subarray Sum',                               difficulty: 'Medium', pattern: 'Variable Window',  leetcodeUrl: lc('minimum-size-subarray-sum') },
      { slug: 'maximum-number-of-vowels-in-a-substring-of-given-length', number: 1456, title: 'Maximum Number of Vowels in a Substring of Given Length', difficulty: 'Medium', pattern: 'Fixed Window',     leetcodeUrl: lc('maximum-number-of-vowels-in-a-substring-of-given-length') },
      { slug: 'permutation-in-string',                                   number: 567,  title: 'Permutation in String',                                   difficulty: 'Medium', pattern: 'Frequency Map',    leetcodeUrl: lc('permutation-in-string') },
      { slug: 'find-all-anagrams-in-a-string',                           number: 438,  title: 'Find All Anagrams in a String',                           difficulty: 'Medium', pattern: 'Frequency Map',    leetcodeUrl: lc('find-all-anagrams-in-a-string') },
      { slug: 'longest-repeating-character-replacement',                 number: 424,  title: 'Longest Repeating Character Replacement',                 difficulty: 'Medium', pattern: 'Variable Window',  leetcodeUrl: lc('longest-repeating-character-replacement') },
      { slug: 'subarray-product-less-than-k',                            number: 713,  title: 'Subarray Product Less Than K',                            difficulty: 'Medium', pattern: 'Variable Window',  leetcodeUrl: lc('subarray-product-less-than-k') },
      { slug: 'fruit-into-baskets',                                      number: 904,  title: 'Fruit Into Baskets',                                      difficulty: 'Medium', pattern: 'Variable Window',  leetcodeUrl: lc('fruit-into-baskets') },
      { slug: 'minimum-window-substring',                                number: 76,   title: 'Minimum Window Substring',                                difficulty: 'Hard',   pattern: 'Frequency Map',    leetcodeUrl: lc('minimum-window-substring') },
    ],
  },

  {
    id: 'stack',
    order: 4,
    title: 'Stack',
    description: 'Standard stack, monotonic stack, and expression evaluation.',
    problems: [
      { slug: 'valid-parentheses',                       number: 20,   title: 'Valid Parentheses',                       difficulty: 'Easy',   pattern: 'Stack',            leetcodeUrl: lc('valid-parentheses') },
      { slug: 'remove-all-adjacent-duplicates-in-string',number: 1047, title: 'Remove All Adjacent Duplicates In String',difficulty: 'Easy',   pattern: 'Stack',            leetcodeUrl: lc('remove-all-adjacent-duplicates-in-string') },
      { slug: 'baseball-game',                           number: 682,  title: 'Baseball Game',                           difficulty: 'Easy',   pattern: 'Stack',            leetcodeUrl: lc('baseball-game') },
      { slug: 'implement-queue-using-stacks',            number: 232,  title: 'Implement Queue using Stacks',            difficulty: 'Easy',   pattern: 'Design',           leetcodeUrl: lc('implement-queue-using-stacks') },
      { slug: 'backspace-string-compare',                number: 844,  title: 'Backspace String Compare',                difficulty: 'Easy',   pattern: 'Stack',            leetcodeUrl: lc('backspace-string-compare') },
      { slug: 'evaluate-reverse-polish-notation',        number: 150,  title: 'Evaluate Reverse Polish Notation',        difficulty: 'Medium', pattern: 'Stack',            leetcodeUrl: lc('evaluate-reverse-polish-notation') },
      { slug: 'min-stack',                               number: 155,  title: 'Min Stack',                               difficulty: 'Medium', pattern: 'Design',           leetcodeUrl: lc('min-stack') },
      { slug: 'daily-temperatures',                      number: 739,  title: 'Daily Temperatures',                      difficulty: 'Medium', pattern: 'Monotonic Stack',  leetcodeUrl: lc('daily-temperatures') },
      { slug: 'online-stock-span',                       number: 901,  title: 'Online Stock Span',                       difficulty: 'Medium', pattern: 'Monotonic Stack',  leetcodeUrl: lc('online-stock-span') },
      { slug: 'remove-k-digits',                         number: 402,  title: 'Remove K Digits',                         difficulty: 'Medium', pattern: 'Monotonic Stack',  leetcodeUrl: lc('remove-k-digits') },
      { slug: 'decode-string',                           number: 394,  title: 'Decode String',                           difficulty: 'Medium', pattern: 'Stack',            leetcodeUrl: lc('decode-string') },
      { slug: 'largest-rectangle-in-histogram',          number: 84,   title: 'Largest Rectangle in Histogram',          difficulty: 'Hard',   pattern: 'Monotonic Stack',  leetcodeUrl: lc('largest-rectangle-in-histogram') },
    ],
  },

  {
    id: 'binary-search',
    order: 5,
    title: 'Binary Search',
    description: 'Classic index search and answer-space search.',
    problems: [
      { slug: 'binary-search',                                       number: 704,  title: 'Binary Search',                                       difficulty: 'Easy',   pattern: 'Binary Search', leetcodeUrl: lc('binary-search') },
      { slug: 'search-insert-position',                              number: 35,   title: 'Search Insert Position',                              difficulty: 'Easy',   pattern: 'Binary Search', leetcodeUrl: lc('search-insert-position') },
      { slug: 'first-bad-version',                                   number: 278,  title: 'First Bad Version',                                   difficulty: 'Easy',   pattern: 'Binary Search', leetcodeUrl: lc('first-bad-version') },
      { slug: 'sqrtx',                                               number: 69,   title: 'Sqrt(x)',                                             difficulty: 'Easy',   pattern: 'Binary Search', leetcodeUrl: lc('sqrtx') },
      { slug: 'guess-number-higher-or-lower',                        number: 374,  title: 'Guess Number Higher or Lower',                        difficulty: 'Easy',   pattern: 'Binary Search', leetcodeUrl: lc('guess-number-higher-or-lower') },
      { slug: 'find-first-and-last-position-of-element-in-sorted-array', number: 34, title: 'Find First and Last Position of Element in Sorted Array', difficulty: 'Medium', pattern: 'Binary Search', leetcodeUrl: lc('find-first-and-last-position-of-element-in-sorted-array') },
      { slug: 'search-in-rotated-sorted-array',                      number: 33,   title: 'Search in Rotated Sorted Array',                      difficulty: 'Medium', pattern: 'Binary Search', leetcodeUrl: lc('search-in-rotated-sorted-array') },
      { slug: 'find-minimum-in-rotated-sorted-array',                number: 153,  title: 'Find Minimum in Rotated Sorted Array',                difficulty: 'Medium', pattern: 'Binary Search', leetcodeUrl: lc('find-minimum-in-rotated-sorted-array') },
      { slug: 'koko-eating-bananas',                                 number: 875,  title: 'Koko Eating Bananas',                                 difficulty: 'Medium', pattern: 'Answer Space',  leetcodeUrl: lc('koko-eating-bananas') },
      { slug: 'capacity-to-ship-packages-within-d-days',             number: 1011, title: 'Capacity To Ship Packages Within D Days',             difficulty: 'Medium', pattern: 'Answer Space',  leetcodeUrl: lc('capacity-to-ship-packages-within-d-days') },
      { slug: 'split-array-largest-sum',                             number: 410,  title: 'Split Array Largest Sum',                             difficulty: 'Hard',   pattern: 'Answer Space',  leetcodeUrl: lc('split-array-largest-sum') },
      { slug: 'median-of-two-sorted-arrays',                         number: 4,    title: 'Median of Two Sorted Arrays',                         difficulty: 'Hard',   pattern: 'Binary Search', leetcodeUrl: lc('median-of-two-sorted-arrays') },
    ],
  },

  {
    id: 'linked-list',
    order: 6,
    title: 'Linked List',
    description: 'Traversal, reversal, slow/fast, merge, and pointer rewiring.',
    problems: [
      { slug: 'reverse-linked-list',              number: 206, title: 'Reverse Linked List',              difficulty: 'Easy',   pattern: 'Pointer Rewiring', leetcodeUrl: lc('reverse-linked-list') },
      { slug: 'remove-duplicates-from-sorted-list', number: 83, title: 'Remove Duplicates from Sorted List', difficulty: 'Easy', pattern: 'Traversal',        leetcodeUrl: lc('remove-duplicates-from-sorted-list') },
      { slug: 'merge-two-sorted-lists',           number: 21,  title: 'Merge Two Sorted Lists',           difficulty: 'Easy',   pattern: 'Merge',            leetcodeUrl: lc('merge-two-sorted-lists') },
      { slug: 'remove-linked-list-elements',      number: 203, title: 'Remove Linked List Elements',      difficulty: 'Easy',   pattern: 'Traversal',        leetcodeUrl: lc('remove-linked-list-elements') },
      { slug: 'linked-list-cycle',                number: 141, title: 'Linked List Cycle',                difficulty: 'Easy',   pattern: 'Fast / Slow',      leetcodeUrl: lc('linked-list-cycle') },
      { slug: 'middle-of-the-linked-list',        number: 876, title: 'Middle of the Linked List',        difficulty: 'Easy',   pattern: 'Fast / Slow',      leetcodeUrl: lc('middle-of-the-linked-list') },
      { slug: 'remove-nth-node-from-end-of-list', number: 19,  title: 'Remove Nth Node From End of List', difficulty: 'Medium', pattern: 'Two Pointers',     leetcodeUrl: lc('remove-nth-node-from-end-of-list') },
      { slug: 'palindrome-linked-list',           number: 234, title: 'Palindrome Linked List',           difficulty: 'Easy',   pattern: 'Fast / Slow',      leetcodeUrl: lc('palindrome-linked-list') },
      { slug: 'reorder-list',                     number: 143, title: 'Reorder List',                     difficulty: 'Medium', pattern: 'Fast / Slow',      leetcodeUrl: lc('reorder-list') },
      { slug: 'add-two-numbers',                  number: 2,   title: 'Add Two Numbers',                  difficulty: 'Medium', pattern: 'Math',             leetcodeUrl: lc('add-two-numbers') },
      { slug: 'copy-list-with-random-pointer',    number: 138, title: 'Copy List with Random Pointer',    difficulty: 'Medium', pattern: 'Hash Map',         leetcodeUrl: lc('copy-list-with-random-pointer') },
      { slug: 'reverse-nodes-in-k-group',         number: 25,  title: 'Reverse Nodes in k-Group',         difficulty: 'Hard',   pattern: 'Recursion',        leetcodeUrl: lc('reverse-nodes-in-k-group') },
    ],
  },

  {
    id: 'trees',
    order: 7,
    title: 'Trees',
    description: 'Traversals and depth first, then BST logic, construction, and path problems.',
    problems: [
      { slug: 'maximum-depth-of-binary-tree',                           number: 104, title: 'Maximum Depth of Binary Tree',                           difficulty: 'Easy',   pattern: 'DFS',          leetcodeUrl: lc('maximum-depth-of-binary-tree') },
      { slug: 'same-tree',                                              number: 100, title: 'Same Tree',                                              difficulty: 'Easy',   pattern: 'DFS',          leetcodeUrl: lc('same-tree') },
      { slug: 'invert-binary-tree',                                     number: 226, title: 'Invert Binary Tree',                                     difficulty: 'Easy',   pattern: 'DFS',          leetcodeUrl: lc('invert-binary-tree') },
      { slug: 'symmetric-tree',                                         number: 101, title: 'Symmetric Tree',                                         difficulty: 'Easy',   pattern: 'DFS',          leetcodeUrl: lc('symmetric-tree') },
      { slug: 'diameter-of-binary-tree',                                number: 543, title: 'Diameter of Binary Tree',                                difficulty: 'Easy',   pattern: 'DFS',          leetcodeUrl: lc('diameter-of-binary-tree') },
      { slug: 'balanced-binary-tree',                                   number: 110, title: 'Balanced Binary Tree',                                   difficulty: 'Easy',   pattern: 'DFS',          leetcodeUrl: lc('balanced-binary-tree') },
      { slug: 'subtree-of-another-tree',                                number: 572, title: 'Subtree of Another Tree',                                difficulty: 'Easy',   pattern: 'DFS',          leetcodeUrl: lc('subtree-of-another-tree') },
      { slug: 'validate-binary-search-tree',                            number: 98,  title: 'Validate Binary Search Tree',                            difficulty: 'Medium', pattern: 'BST',          leetcodeUrl: lc('validate-binary-search-tree') },
      { slug: 'lowest-common-ancestor-of-a-binary-search-tree',         number: 235, title: 'Lowest Common Ancestor of a Binary Search Tree',         difficulty: 'Medium', pattern: 'BST',          leetcodeUrl: lc('lowest-common-ancestor-of-a-binary-search-tree') },
      { slug: 'binary-tree-level-order-traversal',                      number: 102, title: 'Binary Tree Level Order Traversal',                      difficulty: 'Medium', pattern: 'BFS',          leetcodeUrl: lc('binary-tree-level-order-traversal') },
      { slug: 'construct-binary-tree-from-preorder-and-inorder-traversal', number: 105, title: 'Construct Binary Tree from Preorder and Inorder Traversal', difficulty: 'Medium', pattern: 'Construction', leetcodeUrl: lc('construct-binary-tree-from-preorder-and-inorder-traversal') },
      { slug: 'binary-tree-maximum-path-sum',                           number: 124, title: 'Binary Tree Maximum Path Sum',                           difficulty: 'Hard',   pattern: 'DFS',          leetcodeUrl: lc('binary-tree-maximum-path-sum') },
    ],
  },

  {
    id: 'tries',
    order: 8,
    title: 'Tries',
    description: 'Prefix trees — tighter category focused on high-signal string lookups.',
    problems: [
      { slug: 'longest-common-prefix',                  number: 14,   title: 'Longest Common Prefix',                  difficulty: 'Easy',   pattern: 'String',              leetcodeUrl: lc('longest-common-prefix') },
      { slug: 'implement-trie-prefix-tree',             number: 208,  title: 'Implement Trie (Prefix Tree)',           difficulty: 'Medium', pattern: 'Design',              leetcodeUrl: lc('implement-trie-prefix-tree') },
      { slug: 'design-add-and-search-words-data-structure', number: 211, title: 'Design Add and Search Words Data Structure', difficulty: 'Medium', pattern: 'Design',         leetcodeUrl: lc('design-add-and-search-words-data-structure') },
      { slug: 'replace-words',                          number: 648,  title: 'Replace Words',                          difficulty: 'Medium', pattern: 'Trie',                leetcodeUrl: lc('replace-words') },
      { slug: 'map-sum-pairs',                          number: 677,  title: 'Map Sum Pairs',                          difficulty: 'Medium', pattern: 'Trie',                leetcodeUrl: lc('map-sum-pairs') },
      { slug: 'longest-word-in-dictionary',             number: 720,  title: 'Longest Word in Dictionary',             difficulty: 'Medium', pattern: 'Trie',                leetcodeUrl: lc('longest-word-in-dictionary') },
      { slug: 'short-encoding-of-words',                number: 820,  title: 'Short Encoding of Words',                difficulty: 'Medium', pattern: 'Trie',                leetcodeUrl: lc('short-encoding-of-words') },
      { slug: 'search-suggestions-system',              number: 1268, title: 'Search Suggestions System',              difficulty: 'Medium', pattern: 'Trie',                leetcodeUrl: lc('search-suggestions-system') },
      { slug: 'maximum-xor-of-two-numbers-in-an-array', number: 421,  title: 'Maximum XOR of Two Numbers in an Array', difficulty: 'Medium', pattern: 'Bit Trie',            leetcodeUrl: lc('maximum-xor-of-two-numbers-in-an-array') },
      { slug: 'word-search-ii',                         number: 212,  title: 'Word Search II',                         difficulty: 'Hard',   pattern: 'Trie + Backtracking', leetcodeUrl: lc('word-search-ii') },
    ],
  },

  {
    id: 'heap-priority-queue',
    order: 9,
    title: 'Heap / Priority Queue',
    description: 'Top-k, streaming, scheduling, and greedy-with-heap.',
    problems: [
      { slug: 'kth-largest-element-in-a-stream',   number: 703,  title: 'Kth Largest Element in a Stream',   difficulty: 'Easy',   pattern: 'Min Heap',        leetcodeUrl: lc('kth-largest-element-in-a-stream') },
      { slug: 'last-stone-weight',                 number: 1046, title: 'Last Stone Weight',                 difficulty: 'Easy',   pattern: 'Max Heap',        leetcodeUrl: lc('last-stone-weight') },
      { slug: 'kth-largest-element-in-an-array',   number: 215,  title: 'Kth Largest Element in an Array',   difficulty: 'Medium', pattern: 'Heap',            leetcodeUrl: lc('kth-largest-element-in-an-array') },
      { slug: 'k-closest-points-to-origin',        number: 973,  title: 'K Closest Points to Origin',        difficulty: 'Medium', pattern: 'Heap',            leetcodeUrl: lc('k-closest-points-to-origin') },
      { slug: 'top-k-frequent-elements',           number: 347,  title: 'Top K Frequent Elements',           difficulty: 'Medium', pattern: 'Heap',            leetcodeUrl: lc('top-k-frequent-elements') },
      { slug: 'top-k-frequent-words',              number: 692,  title: 'Top K Frequent Words',              difficulty: 'Medium', pattern: 'Heap',            leetcodeUrl: lc('top-k-frequent-words') },
      { slug: 'kth-smallest-element-in-a-sorted-matrix', number: 378, title: 'Kth Smallest Element in a Sorted Matrix', difficulty: 'Medium', pattern: 'Heap',    leetcodeUrl: lc('kth-smallest-element-in-a-sorted-matrix') },
      { slug: 'task-scheduler',                    number: 621,  title: 'Task Scheduler',                    difficulty: 'Medium', pattern: 'Greedy + Heap',   leetcodeUrl: lc('task-scheduler') },
      { slug: 'reorganize-string',                 number: 767,  title: 'Reorganize String',                 difficulty: 'Medium', pattern: 'Greedy + Heap',   leetcodeUrl: lc('reorganize-string') },
      { slug: 'find-median-from-data-stream',      number: 295,  title: 'Find Median from Data Stream',      difficulty: 'Hard',   pattern: 'Two Heaps',       leetcodeUrl: lc('find-median-from-data-stream') },
      { slug: 'find-k-pairs-with-smallest-sums',   number: 373,  title: 'Find K Pairs with Smallest Sums',   difficulty: 'Medium', pattern: 'Heap',            leetcodeUrl: lc('find-k-pairs-with-smallest-sums') },
      { slug: 'ipo',                               number: 502,  title: 'IPO',                               difficulty: 'Hard',   pattern: 'Greedy + Heap',   leetcodeUrl: lc('ipo') },
    ],
  },

  {
    id: 'backtracking',
    order: 10,
    title: 'Backtracking',
    description: 'Generation patterns first, then constraints and board search.',
    problems: [
      { slug: 'subsets',                             number: 78,  title: 'Subsets',                             difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('subsets') },
      { slug: 'subsets-ii',                          number: 90,  title: 'Subsets II',                          difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('subsets-ii') },
      { slug: 'permutations',                        number: 46,  title: 'Permutations',                        difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('permutations') },
      { slug: 'permutations-ii',                     number: 47,  title: 'Permutations II',                     difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('permutations-ii') },
      { slug: 'combinations',                        number: 77,  title: 'Combinations',                        difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('combinations') },
      { slug: 'combination-sum',                     number: 39,  title: 'Combination Sum',                     difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('combination-sum') },
      { slug: 'combination-sum-ii',                  number: 40,  title: 'Combination Sum II',                  difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('combination-sum-ii') },
      { slug: 'palindrome-partitioning',             number: 131, title: 'Palindrome Partitioning',             difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('palindrome-partitioning') },
      { slug: 'letter-combinations-of-a-phone-number', number: 17, title: 'Letter Combinations of a Phone Number', difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('letter-combinations-of-a-phone-number') },
      { slug: 'word-search',                         number: 79,  title: 'Word Search',                         difficulty: 'Medium', pattern: 'Backtracking', leetcodeUrl: lc('word-search') },
      { slug: 'n-queens',                            number: 51,  title: 'N-Queens',                            difficulty: 'Hard',   pattern: 'Backtracking', leetcodeUrl: lc('n-queens') },
      { slug: 'sudoku-solver',                       number: 37,  title: 'Sudoku Solver',                       difficulty: 'Hard',   pattern: 'Backtracking', leetcodeUrl: lc('sudoku-solver') },
    ],
  },

  {
    id: 'graphs',
    order: 11,
    title: 'Graphs',
    description: 'BFS, DFS, flood fill, and connected-component thinking.',
    problems: [
      { slug: 'flood-fill',                    number: 733,  title: 'Flood Fill',                    difficulty: 'Easy',   pattern: 'DFS / BFS',  leetcodeUrl: lc('flood-fill') },
      { slug: 'number-of-islands',             number: 200,  title: 'Number of Islands',             difficulty: 'Medium', pattern: 'DFS / BFS',  leetcodeUrl: lc('number-of-islands') },
      { slug: 'max-area-of-island',            number: 695,  title: 'Max Area of Island',            difficulty: 'Medium', pattern: 'DFS',        leetcodeUrl: lc('max-area-of-island') },
      { slug: 'island-perimeter',              number: 463,  title: 'Island Perimeter',              difficulty: 'Easy',   pattern: 'Grid',       leetcodeUrl: lc('island-perimeter') },
      { slug: 'rotting-oranges',               number: 994,  title: 'Rotting Oranges',               difficulty: 'Medium', pattern: 'BFS',        leetcodeUrl: lc('rotting-oranges') },
      { slug: 'clone-graph',                   number: 133,  title: 'Clone Graph',                   difficulty: 'Medium', pattern: 'DFS / BFS',  leetcodeUrl: lc('clone-graph') },
      { slug: 'pacific-atlantic-water-flow',   number: 417,  title: 'Pacific Atlantic Water Flow',   difficulty: 'Medium', pattern: 'DFS',        leetcodeUrl: lc('pacific-atlantic-water-flow') },
      { slug: 'surrounded-regions',            number: 130,  title: 'Surrounded Regions',            difficulty: 'Medium', pattern: 'DFS',        leetcodeUrl: lc('surrounded-regions') },
      { slug: 'keys-and-rooms',                number: 841,  title: 'Keys and Rooms',                difficulty: 'Medium', pattern: 'DFS / BFS',  leetcodeUrl: lc('keys-and-rooms') },
      { slug: 'number-of-provinces',           number: 547,  title: 'Number of Provinces',           difficulty: 'Medium', pattern: 'Union-Find', leetcodeUrl: lc('number-of-provinces') },
      { slug: 'shortest-path-in-binary-matrix',number: 1091, title: 'Shortest Path in Binary Matrix',difficulty: 'Medium', pattern: 'BFS',        leetcodeUrl: lc('shortest-path-in-binary-matrix') },
      { slug: 'detonate-the-maximum-bombs',    number: 2101, title: 'Detonate the Maximum Bombs',    difficulty: 'Medium', pattern: 'DFS / BFS',  leetcodeUrl: lc('detonate-the-maximum-bombs') },
    ],
  },

  {
    id: 'advanced-graphs',
    order: 12,
    title: 'Advanced Graphs',
    description: 'Topological sort, union-find, shortest path, and minimum spanning tree.',
    problems: [
      { slug: 'course-schedule',                                      number: 207,  title: 'Course Schedule',                                      difficulty: 'Medium', pattern: 'Topological Sort', leetcodeUrl: lc('course-schedule') },
      { slug: 'course-schedule-ii',                                   number: 210,  title: 'Course Schedule II',                                   difficulty: 'Medium', pattern: 'Topological Sort', leetcodeUrl: lc('course-schedule-ii') },
      { slug: 'redundant-connection',                                 number: 684,  title: 'Redundant Connection',                                 difficulty: 'Medium', pattern: 'Union-Find',       leetcodeUrl: lc('redundant-connection') },
      { slug: 'number-of-connected-components-in-an-undirected-graph', number: 323, title: 'Number of Connected Components in an Undirected Graph', difficulty: 'Medium', pattern: 'Union-Find',       leetcodeUrl: lc('number-of-connected-components-in-an-undirected-graph') },
      { slug: 'connecting-cities-with-minimum-cost',                  number: 1135, title: 'Connecting Cities With Minimum Cost',                  difficulty: 'Medium', pattern: 'MST',              leetcodeUrl: lc('connecting-cities-with-minimum-cost') },
      { slug: 'min-cost-to-connect-all-points',                       number: 1584, title: 'Min Cost to Connect All Points',                       difficulty: 'Medium', pattern: 'MST',              leetcodeUrl: lc('min-cost-to-connect-all-points') },
      { slug: 'network-delay-time',                                   number: 743,  title: 'Network Delay Time',                                   difficulty: 'Medium', pattern: 'Dijkstra',         leetcodeUrl: lc('network-delay-time') },
      { slug: 'cheapest-flights-within-k-stops',                      number: 787,  title: 'Cheapest Flights Within K Stops',                      difficulty: 'Medium', pattern: 'Bellman-Ford',     leetcodeUrl: lc('cheapest-flights-within-k-stops') },
      { slug: 'path-with-maximum-probability',                        number: 1514, title: 'Path with Maximum Probability',                        difficulty: 'Medium', pattern: 'Dijkstra',         leetcodeUrl: lc('path-with-maximum-probability') },
      { slug: 'alien-dictionary',                                     number: 269,  title: 'Alien Dictionary',                                     difficulty: 'Hard',   pattern: 'Topological Sort', leetcodeUrl: lc('alien-dictionary') },
      { slug: 'satisfiability-of-equality-equations',                 number: 990,  title: 'Satisfiability of Equality Equations',                 difficulty: 'Medium', pattern: 'Union-Find',       leetcodeUrl: lc('satisfiability-of-equality-equations') },
      { slug: 'path-with-minimum-effort',                             number: 1631, title: 'Path With Minimum Effort',                             difficulty: 'Medium', pattern: 'Dijkstra',         leetcodeUrl: lc('path-with-minimum-effort') },
    ],
  },

  {
    id: 'dp-1d',
    order: 13,
    title: '1-D Dynamic Programming',
    description: 'From one-state DP to harder recurrence design.',
    problems: [
      { slug: 'climbing-stairs',              number: 70,  title: 'Climbing Stairs',              difficulty: 'Easy',   pattern: 'DP', leetcodeUrl: lc('climbing-stairs') },
      { slug: 'min-cost-climbing-stairs',     number: 746, title: 'Min Cost Climbing Stairs',     difficulty: 'Easy',   pattern: 'DP', leetcodeUrl: lc('min-cost-climbing-stairs') },
      { slug: 'house-robber',                 number: 198, title: 'House Robber',                 difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('house-robber') },
      { slug: 'house-robber-ii',              number: 213, title: 'House Robber II',              difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('house-robber-ii') },
      { slug: 'fibonacci-number',             number: 509, title: 'Fibonacci Number',             difficulty: 'Easy',   pattern: 'DP', leetcodeUrl: lc('fibonacci-number') },
      { slug: 'delete-and-earn',              number: 740, title: 'Delete and Earn',              difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('delete-and-earn') },
      { slug: 'maximum-product-subarray',     number: 152, title: 'Maximum Product Subarray',     difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('maximum-product-subarray') },
      { slug: 'word-break',                   number: 139, title: 'Word Break',                   difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('word-break') },
      { slug: 'longest-increasing-subsequence', number: 300, title: 'Longest Increasing Subsequence', difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('longest-increasing-subsequence') },
      { slug: 'coin-change',                  number: 322, title: 'Coin Change',                  difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('coin-change') },
      { slug: 'decode-ways',                  number: 91,  title: 'Decode Ways',                  difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('decode-ways') },
      { slug: 'perfect-squares',              number: 279, title: 'Perfect Squares',              difficulty: 'Medium', pattern: 'DP', leetcodeUrl: lc('perfect-squares') },
    ],
  },

  {
    id: 'dp-2d',
    order: 14,
    title: '2-D Dynamic Programming',
    description: 'Grids first, then subsequences and knapsack-style problems.',
    problems: [
      { slug: 'unique-paths',                  number: 62,   title: 'Unique Paths',                  difficulty: 'Medium', pattern: 'Grid DP',   leetcodeUrl: lc('unique-paths') },
      { slug: 'minimum-path-sum',              number: 64,   title: 'Minimum Path Sum',              difficulty: 'Medium', pattern: 'Grid DP',   leetcodeUrl: lc('minimum-path-sum') },
      { slug: 'unique-paths-ii',               number: 63,   title: 'Unique Paths II',               difficulty: 'Medium', pattern: 'Grid DP',   leetcodeUrl: lc('unique-paths-ii') },
      { slug: 'maximal-square',                number: 221,  title: 'Maximal Square',                difficulty: 'Medium', pattern: 'Grid DP',   leetcodeUrl: lc('maximal-square') },
      { slug: 'longest-common-subsequence',    number: 1143, title: 'Longest Common Subsequence',    difficulty: 'Medium', pattern: 'String DP', leetcodeUrl: lc('longest-common-subsequence') },
      { slug: 'edit-distance',                 number: 72,   title: 'Edit Distance',                 difficulty: 'Medium', pattern: 'String DP', leetcodeUrl: lc('edit-distance') },
      { slug: 'interleaving-string',           number: 97,   title: 'Interleaving String',           difficulty: 'Medium', pattern: 'String DP', leetcodeUrl: lc('interleaving-string') },
      { slug: 'target-sum',                    number: 494,  title: 'Target Sum',                    difficulty: 'Medium', pattern: 'Knapsack',  leetcodeUrl: lc('target-sum') },
      { slug: 'partition-equal-subset-sum',    number: 416,  title: 'Partition Equal Subset Sum',    difficulty: 'Medium', pattern: 'Knapsack',  leetcodeUrl: lc('partition-equal-subset-sum') },
      { slug: 'coin-change-ii',                number: 518,  title: 'Coin Change II',                difficulty: 'Medium', pattern: 'Knapsack',  leetcodeUrl: lc('coin-change-ii') },
      { slug: 'distinct-subsequences',         number: 115,  title: 'Distinct Subsequences',         difficulty: 'Hard',   pattern: 'String DP', leetcodeUrl: lc('distinct-subsequences') },
      { slug: 'regular-expression-matching',   number: 10,   title: 'Regular Expression Matching',   difficulty: 'Hard',   pattern: 'String DP', leetcodeUrl: lc('regular-expression-matching') },
    ],
  },

  {
    id: 'greedy',
    order: 15,
    title: 'Greedy',
    description: 'Short solutions once the insight lands — good for intuition building.',
    problems: [
      { slug: 'assign-cookies',                           number: 455, title: 'Assign Cookies',                           difficulty: 'Easy',   pattern: 'Greedy', leetcodeUrl: lc('assign-cookies') },
      { slug: 'can-place-flowers',                        number: 605, title: 'Can Place Flowers',                        difficulty: 'Easy',   pattern: 'Greedy', leetcodeUrl: lc('can-place-flowers') },
      { slug: 'best-time-to-buy-and-sell-stock',          number: 121, title: 'Best Time to Buy and Sell Stock',          difficulty: 'Easy',   pattern: 'Greedy', leetcodeUrl: lc('best-time-to-buy-and-sell-stock') },
      { slug: 'jump-game',                                number: 55,  title: 'Jump Game',                                difficulty: 'Medium', pattern: 'Greedy', leetcodeUrl: lc('jump-game') },
      { slug: 'jump-game-ii',                             number: 45,  title: 'Jump Game II',                             difficulty: 'Medium', pattern: 'Greedy', leetcodeUrl: lc('jump-game-ii') },
      { slug: 'gas-station',                              number: 134, title: 'Gas Station',                              difficulty: 'Medium', pattern: 'Greedy', leetcodeUrl: lc('gas-station') },
      { slug: 'hand-of-straights',                        number: 846, title: 'Hand of Straights',                        difficulty: 'Medium', pattern: 'Greedy', leetcodeUrl: lc('hand-of-straights') },
      { slug: 'valid-parenthesis-string',                 number: 678, title: 'Valid Parenthesis String',                 difficulty: 'Medium', pattern: 'Greedy', leetcodeUrl: lc('valid-parenthesis-string') },
      { slug: 'partition-labels',                         number: 763, title: 'Partition Labels',                         difficulty: 'Medium', pattern: 'Greedy', leetcodeUrl: lc('partition-labels') },
      { slug: 'non-overlapping-intervals',                number: 435, title: 'Non-overlapping Intervals',                difficulty: 'Medium', pattern: 'Greedy', leetcodeUrl: lc('non-overlapping-intervals') },
      { slug: 'minimum-number-of-arrows-to-burst-balloons', number: 452, title: 'Minimum Number of Arrows to Burst Balloons', difficulty: 'Medium', pattern: 'Greedy', leetcodeUrl: lc('minimum-number-of-arrows-to-burst-balloons') },
      { slug: 'maximum-subarray',                         number: 53,  title: 'Maximum Subarray',                         difficulty: 'Medium', pattern: 'Kadane', leetcodeUrl: lc('maximum-subarray') },
    ],
  },

  {
    id: 'intervals',
    order: 16,
    title: 'Intervals',
    description: 'Highly structured — the same overlap, sweep, and merge patterns recur.',
    problems: [
      { slug: 'meeting-rooms',                             number: 252,  title: 'Meeting Rooms',                             difficulty: 'Easy',   pattern: 'Sort',         leetcodeUrl: lc('meeting-rooms') },
      { slug: 'meeting-rooms-ii',                          number: 253,  title: 'Meeting Rooms II',                          difficulty: 'Medium', pattern: 'Heap',         leetcodeUrl: lc('meeting-rooms-ii') },
      { slug: 'merge-intervals',                           number: 56,   title: 'Merge Intervals',                           difficulty: 'Medium', pattern: 'Sort',         leetcodeUrl: lc('merge-intervals') },
      { slug: 'insert-interval',                           number: 57,   title: 'Insert Interval',                           difficulty: 'Medium', pattern: 'Sweep',        leetcodeUrl: lc('insert-interval') },
      { slug: 'non-overlapping-intervals',                 number: 435,  title: 'Non-overlapping Intervals',                 difficulty: 'Medium', pattern: 'Greedy',       leetcodeUrl: lc('non-overlapping-intervals') },
      { slug: 'minimum-number-of-arrows-to-burst-balloons',number: 452,  title: 'Minimum Number of Arrows to Burst Balloons',difficulty: 'Medium', pattern: 'Greedy',       leetcodeUrl: lc('minimum-number-of-arrows-to-burst-balloons') },
      { slug: 'remove-covered-intervals',                  number: 1288, title: 'Remove Covered Intervals',                  difficulty: 'Medium', pattern: 'Sort',         leetcodeUrl: lc('remove-covered-intervals') },
      { slug: 'interval-list-intersections',               number: 986,  title: 'Interval List Intersections',               difficulty: 'Medium', pattern: 'Two Pointers', leetcodeUrl: lc('interval-list-intersections') },
      { slug: 'my-calendar-i',                             number: 729,  title: 'My Calendar I',                             difficulty: 'Medium', pattern: 'Design',       leetcodeUrl: lc('my-calendar-i') },
      { slug: 'meeting-scheduler',                         number: 1229, title: 'Meeting Scheduler',                         difficulty: 'Medium', pattern: 'Two Pointers', leetcodeUrl: lc('meeting-scheduler') },
      { slug: 'employee-free-time',                        number: 759,  title: 'Employee Free Time',                        difficulty: 'Hard',   pattern: 'Heap',         leetcodeUrl: lc('employee-free-time') },
      { slug: 'divide-intervals-into-minimum-number-of-groups', number: 2406, title: 'Divide Intervals Into Minimum Number of Groups', difficulty: 'Medium', pattern: 'Sweep Line', leetcodeUrl: lc('divide-intervals-into-minimum-number-of-groups') },
    ],
  },

  {
    id: 'math-geometry',
    order: 17,
    title: 'Math & Geometry',
    description: 'Broad but interview-relevant: number theory, matrix tricks, and geometry.',
    problems: [
      { slug: 'palindrome-number',   number: 9,   title: 'Palindrome Number',   difficulty: 'Easy',   pattern: 'Math',     leetcodeUrl: lc('palindrome-number') },
      { slug: 'plus-one',            number: 66,  title: 'Plus One',            difficulty: 'Easy',   pattern: 'Array',    leetcodeUrl: lc('plus-one') },
      { slug: 'happy-number',        number: 202, title: 'Happy Number',        difficulty: 'Easy',   pattern: 'Math',     leetcodeUrl: lc('happy-number') },
      { slug: 'ugly-number',         number: 263, title: 'Ugly Number',         difficulty: 'Easy',   pattern: 'Math',     leetcodeUrl: lc('ugly-number') },
      { slug: 'rotate-image',        number: 48,  title: 'Rotate Image',        difficulty: 'Medium', pattern: 'Matrix',   leetcodeUrl: lc('rotate-image') },
      { slug: 'spiral-matrix',       number: 54,  title: 'Spiral Matrix',       difficulty: 'Medium', pattern: 'Matrix',   leetcodeUrl: lc('spiral-matrix') },
      { slug: 'spiral-matrix-ii',    number: 59,  title: 'Spiral Matrix II',    difficulty: 'Medium', pattern: 'Matrix',   leetcodeUrl: lc('spiral-matrix-ii') },
      { slug: 'set-matrix-zeroes',   number: 73,  title: 'Set Matrix Zeroes',   difficulty: 'Medium', pattern: 'Matrix',   leetcodeUrl: lc('set-matrix-zeroes') },
      { slug: 'multiply-strings',    number: 43,  title: 'Multiply Strings',    difficulty: 'Medium', pattern: 'Math',     leetcodeUrl: lc('multiply-strings') },
      { slug: 'max-points-on-a-line',number: 149, title: 'Max Points on a Line',difficulty: 'Hard',   pattern: 'Geometry', leetcodeUrl: lc('max-points-on-a-line') },
      { slug: 'rectangle-area',      number: 223, title: 'Rectangle Area',      difficulty: 'Medium', pattern: 'Geometry', leetcodeUrl: lc('rectangle-area') },
      { slug: 'best-meeting-point',  number: 296, title: 'Best Meeting Point',  difficulty: 'Hard',   pattern: 'Math',     leetcodeUrl: lc('best-meeting-point') },
    ],
  },

  {
    id: 'bit-manipulation',
    order: 18,
    title: 'Bit Manipulation',
    description: 'Basic XOR up to mask tricks and harder bit problems.',
    problems: [
      { slug: 'single-number',                       number: 136,  title: 'Single Number',                       difficulty: 'Easy',   pattern: 'XOR',      leetcodeUrl: lc('single-number') },
      { slug: 'number-of-1-bits',                    number: 191,  title: 'Number of 1 Bits',                    difficulty: 'Easy',   pattern: 'Bits',     leetcodeUrl: lc('number-of-1-bits') },
      { slug: 'counting-bits',                       number: 338,  title: 'Counting Bits',                       difficulty: 'Easy',   pattern: 'DP + Bits',leetcodeUrl: lc('counting-bits') },
      { slug: 'reverse-bits',                        number: 190,  title: 'Reverse Bits',                        difficulty: 'Easy',   pattern: 'Bits',     leetcodeUrl: lc('reverse-bits') },
      { slug: 'missing-number',                      number: 268,  title: 'Missing Number',                      difficulty: 'Easy',   pattern: 'XOR',      leetcodeUrl: lc('missing-number') },
      { slug: 'power-of-two',                        number: 231,  title: 'Power of Two',                        difficulty: 'Easy',   pattern: 'Bits',     leetcodeUrl: lc('power-of-two') },
      { slug: 'hamming-distance',                    number: 461,  title: 'Hamming Distance',                    difficulty: 'Easy',   pattern: 'XOR',      leetcodeUrl: lc('hamming-distance') },
      { slug: 'bitwise-and-of-numbers-range',        number: 201,  title: 'Bitwise AND of Numbers Range',        difficulty: 'Medium', pattern: 'Bits',     leetcodeUrl: lc('bitwise-and-of-numbers-range') },
      { slug: 'single-number-iii',                   number: 260,  title: 'Single Number III',                   difficulty: 'Medium', pattern: 'XOR',      leetcodeUrl: lc('single-number-iii') },
      { slug: 'minimum-flips-to-make-a-or-b-equal-to-c', number: 1318, title: 'Minimum Flips to Make a OR b Equal to c', difficulty: 'Medium', pattern: 'Bits', leetcodeUrl: lc('minimum-flips-to-make-a-or-b-equal-to-c') },
      { slug: 'sum-of-two-integers',                 number: 371,  title: 'Sum of Two Integers',                 difficulty: 'Medium', pattern: 'Bits',     leetcodeUrl: lc('sum-of-two-integers') },
      { slug: 'single-number-ii',                    number: 137,  title: 'Single Number II',                    difficulty: 'Medium', pattern: 'Bits',     leetcodeUrl: lc('single-number-ii') },
    ],
  },
];
