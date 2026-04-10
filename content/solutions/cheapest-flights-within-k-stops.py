class Solution:
    def findCheapestPrice(self, n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
        INF = float('inf')
        dist = [INF] * n
        dist[src] = 0
        for _ in range(k + 1):
            snapshot = dist[:]
            for u, v, w in flights:
                if snapshot[u] != INF and snapshot[u] + w < dist[v]:
                    dist[v] = snapshot[u] + w
        return -1 if dist[dst] == INF else dist[dst]
