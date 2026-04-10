class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def _from_tree(root):
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


class Solution:
    def buildTree(self, preorder: list[int], inorder: list[int]) -> list:
        if not preorder:
            return []
        index_of = {v: i for i, v in enumerate(inorder)}
        pre_iter = iter(preorder)

        def build(lo: int, hi: int):
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
