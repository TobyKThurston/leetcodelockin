// ─── Shared Python starter-code helpers ──────────────────────────────────────
//
// String constants reused by per-category problem files so the linked-list /
// tree starter blocks stay byte-identical across hundreds of problems. Drop
// one of these at the top of a `starterCode.python` template and follow it
// with the actual `class Solution:` body.

export const LIST_NODE_HELPERS = `class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt

def _to_list(arr):
    """Build a linked list of ListNodes from a Python list. Returns the head."""
    head = None
    for v in reversed(arr):
        head = ListNode(v, head)
    return head

def _from_list(head):
    """Walk a linked list of ListNodes and return its values as a Python list."""
    out = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out
`;

// ─── TreeNode helpers ─────────────────────────────────────────────────────────
//
// Trees are serialised as level-order arrays with `null` for absent children,
// matching LeetCode's own convention (so learners can copy/paste examples).
// `_to_tree` parses that array into TreeNode objects; `_from_tree` walks the
// tree back to the same level-order array (trailing nulls stripped).

export const TREE_NODE_HELPERS = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def _to_tree(arr):
    """Build a binary tree from a level-order list with None for missing nodes."""
    if not arr:
        return None
    it = iter(arr)
    root_val = next(it)
    if root_val is None:
        return None
    root = TreeNode(root_val)
    queue = [root]
    while queue:
        node = queue.pop(0)
        try:
            lv = next(it)
        except StopIteration:
            break
        if lv is not None:
            node.left = TreeNode(lv)
            queue.append(node.left)
        try:
            rv = next(it)
        except StopIteration:
            break
        if rv is not None:
            node.right = TreeNode(rv)
            queue.append(node.right)
    return root

def _from_tree(root):
    """Walk a binary tree level-order and return [val, val, None, ...] with trailing Nones stripped."""
    if root is None:
        return []
    out = []
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        queue.append(node.left)
        queue.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out
`;
