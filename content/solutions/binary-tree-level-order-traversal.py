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
