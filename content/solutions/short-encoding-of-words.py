class Solution:
    def minimumLengthEncoding(self, words: list[str]) -> int:
        # Build a trie from reversed words; count leaves.
        root = {}
        leaves = {}
        for w in set(words):
            node = root
            for ch in reversed(w):
                if ch not in node:
                    node[ch] = {}
                node = node[ch]
            leaves[id(node)] = len(w) + 1
        # A node is a "leaf" if it has no children beyond what's been added;
        # but we need to exclude nodes that later gained children.
        # Walk the trie and recompute: a node is a leaf iff it has no children.
        def walk(node):
            if not node:
                return 0
            total = 0
            for child in node.values():
                total += walk(child)
            if not node:
                return 0
            return total

        total = 0

        def dfs(node, depth):
            nonlocal total
            if not node:
                total += depth + 1
                return
            for child in node.values():
                dfs(child, depth + 1)

        dfs(root, 0)
        return total
