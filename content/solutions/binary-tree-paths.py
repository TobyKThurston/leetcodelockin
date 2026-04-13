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
    def binaryTreePaths(self, root: list) -> list[str]:
        tree = _to_tree(root)
        paths: list[str] = []

        def dfs(node, trail):
            if node is None:
                return
            trail.append(str(node.val))
            if node.left is None and node.right is None:
                paths.append("->".join(trail))
            else:
                dfs(node.left, trail)
                dfs(node.right, trail)
            trail.pop()

        dfs(tree, [])
        return paths
