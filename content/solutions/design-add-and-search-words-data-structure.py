class WordDictionary:
    def __init__(self):
        self.root = {}

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
        node['$'] = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return node.get('$', False)
            ch = word[i]
            if ch == '.':
                for k, child in node.items():
                    if k == '$':
                        continue
                    if dfs(child, i + 1):
                        return True
                return False
            return ch in node and dfs(node[ch], i + 1)
        return dfs(self.root, 0)


class Solution:
    def runWordDictOps(self, ops: list[str], vals: list[list[str]]) -> list:
        wd = WordDictionary()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(wd, op)(*args)
            out.append(result)
        return out
