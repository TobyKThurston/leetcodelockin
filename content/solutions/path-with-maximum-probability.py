import heapq


class Solution:
    def maxProbability(self, n: int, edges: list[list[int]], succProb: list[float], start: int, end: int) -> float:
        graph = [[] for _ in range(n)]
        for (u, v), p in zip(edges, succProb):
            graph[u].append((v, p))
            graph[v].append((u, p))
        # Max-heap by negating probabilities.
        best = [0.0] * n
        best[start] = 1.0
        heap = [(-1.0, start)]
        while heap:
            neg_p, u = heapq.heappop(heap)
            p = -neg_p
            if u == end:
                return p
            if p < best[u]:
                continue
            for v, pw in graph[u]:
                np = p * pw
                if np > best[v]:
                    best[v] = np
                    heapq.heappush(heap, (-np, v))
        return 0.0
