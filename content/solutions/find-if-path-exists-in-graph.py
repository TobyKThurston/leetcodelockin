from collections import deque


class Solution:
    def validPath(self, n: int, edges: list[list[int]], source: int, destination: int) -> bool:
        if source == destination:
            return True
        graph: list[list[int]] = [[] for _ in range(n)]
        for u, v in edges:
            graph[u].append(v)
            graph[v].append(u)
        seen = {source}
        queue = deque([source])
        while queue:
            node = queue.popleft()
            for nb in graph[node]:
                if nb == destination:
                    return True
                if nb not in seen:
                    seen.add(nb)
                    queue.append(nb)
        return False
