// ─── Trees problems ──────────────────────────────────────────────────────────
//
// Trees are serialised in LeetCode's level-order convention: an array where
// missing children are represented by `null`. `TREE_NODE_HELPERS` provides the
// shared `_to_tree` / `_from_tree` helpers that materialise and flatten that
// representation.

import type { ProblemContent } from '../../lib/problem-types';
import { TREE_NODE_HELPERS } from '../../lib/py-helpers';

export const TREES_PROBLEMS: ProblemContent[] = [
  // ─── Maximum Depth of Binary Tree (LC #104) ────────────────────────────────
  {
    slug: 'maximum-depth-of-binary-tree',
    lcNumber: 104,
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    pattern: 'DFS',
    tags: ['binary-tree', 'dfs'],
    descriptionMd: `Given the \`root\` of a binary tree (serialised as a level-order array with
\`null\` for missing children), return the **maximum depth** — the number of nodes along
the longest root-to-leaf path.

The one-line recursive solution is \`max(depth(left), depth(right)) + 1\`, with the base
case \`depth(null) = 0\`.`,
    examples: [
      {
        input: 'root = [1, 2, 3]',
        output: '2',
      },
      {
        input: 'root = [1, null, 2, null, 3]',
        output: '3',
        explanation: 'Right-skewed chain of three nodes.',
      },
    ],
    constraints: [
      '`0 <= number of nodes <= 10^4`',
      '`-100 <= node.val <= 100`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def maxDepth(self, root: list) -> int:
        tree = _to_tree(root)

        # ─── Compute the max depth of the tree below ───────────────
        # Hint: recurse on left and right, take max + 1; null → 0.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'maxDepth',
    argKeys: ['root'],
    defaultTests: [
      { label: 'Balanced',   inputJson: '{"root":[1,2,3]}',              expectedJson: '2' },
      { label: 'Right skew', inputJson: '{"root":[1,null,2,null,3]}',    expectedJson: '3' },
      { label: 'Empty',      inputJson: '{"root":[]}',                   expectedJson: '0' },
      { label: 'Single',     inputJson: '{"root":[7]}',                  expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS Recursive',
        intuition: 'The depth of a tree is 1 plus the maximum depth of its left and right subtrees. The base case is a null node, which has depth 0.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def maxDepth(self, root: list) -> int:
        tree = _to_tree(root)

        def depth(node):
            if node is None:
                return 0
            return 1 + max(depth(node.left), depth(node.right))

        return depth(tree)
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h) where h is the height of the tree',
      },
      {
        approach: 'BFS Iterative',
        intuition: 'Use a queue to traverse level by level. Each time we finish processing one full level, increment the depth counter. The final count is the maximum depth.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def maxDepth(self, root: list) -> int:
        tree = _to_tree(root)
        if tree is None:
            return 0
        depth = 0
        queue = [tree]
        while queue:
            depth += 1
            next_queue = []
            for node in queue:
                if node.left:
                    next_queue.append(node.left)
                if node.right:
                    next_queue.append(node.right)
            queue = next_queue
        return depth
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Same Tree (LC #100) ───────────────────────────────────────────────────
  {
    slug: 'same-tree',
    lcNumber: 100,
    title: 'Same Tree',
    difficulty: 'Easy',
    pattern: 'DFS',
    tags: ['binary-tree', 'dfs'],
    descriptionMd: `Given the roots of two binary trees \`p\` and \`q\` (each serialised as a
level-order array with \`null\` for missing children), return \`True\` if they are
**structurally identical** and every corresponding pair of nodes has the same value.

The canonical solution is a parallel DFS: both null → equal; one null → unequal; otherwise
compare values and recurse into left-left and right-right.`,
    examples: [
      {
        input: 'p = [1, 2, 3], q = [1, 2, 3]',
        output: 'True',
      },
      {
        input: 'p = [1, 2], q = [1, null, 2]',
        output: 'False',
        explanation: 'Values match but the structure is different.',
      },
    ],
    constraints: [
      '`0 <= number of nodes <= 100`',
      '`-10^4 <= node.val <= 10^4`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def isSameTree(self, p: list, q: list) -> bool:
        tp = _to_tree(p)
        tq = _to_tree(q)

        # ─── Compare the two trees below ───────────────────────────
        # Hint: recursive DFS — both None, one None, then compare.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'isSameTree',
    argKeys: ['p', 'q'],
    defaultTests: [
      { label: 'Identical',   inputJson: '{"p":[1,2,3],"q":[1,2,3]}',          expectedJson: 'true'  },
      { label: 'Different shape', inputJson: '{"p":[1,2],"q":[1,null,2]}',     expectedJson: 'false' },
      { label: 'Both empty',  inputJson: '{"p":[],"q":[]}',                    expectedJson: 'true'  },
      { label: 'Different values', inputJson: '{"p":[1,2,1],"q":[1,1,2]}',     expectedJson: 'false' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS Recursive',
        intuition: 'Recursively compare two trees in parallel: both null means equal, one null means unequal, otherwise check values match and recurse into left-left and right-right.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def isSameTree(self, p: list, q: list) -> bool:
        tp = _to_tree(p)
        tq = _to_tree(q)

        def same(a, b):
            if a is None and b is None:
                return True
            if a is None or b is None:
                return False
            return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)

        return same(tp, tq)
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
      {
        approach: 'BFS Iterative',
        intuition: 'Use a queue of node pairs. Dequeue a pair, check if both null (continue), one null (return False), or values differ (return False). Otherwise enqueue left-left and right-right pairs.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def isSameTree(self, p: list, q: list) -> bool:
        tp = _to_tree(p)
        tq = _to_tree(q)
        queue = [(tp, tq)]
        while queue:
            a, b = queue.pop(0)
            if a is None and b is None:
                continue
            if a is None or b is None:
                return False
            if a.val != b.val:
                return False
            queue.append((a.left, b.left))
            queue.append((a.right, b.right))
        return True
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Invert Binary Tree (LC #226) ──────────────────────────────────────────
  {
    slug: 'invert-binary-tree',
    lcNumber: 226,
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    pattern: 'DFS',
    tags: ['binary-tree', 'dfs'],
    descriptionMd: `Given the root of a binary tree, invert it — swap every node's left and right
children — and return the resulting tree, serialised as a level-order array with \`null\`
for missing children.

Either a recursive DFS (swap children, recurse) or an iterative BFS (swap at each dequeued
node) works fine.`,
    examples: [
      {
        input: 'root = [4, 2, 7, 1, 3, 6, 9]',
        output: '[4, 7, 2, 9, 6, 3, 1]',
      },
      {
        input: 'root = [1, 2]',
        output: '[1, null, 2]',
      },
    ],
    constraints: [
      '`0 <= number of nodes <= 100`',
      '`-100 <= node.val <= 100`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def invertTree(self, root: list) -> list:
        tree = _to_tree(root)

        # ─── Invert the tree in place below ────────────────────────
        # Hint: recursive swap of left and right at every node.
        new_root = tree  # TODO: replace with the inverted root
        # ───────────────────────────────────────────────────────────

        return _from_tree(new_root)
`,
    },
    methodName: 'invertTree',
    argKeys: ['root'],
    defaultTests: [
      { label: 'Full tree', inputJson: '{"root":[4,2,7,1,3,6,9]}', expectedJson: '[4,7,2,9,6,3,1]' },
      { label: 'Left only', inputJson: '{"root":[1,2]}',            expectedJson: '[1,null,2]'     },
      { label: 'Empty',     inputJson: '{"root":[]}',               expectedJson: '[]'             },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS Recursive',
        intuition: 'At each node, swap its left and right children, then recurse into both subtrees. The base case is null, which returns null unchanged.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def invertTree(self, root: list) -> list:
        tree = _to_tree(root)

        def invert(node):
            if node is None:
                return None
            node.left, node.right = invert(node.right), invert(node.left)
            return node

        return _from_tree(invert(tree))
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
      {
        approach: 'BFS Iterative',
        intuition: 'Use a queue to visit every node level by level. At each node, swap its left and right children. This inverts the entire tree without recursion.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def invertTree(self, root: list) -> list:
        tree = _to_tree(root)
        if tree is None:
            return []
        queue = [tree]
        while queue:
            node = queue.pop(0)
            node.left, node.right = node.right, node.left
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        return _from_tree(tree)
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Symmetric Tree (LC #101) ──────────────────────────────────────────────
  {
    slug: 'symmetric-tree',
    lcNumber: 101,
    title: 'Symmetric Tree',
    difficulty: 'Easy',
    pattern: 'DFS',
    tags: ['binary-tree', 'dfs'],
    descriptionMd: `Given the root of a binary tree, return \`True\` if the tree is a **mirror image
of itself** around its root. Otherwise return \`False\`.

A helper function \`isMirror(a, b)\` that returns whether two subtrees mirror each other
(comparing \`a.left\` to \`b.right\` and \`a.right\` to \`b.left\`) is the standard
recursive solution.`,
    examples: [
      {
        input: 'root = [1, 2, 2, 3, 4, 4, 3]',
        output: 'True',
      },
      {
        input: 'root = [1, 2, 2, null, 3, null, 3]',
        output: 'False',
      },
    ],
    constraints: [
      '`0 <= number of nodes <= 1000`',
      '`-100 <= node.val <= 100`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def isSymmetric(self, root: list) -> bool:
        tree = _to_tree(root)

        # ─── Decide whether the tree is symmetric below ───────────
        # Hint: helper isMirror(a, b) comparing a.left vs b.right.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'isSymmetric',
    argKeys: ['root'],
    defaultTests: [
      { label: 'Mirrored',     inputJson: '{"root":[1,2,2,3,4,4,3]}',        expectedJson: 'true'  },
      { label: 'Not mirrored', inputJson: '{"root":[1,2,2,null,3,null,3]}',  expectedJson: 'false' },
      { label: 'Single',       inputJson: '{"root":[1]}',                    expectedJson: 'true'  },
      { label: 'Empty',        inputJson: '{"root":[]}',                     expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS Recursive',
        intuition: 'A tree is symmetric if its left and right subtrees are mirror images. Write a helper isMirror(a, b) that checks a.left vs b.right and a.right vs b.left recursively.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def isSymmetric(self, root: list) -> bool:
        tree = _to_tree(root)

        def mirror(a, b):
            if a is None and b is None:
                return True
            if a is None or b is None:
                return False
            return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)

        if tree is None:
            return True
        return mirror(tree.left, tree.right)
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
      {
        approach: 'BFS Iterative',
        intuition: 'Use a queue of pairs, starting with (left, right). For each pair, check both null (continue), one null (false), values differ (false), then enqueue (a.left, b.right) and (a.right, b.left).',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def isSymmetric(self, root: list) -> bool:
        tree = _to_tree(root)
        if tree is None:
            return True
        queue = [(tree.left, tree.right)]
        while queue:
            a, b = queue.pop(0)
            if a is None and b is None:
                continue
            if a is None or b is None:
                return False
            if a.val != b.val:
                return False
            queue.append((a.left, b.right))
            queue.append((a.right, b.left))
        return True
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Diameter of Binary Tree (LC #543) ─────────────────────────────────────
  {
    slug: 'diameter-of-binary-tree',
    lcNumber: 543,
    title: 'Diameter of Binary Tree',
    difficulty: 'Easy',
    pattern: 'DFS',
    tags: ['binary-tree', 'dfs'],
    descriptionMd: `Given the root of a binary tree, return the **length of the longest path between
any two nodes** in the tree, measured in edges. The path may or may not pass through the
root, but every edge on the path is counted exactly once.

The trick is to run a single DFS that returns the height of each subtree, and on the way
back up track the best "left_height + right_height" seen at any node — that sum is the
diameter through that node.`,
    examples: [
      {
        input: 'root = [1, 2, 3, 4, 5]',
        output: '3',
        explanation: 'Longest path is 4 → 2 → 1 → 3 (or 5 → 2 → 1 → 3), covering 3 edges.',
      },
      {
        input: 'root = [1]',
        output: '0',
      },
    ],
    constraints: [
      '`0 <= number of nodes <= 10^4`',
      '`-100 <= node.val <= 100`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def diameterOfBinaryTree(self, root: list) -> int:
        tree = _to_tree(root)

        # ─── Compute the diameter below ───────────────────────────
        # Hint: DFS returns subtree heights while updating a best variable.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'diameterOfBinaryTree',
    argKeys: ['root'],
    defaultTests: [
      { label: 'Mixed tree', inputJson: '{"root":[1,2,3,4,5]}', expectedJson: '3' },
      { label: 'Single',     inputJson: '{"root":[1]}',          expectedJson: '0' },
      { label: 'Empty',      inputJson: '{"root":[]}',           expectedJson: '0' },
      { label: 'Chain',      inputJson: '{"root":[1,2,null,3]}', expectedJson: '2' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS with Height Tracking',
        intuition: 'Run a single DFS that returns the height of each subtree. At each node, compute left_height + right_height and update a global best. The diameter is the maximum such sum across all nodes.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def diameterOfBinaryTree(self, root: list) -> int:
        tree = _to_tree(root)
        best = [0]

        def height(node):
            if node is None:
                return 0
            lh = height(node.left)
            rh = height(node.right)
            if lh + rh > best[0]:
                best[0] = lh + rh
            return 1 + max(lh, rh)

        height(tree)
        return best[0]
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
    ],
  },

  // ─── Balanced Binary Tree (LC #110) ────────────────────────────────────────
  {
    slug: 'balanced-binary-tree',
    lcNumber: 110,
    title: 'Balanced Binary Tree',
    difficulty: 'Easy',
    pattern: 'DFS',
    tags: ['binary-tree', 'dfs'],
    descriptionMd: `Given the root of a binary tree, return \`True\` if the tree is **height-balanced**
— defined here as every node having left and right subtree heights differing by at most 1 —
and \`False\` otherwise.

The elegant solution runs a single DFS that returns either the subtree height or a sentinel
value (e.g. \`-1\`) indicating the subtree is already unbalanced, bubbling the sentinel all
the way up.`,
    examples: [
      {
        input: 'root = [3, 9, 20, null, null, 15, 7]',
        output: 'True',
      },
      {
        input: 'root = [1, 2, 2, 3, 3, null, null, 4, 4]',
        output: 'False',
      },
    ],
    constraints: [
      '`0 <= number of nodes <= 5000`',
      '`-10^4 <= node.val <= 10^4`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def isBalanced(self, root: list) -> bool:
        tree = _to_tree(root)

        # ─── Decide whether the tree is height-balanced below ─────
        # Hint: DFS returning either the height or -1 for unbalanced.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'isBalanced',
    argKeys: ['root'],
    defaultTests: [
      { label: 'Balanced',    inputJson: '{"root":[3,9,20,null,null,15,7]}',         expectedJson: 'true'  },
      { label: 'Not balanced',inputJson: '{"root":[1,2,2,3,3,null,null,4,4]}',       expectedJson: 'false' },
      { label: 'Empty',       inputJson: '{"root":[]}',                              expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS with Sentinel',
        intuition: 'A single DFS returns either the subtree height or -1 as a sentinel indicating imbalance. At each node, if the left or right subtree returns -1, propagate -1 upward. Otherwise check if heights differ by more than 1.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def isBalanced(self, root: list) -> bool:
        tree = _to_tree(root)

        def check(node):
            if node is None:
                return 0
            lh = check(node.left)
            if lh == -1:
                return -1
            rh = check(node.right)
            if rh == -1:
                return -1
            if abs(lh - rh) > 1:
                return -1
            return 1 + max(lh, rh)

        return check(tree) != -1
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
    ],
  },

  // ─── Subtree of Another Tree (LC #572) ─────────────────────────────────────
  {
    slug: 'subtree-of-another-tree',
    lcNumber: 572,
    title: 'Subtree of Another Tree',
    difficulty: 'Easy',
    pattern: 'DFS',
    tags: ['binary-tree', 'dfs'],
    descriptionMd: `Given the roots of two binary trees \`root\` and \`subRoot\` (both serialised as
level-order arrays with \`null\` for missing children), return \`True\` if there exists any
subtree of \`root\` that is structurally identical to \`subRoot\`. Otherwise return
\`False\`.

The simple \`O(m * n)\` approach composes a \`sameTree\` helper with a DFS that tries every
node in \`root\` as a candidate root.`,
    examples: [
      {
        input: 'root = [3, 4, 5, 1, 2], subRoot = [4, 1, 2]',
        output: 'True',
      },
      {
        input: 'root = [1, 2], subRoot = [2]',
        output: 'True',
      },
    ],
    constraints: [
      '`1 <= number of nodes in root <= 2000`',
      '`1 <= number of nodes in subRoot <= 1000`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def isSubtree(self, root: list, subRoot: list) -> bool:
        t = _to_tree(root)
        s = _to_tree(subRoot)

        # ─── Decide whether subRoot appears inside root below ─────
        # Hint: compose a sameTree helper with a walk over root.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'isSubtree',
    argKeys: ['root', 'subRoot'],
    defaultTests: [
      { label: 'Found subtree', inputJson: '{"root":[3,4,5,1,2],"subRoot":[4,1,2]}', expectedJson: 'true'  },
      { label: 'Leaf match',    inputJson: '{"root":[1,2],"subRoot":[2]}',            expectedJson: 'true'  },
      { label: 'Not a subtree', inputJson: '{"root":[1,2,3],"subRoot":[2,3]}',        expectedJson: 'false' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS with sameTree Helper',
        intuition: 'Compose two helpers: sameTree checks if two trees are structurally identical, and walk tries every node in root as a candidate match against subRoot. If sameTree matches at any node, return True.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def isSubtree(self, root: list, subRoot: list) -> bool:
        t = _to_tree(root)
        s = _to_tree(subRoot)

        def same(a, b):
            if a is None and b is None:
                return True
            if a is None or b is None:
                return False
            return a.val == b.val and same(a.left, b.left) and same(a.right, b.right)

        def walk(node):
            if node is None:
                return False
            if same(node, s):
                return True
            return walk(node.left) or walk(node.right)

        if s is None:
            return True
        return walk(t)
`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(h)',
      },
    ],
  },

  // ─── Validate Binary Search Tree (LC #98) ──────────────────────────────────
  {
    slug: 'validate-binary-search-tree',
    lcNumber: 98,
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    pattern: 'BST',
    tags: ['binary-tree', 'bst', 'dfs'],
    descriptionMd: `Given the root of a binary tree, return \`True\` if it is a valid **binary search
tree**: for every node, every value in its **entire** left subtree is strictly less than the
node's value, and every value in its **entire** right subtree is strictly greater.

The cleanest implementation is a DFS that carries a \`(lo, hi)\` open interval: \`lo\` and
\`hi\` start as \`-infinity\` and \`+infinity\`, and each recursive call tightens one
of the bounds.`,
    examples: [
      {
        input: 'root = [5, 3, 8, 1, 4, 6, 9]',
        output: 'True',
      },
      {
        input: 'root = [5, 1, 4, null, null, 3, 6]',
        output: 'False',
        explanation: 'The 3 sits in the right subtree of 5 but is less than 5.',
      },
    ],
    constraints: [
      '`1 <= number of nodes <= 10^4`',
      '`-2^31 <= node.val <= 2^31 - 1`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def isValidBST(self, root: list) -> bool:
        tree = _to_tree(root)

        # ─── Decide whether the tree is a valid BST below ─────────
        # Hint: DFS with lo/hi bounds, strict inequalities at each step.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'isValidBST',
    argKeys: ['root'],
    defaultTests: [
      { label: 'Valid BST',   inputJson: '{"root":[5,3,8,1,4,6,9]}',           expectedJson: 'true'  },
      { label: 'Invalid BST', inputJson: '{"root":[5,1,4,null,null,3,6]}',     expectedJson: 'false' },
      { label: 'Two nodes',   inputJson: '{"root":[2,1,3]}',                    expectedJson: 'true'  },
      { label: 'Single node', inputJson: '{"root":[1]}',                        expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS with Bounds',
        intuition: 'Carry a (lo, hi) open interval down the tree. Start with (-infinity, +infinity). Going left tightens hi to node.val; going right tightens lo to node.val. If any node falls outside its bounds, the tree is invalid.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def isValidBST(self, root: list) -> bool:
        tree = _to_tree(root)

        def check(node, lo, hi):
            if node is None:
                return True
            if not (lo < node.val < hi):
                return False
            return check(node.left, lo, node.val) and check(node.right, node.val, hi)

        return check(tree, float('-inf'), float('inf'))
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
      {
        approach: 'Inorder Traversal',
        intuition: 'An inorder traversal of a valid BST produces a strictly increasing sequence. Perform an inorder walk and check that each value is greater than the previous one.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def isValidBST(self, root: list) -> bool:
        tree = _to_tree(root)
        prev = [float('-inf')]

        def inorder(node):
            if node is None:
                return True
            if not inorder(node.left):
                return False
            if node.val <= prev[0]:
                return False
            prev[0] = node.val
            return inorder(node.right)

        return inorder(tree)
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
    ],
  },

  // ─── Lowest Common Ancestor of a Binary Search Tree (LC #235) ─────────────
  {
    slug: 'lowest-common-ancestor-of-a-binary-search-tree',
    lcNumber: 235,
    title: 'Lowest Common Ancestor of a Binary Search Tree',
    difficulty: 'Medium',
    pattern: 'BST',
    tags: ['binary-tree', 'bst'],
    descriptionMd: `You are given the root of a **binary search tree** (serialised as a level-order
array) and two values \`p\` and \`q\` known to exist in the tree. Return the value of their
**lowest common ancestor** — the lowest node in the BST that has both \`p\` and \`q\` in
(or equal to) its subtree.

Because the tree is a BST you can solve this without full traversal: walk from the root,
and at each node if both targets are smaller go left, if both are larger go right, otherwise
the current node is the LCA. This runs in \`O(h)\` time.`,
    examples: [
      {
        input: 'root = [5, 3, 7, 1, 4, 6, 8], p = 1, q = 4',
        output: '3',
      },
      {
        input: 'root = [2, 1, 3], p = 1, q = 3',
        output: '2',
      },
    ],
    constraints: [
      '`2 <= number of nodes <= 10^5`',
      '`p != q`, both present in the tree.',
      '`-10^9 <= node.val <= 10^9`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def lowestCommonAncestor(self, root: list, p: int, q: int) -> int:
        tree = _to_tree(root)

        # ─── Find the LCA and return its value below ──────────────
        # Hint: walk from root, pick left or right based on BST rules.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'lowestCommonAncestor',
    argKeys: ['root', 'p', 'q'],
    defaultTests: [
      { label: 'Both on left', inputJson: '{"root":[5,3,7,1,4,6,8],"p":1,"q":4}', expectedJson: '3' },
      { label: 'Split at root',inputJson: '{"root":[2,1,3],"p":1,"q":3}',          expectedJson: '2' },
      { label: 'Ancestor is p',inputJson: '{"root":[5,3,7],"p":5,"q":7}',          expectedJson: '5' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Iterative Walk',
        intuition: 'Exploit the BST property: if both p and q are smaller than the current node, go left. If both are larger, go right. Otherwise the current node is the split point and must be the LCA.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def lowestCommonAncestor(self, root: list, p: int, q: int) -> int:
        tree = _to_tree(root)
        cur = tree
        while cur is not None:
            if p < cur.val and q < cur.val:
                cur = cur.left
            elif p > cur.val and q > cur.val:
                cur = cur.right
            else:
                return cur.val
        return -1
`,
        timeComplexity: 'O(h)',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Recursive',
        intuition: 'Same logic as the iterative approach but expressed recursively: recurse left if both targets are smaller, right if both are larger, otherwise return the current node.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def lowestCommonAncestor(self, root: list, p: int, q: int) -> int:
        tree = _to_tree(root)

        def lca(node):
            if p < node.val and q < node.val:
                return lca(node.left)
            if p > node.val and q > node.val:
                return lca(node.right)
            return node.val

        return lca(tree)
`,
        timeComplexity: 'O(h)',
        spaceComplexity: 'O(h)',
      },
    ],
  },

  // ─── Binary Tree Level Order Traversal (LC #102) ───────────────────────────
  {
    slug: 'binary-tree-level-order-traversal',
    lcNumber: 102,
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    pattern: 'BFS',
    tags: ['binary-tree', 'bfs'],
    descriptionMd: `Given the root of a binary tree, return the **level-order traversal** of its values
as a list of lists (one inner list per level, root at index 0).

The idiomatic implementation is a breadth-first search with a queue: pop the entire current
level at once, collect the values, and push the next level's nodes onto the queue.`,
    examples: [
      {
        input: 'root = [3, 9, 20, null, null, 15, 7]',
        output: '[[3], [9, 20], [15, 7]]',
      },
      {
        input: 'root = []',
        output: '[]',
      },
    ],
    constraints: [
      '`0 <= number of nodes <= 2000`',
      '`-1000 <= node.val <= 1000`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def levelOrder(self, root: list) -> list[list[int]]:
        tree = _to_tree(root)

        # ─── Perform a BFS and collect values per level below ────
        # Hint: pop the entire current level's length each iteration.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'levelOrder',
    argKeys: ['root'],
    defaultTests: [
      { label: 'Three levels', inputJson: '{"root":[3,9,20,null,null,15,7]}', expectedJson: '[[3],[9,20],[15,7]]' },
      { label: 'Empty',        inputJson: '{"root":[]}',                       expectedJson: '[]' },
      { label: 'Single',       inputJson: '{"root":[1]}',                      expectedJson: '[[1]]' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'BFS with Queue',
        intuition: 'Use a queue initialized with the root. On each iteration, drain all nodes at the current level, collect their values into a list, and enqueue their children. Each drained batch forms one level of the output.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def levelOrder(self, root: list) -> list[list[int]]:
        tree = _to_tree(root)
        if tree is None:
            return []
        out = []
        queue = [tree]
        while queue:
            level = []
            next_queue = []
            for node in queue:
                level.append(node.val)
                if node.left is not None:
                    next_queue.append(node.left)
                if node.right is not None:
                    next_queue.append(node.right)
            out.append(level)
            queue = next_queue
        return out
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'DFS Recursive',
        intuition: 'Recurse through the tree carrying the current depth. Append the node value to the list at index depth, creating a new sub-list when entering a new level for the first time.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def levelOrder(self, root: list) -> list[list[int]]:
        tree = _to_tree(root)
        out = []

        def dfs(node, depth):
            if node is None:
                return
            if depth == len(out):
                out.append([])
            out[depth].append(node.val)
            dfs(node.left, depth + 1)
            dfs(node.right, depth + 1)

        dfs(tree, 0)
        return out
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Construct Binary Tree from Preorder and Inorder Traversal (LC #105) ──
  {
    slug: 'construct-binary-tree-from-preorder-and-inorder-traversal',
    lcNumber: 105,
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    difficulty: 'Medium',
    pattern: 'Construction',
    tags: ['binary-tree', 'recursion'],
    descriptionMd: `Given two integer arrays \`preorder\` and \`inorder\` that describe the preorder and
inorder traversals of the same binary tree (with all values distinct), reconstruct the tree
and return its **level-order** serialisation (using \`null\` for missing children).

The recursive solution: the first element of \`preorder\` is the current root; find that
value in \`inorder\` to split it into the left subtree's inorder and the right subtree's
inorder, then recurse on both halves.`,
    examples: [
      {
        input: 'preorder = [3, 9, 20, 15, 7], inorder = [9, 3, 15, 20, 7]',
        output: '[3, 9, 20, null, null, 15, 7]',
      },
      {
        input: 'preorder = [1], inorder = [1]',
        output: '[1]',
      },
    ],
    constraints: [
      '`1 <= len(preorder) == len(inorder) <= 3000`',
      'Both arrays describe the same tree with distinct values.',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def buildTree(self, preorder: list[int], inorder: list[int]) -> list:
        # Build the tree and return its level-order serialisation.
        pass
`,
    },
    methodName: 'buildTree',
    argKeys: ['preorder', 'inorder'],
    defaultTests: [
      {
        label: 'Classic',
        inputJson: '{"preorder":[3,9,20,15,7],"inorder":[9,3,15,20,7]}',
        expectedJson: '[3,9,20,null,null,15,7]',
      },
      {
        label: 'Single',
        inputJson: '{"preorder":[1],"inorder":[1]}',
        expectedJson: '[1]',
      },
      {
        label: 'Three nodes',
        inputJson: '{"preorder":[1,2,3],"inorder":[2,1,3]}',
        expectedJson: '[1,2,3]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Recursive with Index Map',
        intuition: 'The first element of preorder is the root. Find its position in inorder to split into left and right subtrees. Use a hash map for O(1) index lookup. Recurse on both halves, consuming preorder values via an iterator.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def buildTree(self, preorder: list[int], inorder: list[int]) -> list:
        if not preorder:
            return []
        index_of = {v: i for i, v in enumerate(inorder)}
        pre_iter = iter(preorder)

        def build(lo, hi):
            if lo > hi:
                return None
            val = next(pre_iter)
            node = TreeNode(val)
            mid = index_of[val]
            node.left = build(lo, mid - 1)
            node.right = build(mid + 1, hi)
            return node

        root = build(0, len(inorder) - 1)
        return _from_tree(root)
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Binary Tree Maximum Path Sum (LC #124) ────────────────────────────────
  {
    slug: 'binary-tree-maximum-path-sum',
    lcNumber: 124,
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'Hard',
    pattern: 'DFS',
    tags: ['binary-tree', 'dfs', 'dp'],
    descriptionMd: `Given the root of a non-empty binary tree, return the **maximum path sum**. A
path is any sequence of nodes connected by edges (not necessarily passing through the root)
where each consecutive pair shares an edge and no node is visited twice. Path sum is the sum
of the node values along the path.

The classic solution is a post-order DFS that, for each node, returns the best **downward**
path sum from that node (either through the left child or the right child, whichever is
larger — or zero if that side is negative). Meanwhile it updates a global best with the
"left_down + node.val + right_down" candidate, which represents a path that bends at the
current node.`,
    examples: [
      {
        input: 'root = [1, 2, 3]',
        output: '6',
        explanation: 'Path 2 → 1 → 3 sums to 6.',
      },
      {
        input: 'root = [-3]',
        output: '-3',
      },
    ],
    constraints: [
      '`1 <= number of nodes <= 3 * 10^4`',
      '`-1000 <= node.val <= 1000`',
    ],
    starterCode: {
      python: `${TREE_NODE_HELPERS}
class Solution:
    def maxPathSum(self, root: list) -> int:
        tree = _to_tree(root)

        # ─── Compute the maximum path sum below ───────────────────
        # Hint: DFS that returns best downward sum and updates a global best.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'maxPathSum',
    argKeys: ['root'],
    defaultTests: [
      { label: 'Through root', inputJson: '{"root":[1,2,3]}',   expectedJson: '6'  },
      { label: 'Single neg',   inputJson: '{"root":[-3]}',      expectedJson: '-3' },
      { label: 'Negative side',inputJson: '{"root":[2,-1]}',    expectedJson: '2'  },
      { label: 'Hard case',    inputJson: '{"root":[-10,9,20,null,null,15,7]}', expectedJson: '42' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Post-order DFS',
        intuition: 'For each node, compute the best "downward" path sum through left or right (clamped to 0 to ignore negative branches). Update a global best with left + node.val + right, which represents the path bending at this node. Return node.val + max(left, right) upward.',
        code: `${TREE_NODE_HELPERS}
class Solution:
    def maxPathSum(self, root: list) -> int:
        tree = _to_tree(root)
        best = [float('-inf')]

        def gain(node):
            if node is None:
                return 0
            left = max(gain(node.left), 0)
            right = max(gain(node.right), 0)
            through = node.val + left + right
            if through > best[0]:
                best[0] = through
            return node.val + max(left, right)

        gain(tree)
        return best[0]
`,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
      },
    ],
  },
];
