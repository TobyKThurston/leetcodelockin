from collections import deque


class Solution:
    def alienOrder(self, words: list[str]) -> str:
        letters = set()
        for w in words:
            for ch in w:
                letters.add(ch)
        graph = {c: set() for c in letters}
        indeg = {c: 0 for c in letters}
        for i in range(len(words) - 1):
            a, b = words[i], words[i + 1]
            # Invalid: a is longer than b but b is a prefix of a.
            if len(a) > len(b) and a.startswith(b):
                return ""
            for x, y in zip(a, b):
                if x != y:
                    if y not in graph[x]:
                        graph[x].add(y)
                        indeg[y] += 1
                    break
        queue = deque([c for c in letters if indeg[c] == 0])
        out = []
        while queue:
            cur = queue.popleft()
            out.append(cur)
            for nb in graph[cur]:
                indeg[nb] -= 1
                if indeg[nb] == 0:
                    queue.append(nb)
        if len(out) != len(letters):
            return ""
        return ''.join(out)
