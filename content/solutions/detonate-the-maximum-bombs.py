from collections import deque


class Solution:
    def maximumDetonation(self, bombs: list[list[int]]) -> int:
        n = len(bombs)
        # Build directed graph: i -> j if bomb i triggers bomb j.
        graph = [[] for _ in range(n)]
        for i in range(n):
            xi, yi, ri = bombs[i]
            for j in range(n):
                if i == j:
                    continue
                xj, yj, _ = bombs[j]
                dx = xi - xj
                dy = yi - yj
                if dx * dx + dy * dy <= ri * ri:
                    graph[i].append(j)
        best = 0
        for start in range(n):
            seen = {start}
            queue = deque([start])
            while queue:
                cur = queue.popleft()
                for nb in graph[cur]:
                    if nb not in seen:
                        seen.add(nb)
                        queue.append(nb)
            if len(seen) > best:
                best = len(seen)
        return best
