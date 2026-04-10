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
