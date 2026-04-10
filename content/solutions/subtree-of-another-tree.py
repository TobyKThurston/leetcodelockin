class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def _to_tree(arr):
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
