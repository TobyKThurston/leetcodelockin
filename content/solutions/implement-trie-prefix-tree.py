class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
        node['$'] = True

    def _walk(self, s: str):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.get('$', False)

    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None


class Solution:
    def runTrieOps(self, ops: list[str], vals: list[list[str]]) -> list:
        tr = Trie()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(tr, op)(*args)
            out.append(result)
        return out
