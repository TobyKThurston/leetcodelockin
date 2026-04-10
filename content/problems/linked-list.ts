// ─── Linked List problems ────────────────────────────────────────────────────
//
// Starter code begins with `LIST_NODE_HELPERS` from `lib/py-helpers.ts` so the
// ListNode class and _to_list / _from_list helpers stay identical across every
// linked-list problem.

import type { ProblemContent } from '../../lib/problem-types';
import { LIST_NODE_HELPERS } from '../../lib/py-helpers';

export const LINKED_LIST_PROBLEMS: ProblemContent[] = [
  // ─── Reverse Linked List (LC #206) ─────────────────────────────────────────
  {
    slug: 'reverse-linked-list',
    lcNumber: 206,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    pattern: 'Pointer Rewiring',
    tags: ['linked-list'],
    descriptionMd: `You are given the head of a singly linked list represented as the values
\`values\` (in head-to-tail order). Reverse the list and return the new sequence of values
(from new head to new tail).

We use Python lists for I/O so you can run the tests, but the **technique you should
practice** is the in-place pointer reversal: walk the list once, flipping each node's
\`next\` pointer to point at its previous node.

The starter code includes \`ListNode\`, \`_to_list\`, and \`_from_list\` helpers so you can
focus on the pointer rewiring inside \`reverseList\`.`,
    examples: [
      {
        input: 'values = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
      },
      {
        input: 'values = []',
        output: '[]',
      },
    ],
    constraints: [
      '`0 <= len(values) <= 5000`',
      '`-5000 <= values[i] <= 5000`',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def reverseList(self, values: list[int]) -> list[int]:
        head = _to_list(values)

        # ─── Reverse the linked list below ─────────────────────────
        # Hint: walk the list, flipping each node's .next to point
        # at the previous node. Track prev, cur, and a temporary nxt.
        new_head = head  # TODO: replace with the reversed head
        # ───────────────────────────────────────────────────────────

        return _from_list(new_head)
`,
    },
    methodName: 'reverseList',
    argKeys: ['values'],
    defaultTests: [
      { label: 'Five nodes', inputJson: '{"values":[1,2,3,4,5]}', expectedJson: '[5,4,3,2,1]' },
      { label: 'Empty',      inputJson: '{"values":[]}',          expectedJson: '[]'          },
      { label: 'Single',     inputJson: '{"values":[7]}',         expectedJson: '[7]'         },
    ],
    resultCompare: 'exact',
  },

  // ─── Merge Two Sorted Lists (LC #21) ───────────────────────────────────────
  {
    slug: 'merge-two-sorted-lists',
    lcNumber: 21,
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    pattern: 'Linked List Merge',
    tags: ['linked-list'],
    descriptionMd: `You are given two sorted singly linked lists, represented as the value arrays
\`list1\` and \`list2\`. Merge them into a single sorted linked list and return the merged
sequence of values (from head to tail).

We use Python lists for I/O so you can run the tests, but the **technique you should
practice** is the linked-list merge: walk both lists with two pointers, repeatedly attaching
whichever current node is smaller to a growing result list.

The starter code includes \`ListNode\`, \`_to_list\`, and \`_from_list\` helpers so you can
focus on the merge logic inside \`mergeTwoLists\`.`,
    examples: [
      {
        input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]',
        output: '[1, 1, 2, 3, 4, 4]',
      },
      {
        input: 'list1 = [], list2 = [3]',
        output: '[3]',
      },
    ],
    constraints: [
      '`0 <= len(list1), len(list2) <= 50`',
      '`-100 <= value <= 100`',
      'Both lists are sorted in non-decreasing order.',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def mergeTwoLists(self, list1: list[int], list2: list[int]) -> list[int]:
        a = _to_list(list1)
        b = _to_list(list2)

        # ─── Merge the two sorted linked lists below ──────────────
        # Hint: use a dummy node and a tail pointer; at each step
        # attach whichever of a, b has the smaller value, then
        # advance that pointer.
        merged_head = a if a is not None else b  # TODO: replace
        # ───────────────────────────────────────────────────────────

        return _from_list(merged_head)
`,
    },
    methodName: 'mergeTwoLists',
    argKeys: ['list1', 'list2'],
    defaultTests: [
      { label: 'Interleaved', inputJson: '{"list1":[1,2,4],"list2":[1,3,4]}', expectedJson: '[1,1,2,3,4,4]' },
      { label: 'One empty',   inputJson: '{"list1":[],"list2":[3]}',          expectedJson: '[3]'           },
      { label: 'Both empty',  inputJson: '{"list1":[],"list2":[]}',           expectedJson: '[]'            },
    ],
    resultCompare: 'exact',
  },

  // ─── Remove Duplicates from Sorted List (LC #83) ───────────────────────────
  {
    slug: 'remove-duplicates-from-sorted-list',
    lcNumber: 83,
    title: 'Remove Duplicates from Sorted List',
    difficulty: 'Easy',
    pattern: 'Traversal',
    tags: ['linked-list'],
    descriptionMd: `Given the head of a **sorted** singly linked list (values given as the array
\`values\` in head-to-tail order), remove every duplicate node so each value appears only
once, and return the resulting sequence of values.

A single forward walk is enough: whenever \`cur.next\` has the same value as \`cur\`, skip
over it by setting \`cur.next = cur.next.next\`; otherwise advance.`,
    examples: [
      {
        input: 'values = [2, 2, 3, 3, 3, 4]',
        output: '[2, 3, 4]',
      },
      {
        input: 'values = [1, 1, 1]',
        output: '[1]',
      },
    ],
    constraints: [
      '`0 <= len(values) <= 300`',
      '`-100 <= values[i] <= 100`',
      '`values` is sorted in non-decreasing order.',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def deleteDuplicates(self, values: list[int]) -> list[int]:
        head = _to_list(values)

        # ─── Remove duplicate-value nodes below ────────────────────
        # Hint: walk cur and cur.next; when values match, skip.
        new_head = head  # TODO: replace with the deduped head
        # ───────────────────────────────────────────────────────────

        return _from_list(new_head)
`,
    },
    methodName: 'deleteDuplicates',
    argKeys: ['values'],
    defaultTests: [
      { label: 'Runs',    inputJson: '{"values":[2,2,3,3,3,4]}', expectedJson: '[2,3,4]' },
      { label: 'All same',inputJson: '{"values":[1,1,1]}',       expectedJson: '[1]'     },
      { label: 'Empty',   inputJson: '{"values":[]}',            expectedJson: '[]'      },
    ],
    resultCompare: 'exact',
  },

  // ─── Remove Linked List Elements (LC #203) ─────────────────────────────────
  {
    slug: 'remove-linked-list-elements',
    lcNumber: 203,
    title: 'Remove Linked List Elements',
    difficulty: 'Easy',
    pattern: 'Traversal',
    tags: ['linked-list'],
    descriptionMd: `Given the head of a singly linked list (passed as the value array \`values\`) and
an integer \`val\`, remove **every node** whose value equals \`val\` and return the resulting
sequence of values.

A dummy head node simplifies the edge case where the original head itself needs to be
removed. Walk with a single pointer and relink around matching nodes.`,
    examples: [
      {
        input: 'values = [3, 3, 7, 3], val = 3',
        output: '[7]',
      },
      {
        input: 'values = [1, 2, 3], val = 5',
        output: '[1, 2, 3]',
      },
    ],
    constraints: [
      '`0 <= len(values) <= 10^4`',
      '`-50 <= values[i], val <= 50`',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def removeElements(self, values: list[int], val: int) -> list[int]:
        head = _to_list(values)

        # ─── Remove every node with value == val below ─────────────
        # Hint: use a dummy node so you can remove the original head.
        new_head = head  # TODO: replace with the filtered head
        # ───────────────────────────────────────────────────────────

        return _from_list(new_head)
`,
    },
    methodName: 'removeElements',
    argKeys: ['values', 'val'],
    defaultTests: [
      { label: 'Head matches', inputJson: '{"values":[3,3,7,3],"val":3}', expectedJson: '[7]'     },
      { label: 'None match',   inputJson: '{"values":[1,2,3],"val":5}',   expectedJson: '[1,2,3]' },
      { label: 'Empty',        inputJson: '{"values":[],"val":1}',        expectedJson: '[]'      },
    ],
    resultCompare: 'exact',
  },

  // ─── Linked List Cycle (LC #141) ───────────────────────────────────────────
  {
    slug: 'linked-list-cycle',
    lcNumber: 141,
    title: 'Linked List Cycle',
    difficulty: 'Easy',
    pattern: 'Fast / Slow',
    tags: ['linked-list', 'fast-slow'],
    descriptionMd: `You are given a linked list as the value array \`values\` together with an integer
\`pos\`. After building the list head-to-tail, the \`.next\` pointer of the **tail node** is
hooked back to the node at index \`pos\` (or left as \`None\` if \`pos == -1\`). Return
\`True\` if the list contains a cycle and \`False\` otherwise.

The canonical detection algorithm is Floyd's tortoise and hare: advance a \`slow\` pointer
by one and a \`fast\` pointer by two. If they ever meet, there's a cycle; if \`fast\` falls
off the end, there is not.`,
    examples: [
      {
        input: 'values = [3, 2, 0, -4], pos = 1',
        output: 'True',
        explanation: 'Node 3 → 2 → 0 → -4 → (back to node 2). Cycle detected.',
      },
      {
        input: 'values = [1, 2, 3], pos = -1',
        output: 'False',
      },
    ],
    constraints: [
      '`0 <= len(values) <= 10^4`',
      '`-10^5 <= values[i] <= 10^5`',
      '`pos == -1` or `0 <= pos < len(values)`',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
def _build_cyclic(values, pos):
    head = _to_list(values)
    if head is None or pos == -1:
        return head
    # Find the tail and the node at index pos.
    tail = head
    while tail.next is not None:
        tail = tail.next
    node = head
    for _ in range(pos):
        node = node.next
    tail.next = node
    return head


class Solution:
    def hasCycle(self, values: list[int], pos: int) -> bool:
        head = _build_cyclic(values, pos)

        # ─── Detect whether the list has a cycle below ─────────────
        # Hint: Floyd's tortoise and hare pointers.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'hasCycle',
    argKeys: ['values', 'pos'],
    defaultTests: [
      { label: 'Cycle exists', inputJson: '{"values":[3,2,0,-4],"pos":1}', expectedJson: 'true'  },
      { label: 'No cycle',     inputJson: '{"values":[1,2,3],"pos":-1}',   expectedJson: 'false' },
      { label: 'Single cycle', inputJson: '{"values":[1,2],"pos":0}',      expectedJson: 'true'  },
      { label: 'Empty',        inputJson: '{"values":[],"pos":-1}',        expectedJson: 'false' },
    ],
    resultCompare: 'exact',
  },

  // ─── Middle of the Linked List (LC #876) ───────────────────────────────────
  {
    slug: 'middle-of-the-linked-list',
    lcNumber: 876,
    title: 'Middle of the Linked List',
    difficulty: 'Easy',
    pattern: 'Fast / Slow',
    tags: ['linked-list', 'fast-slow'],
    descriptionMd: `Given the head of a non-empty singly linked list (as the value array \`values\`),
return the values from the **middle node** to the end of the list (inclusive). If the list
has an even number of nodes, use the **second** middle.

The fast/slow pointer trick finds the middle in a single pass: advance \`fast\` by two steps
and \`slow\` by one, and when \`fast\` falls off the end \`slow\` will be at the middle.`,
    examples: [
      {
        input: 'values = [1, 2, 3, 4, 5]',
        output: '[3, 4, 5]',
      },
      {
        input: 'values = [1, 2, 3, 4, 5, 6]',
        output: '[4, 5, 6]',
        explanation: 'Even length — the second middle is node 4.',
      },
    ],
    constraints: [
      '`1 <= len(values) <= 100`',
      '`-100 <= values[i] <= 100`',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def middleNode(self, values: list[int]) -> list[int]:
        head = _to_list(values)

        # ─── Find the middle node below ────────────────────────────
        # Hint: fast/slow pointers; fast moves by two, slow by one.
        mid = head  # TODO: replace with the middle node
        # ───────────────────────────────────────────────────────────

        return _from_list(mid)
`,
    },
    methodName: 'middleNode',
    argKeys: ['values'],
    defaultTests: [
      { label: 'Odd length',  inputJson: '{"values":[1,2,3,4,5]}',   expectedJson: '[3,4,5]'   },
      { label: 'Even length', inputJson: '{"values":[1,2,3,4,5,6]}', expectedJson: '[4,5,6]'   },
      { label: 'Single node', inputJson: '{"values":[7]}',           expectedJson: '[7]'       },
    ],
    resultCompare: 'exact',
  },

  // ─── Remove Nth Node From End of List (LC #19) ─────────────────────────────
  {
    slug: 'remove-nth-node-from-end-of-list',
    lcNumber: 19,
    title: 'Remove Nth Node From End of List',
    difficulty: 'Medium',
    pattern: 'Two Pointers',
    tags: ['linked-list', 'two-pointers'],
    descriptionMd: `You are given a singly linked list (as \`values\`) and a positive integer \`n\`.
Remove the **nth-to-last** node of the list and return the resulting sequence of values.

The classic one-pass approach uses two pointers separated by \`n\` nodes. Advance them
together until the leading pointer reaches the end; the trailing pointer is then positioned
immediately before the node to delete.`,
    examples: [
      {
        input: 'values = [1, 2, 3, 4, 5], n = 1',
        output: '[1, 2, 3, 4]',
      },
      {
        input: 'values = [1], n = 1',
        output: '[]',
      },
    ],
    constraints: [
      '`1 <= len(values) <= 30`',
      '`0 <= values[i] <= 100`',
      '`1 <= n <= len(values)`',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def removeNthFromEnd(self, values: list[int], n: int) -> list[int]:
        head = _to_list(values)

        # ─── Remove the nth-from-last node below ───────────────────
        # Hint: use a dummy node and two pointers separated by n.
        new_head = head  # TODO: replace with the updated head
        # ───────────────────────────────────────────────────────────

        return _from_list(new_head)
`,
    },
    methodName: 'removeNthFromEnd',
    argKeys: ['values', 'n'],
    defaultTests: [
      { label: 'Last removed',  inputJson: '{"values":[1,2,3,4,5],"n":1}', expectedJson: '[1,2,3,4]' },
      { label: 'Second from end', inputJson: '{"values":[1,2,3,4,5],"n":2}', expectedJson: '[1,2,3,5]' },
      { label: 'Whole list',    inputJson: '{"values":[1],"n":1}',         expectedJson: '[]'        },
      { label: 'Head removed',  inputJson: '{"values":[1,2],"n":2}',       expectedJson: '[2]'       },
    ],
    resultCompare: 'exact',
  },

  // ─── Palindrome Linked List (LC #234) ──────────────────────────────────────
  {
    slug: 'palindrome-linked-list',
    lcNumber: 234,
    title: 'Palindrome Linked List',
    difficulty: 'Easy',
    pattern: 'Fast / Slow',
    tags: ['linked-list', 'fast-slow'],
    descriptionMd: `Given the head of a singly linked list (as \`values\`), return \`True\` if the list
reads the same forwards and backwards, \`False\` otherwise.

The \`O(n)\` time / \`O(1)\` extra memory approach walks to the middle with fast/slow
pointers, reverses the second half in place, then compares the two halves node by node.`,
    examples: [
      {
        input: 'values = [1, 2, 2, 1]',
        output: 'True',
      },
      {
        input: 'values = [1, 2]',
        output: 'False',
      },
    ],
    constraints: [
      '`0 <= len(values) <= 10^5`',
      '`0 <= values[i] <= 9`',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def isPalindrome(self, values: list[int]) -> bool:
        head = _to_list(values)

        # ─── Decide whether the list is a palindrome below ─────────
        # Hint: fast/slow to the middle, reverse the second half, compare.
        pass
        # ───────────────────────────────────────────────────────────
`,
    },
    methodName: 'isPalindrome',
    argKeys: ['values'],
    defaultTests: [
      { label: 'Even palindrome',  inputJson: '{"values":[1,2,2,1]}', expectedJson: 'true'  },
      { label: 'Not palindrome',   inputJson: '{"values":[1,2]}',     expectedJson: 'false' },
      { label: 'Odd palindrome',   inputJson: '{"values":[3,5,3]}',   expectedJson: 'true'  },
      { label: 'Single',           inputJson: '{"values":[7]}',       expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Reorder List (LC #143) ────────────────────────────────────────────────
  {
    slug: 'reorder-list',
    lcNumber: 143,
    title: 'Reorder List',
    difficulty: 'Medium',
    pattern: 'Fast / Slow',
    tags: ['linked-list', 'fast-slow'],
    descriptionMd: `Given the head of a singly linked list (as \`values\`), reorder it so that the
sequence becomes:

\`L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …\`

and return the reordered sequence as a list of values.

The three-step template is: (1) find the middle with fast/slow; (2) reverse the second half
in place; (3) interleave the two halves one node at a time.`,
    examples: [
      {
        input: 'values = [1, 2, 3, 4]',
        output: '[1, 4, 2, 3]',
      },
      {
        input: 'values = [1, 2, 3, 4, 5]',
        output: '[1, 5, 2, 4, 3]',
      },
    ],
    constraints: [
      '`1 <= len(values) <= 5 * 10^4`',
      '`0 <= values[i] <= 1000`',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def reorderList(self, values: list[int]) -> list[int]:
        head = _to_list(values)

        # ─── Reorder the list in place below ───────────────────────
        # Hint: find middle with fast/slow, reverse the second half, weave.
        new_head = head  # TODO: replace with the reordered head
        # ───────────────────────────────────────────────────────────

        return _from_list(new_head)
`,
    },
    methodName: 'reorderList',
    argKeys: ['values'],
    defaultTests: [
      { label: 'Even length', inputJson: '{"values":[1,2,3,4]}',   expectedJson: '[1,4,2,3]'   },
      { label: 'Odd length',  inputJson: '{"values":[1,2,3,4,5]}', expectedJson: '[1,5,2,4,3]' },
      { label: 'Single',      inputJson: '{"values":[1]}',         expectedJson: '[1]'         },
    ],
    resultCompare: 'exact',
  },

  // ─── Add Two Numbers (LC #2) ───────────────────────────────────────────────
  {
    slug: 'add-two-numbers',
    lcNumber: 2,
    title: 'Add Two Numbers',
    difficulty: 'Medium',
    pattern: 'Math',
    tags: ['linked-list', 'math'],
    descriptionMd: `You are given two non-negative integers represented by the linked lists \`l1\` and
\`l2\`. The **digits are stored in reverse order** — that is, the head holds the **ones**
digit, the next node holds the **tens** digit, and so on. Return the sum as a linked list in
the same reversed form.

For example, \`[9, 9]\` represents 99 and \`[1]\` represents 1, so \`[9, 9] + [1]\` is
\`[0, 0, 1]\` (which represents 100).

The school-book addition algorithm generalises directly: walk both lists with a running
carry, emitting \`(a + b + carry) % 10\` at each step.`,
    examples: [
      {
        input: 'l1 = [9, 9], l2 = [1]',
        output: '[0, 0, 1]',
        explanation: '99 + 1 = 100, reversed to [0, 0, 1].',
      },
      {
        input: 'l1 = [0], l2 = [0]',
        output: '[0]',
      },
    ],
    constraints: [
      '`1 <= len(l1), len(l2) <= 100`',
      '`0 <= l1[i], l2[i] <= 9`',
      'Neither list has leading zeros except the number 0 itself.',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def addTwoNumbers(self, l1: list[int], l2: list[int]) -> list[int]:
        a = _to_list(l1)
        b = _to_list(l2)

        # ─── Add the two reversed-digit numbers below ──────────────
        # Hint: walk both lists with a running carry, build a dummy head.
        sum_head = a if a is not None else b  # TODO: replace
        # ───────────────────────────────────────────────────────────

        return _from_list(sum_head)
`,
    },
    methodName: 'addTwoNumbers',
    argKeys: ['l1', 'l2'],
    defaultTests: [
      { label: 'Carry grows',    inputJson: '{"l1":[9,9],"l2":[1]}',     expectedJson: '[0,0,1]' },
      { label: 'Zeros',          inputJson: '{"l1":[0],"l2":[0]}',       expectedJson: '[0]'     },
      { label: 'Different lens', inputJson: '{"l1":[1],"l2":[9,9]}',     expectedJson: '[0,0,1]' },
      { label: 'No carry',       inputJson: '{"l1":[2,4,3],"l2":[5,6,4]}', expectedJson: '[7,0,8]' },
    ],
    resultCompare: 'exact',
  },

  // ─── Copy List with Random Pointer (LC #138) ───────────────────────────────
  {
    slug: 'copy-list-with-random-pointer',
    lcNumber: 138,
    title: 'Copy List with Random Pointer',
    difficulty: 'Medium',
    pattern: 'Hash Map',
    tags: ['linked-list', 'hash-map'],
    descriptionMd: `You are given a linked list where every node has, in addition to its \`next\`
pointer, a \`random\` pointer that points to **any node in the list or \`None\`**. Return a
**deep copy** of the list.

The list is serialised as \`nodes\`, a list of \`[val, random_index]\` pairs (in head-to-tail
order). \`random_index\` is the 0-based index of the node this node's random pointer points
at, or \`null\` if it points to nothing. Your deep copy should be returned in the same
serialised shape.

The classic approaches are (a) a hash map from original node to new node, or (b) interleaving
the cloned nodes into the original list in place and then splitting them back out.`,
    examples: [
      {
        input: 'nodes = [[3, null], [5, 0], [7, 1]]',
        output: '[[3, null], [5, 0], [7, 1]]',
        explanation: 'The copy has the same structure as the original.',
      },
      {
        input: 'nodes = []',
        output: '[]',
      },
    ],
    constraints: [
      '`0 <= len(nodes) <= 1000`',
      '`random_index` is either `null` or a valid index in `nodes`.',
    ],
    starterCode: {
      python: `class Node:
    def __init__(self, val: int, nxt=None, random=None):
        self.val = val
        self.next = nxt
        self.random = random


def _to_rand_list(nodes):
    if not nodes:
        return None
    built = [Node(v) for v, _ in nodes]
    for i, (_, r) in enumerate(nodes):
        if i + 1 < len(built):
            built[i].next = built[i + 1]
        built[i].random = built[r] if r is not None else None
    return built[0]


def _from_rand_list(head):
    if head is None:
        return []
    # Walk to collect node order.
    order = []
    cur = head
    while cur is not None:
        order.append(cur)
        cur = cur.next
    index_of = {id(n): i for i, n in enumerate(order)}
    out = []
    for n in order:
        r = None if n.random is None else index_of[id(n.random)]
        out.append([n.val, r])
    return out


class Solution:
    def copyRandomList(self, nodes: list) -> list:
        head = _to_rand_list(nodes)

        # ─── Produce a deep copy of the list below ─────────────────
        # Hint: a hash map from original node to new node makes the
        # second pass that wires next/random trivial.
        new_head = head  # TODO: replace with the deep-copied head
        # ───────────────────────────────────────────────────────────

        return _from_rand_list(new_head)
`,
    },
    methodName: 'copyRandomList',
    argKeys: ['nodes'],
    defaultTests: [
      { label: 'Three nodes', inputJson: '{"nodes":[[3,null],[5,0],[7,1]]}', expectedJson: '[[3,null],[5,0],[7,1]]' },
      { label: 'Empty',       inputJson: '{"nodes":[]}',                       expectedJson: '[]' },
      { label: 'Single',      inputJson: '{"nodes":[[1,null]]}',               expectedJson: '[[1,null]]' },
    ],
    resultCompare: 'exact',
  },

  // ─── Reverse Nodes in k-Group (LC #25) ─────────────────────────────────────
  {
    slug: 'reverse-nodes-in-k-group',
    lcNumber: 25,
    title: 'Reverse Nodes in k-Group',
    difficulty: 'Hard',
    pattern: 'Recursion',
    tags: ['linked-list'],
    descriptionMd: `Given the head of a singly linked list (as \`values\`) and a positive integer \`k\`,
reverse the nodes \`k\` at a time and return the modified list as an array of values. If the
remaining nodes at the end of the list number fewer than \`k\`, **leave them in their
original order**.

You should aim for \`O(1)\` extra memory beyond the input (no allocating auxiliary lists to
hold the temporary order). Either a recursive or an iterative solution is fine.`,
    examples: [
      {
        input: 'values = [1, 2, 3, 4, 5], k = 2',
        output: '[2, 1, 4, 3, 5]',
      },
      {
        input: 'values = [1, 2, 3, 4, 5], k = 3',
        output: '[3, 2, 1, 4, 5]',
      },
    ],
    constraints: [
      '`0 <= len(values) <= 5000`',
      '`0 <= values[i] <= 1000`',
      '`1 <= k <= len(values) or len(values) == 0`',
    ],
    starterCode: {
      python: `${LIST_NODE_HELPERS}
class Solution:
    def reverseKGroup(self, values: list[int], k: int) -> list[int]:
        head = _to_list(values)

        # ─── Reverse nodes in groups of k below ────────────────────
        # Hint: count k nodes ahead; if fewer than k remain, stop.
        new_head = head  # TODO: replace with the reordered head
        # ───────────────────────────────────────────────────────────

        return _from_list(new_head)
`,
    },
    methodName: 'reverseKGroup',
    argKeys: ['values', 'k'],
    defaultTests: [
      { label: 'Groups of 2', inputJson: '{"values":[1,2,3,4,5],"k":2}', expectedJson: '[2,1,4,3,5]' },
      { label: 'Groups of 3', inputJson: '{"values":[1,2,3,4,5],"k":3}', expectedJson: '[3,2,1,4,5]' },
      { label: 'Tail leftover', inputJson: '{"values":[1,2,3],"k":4}',   expectedJson: '[1,2,3]'     },
      { label: 'Empty',         inputJson: '{"values":[],"k":1}',        expectedJson: '[]'          },
    ],
    resultCompare: 'exact',
  },
];
