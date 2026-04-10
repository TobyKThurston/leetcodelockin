import heapq


class Solution:
    def minCostConnectPoints(self, points: list[list[int]]) -> int:
        n = len(points)
        if n <= 1:
            return 0
        in_mst = [False] * n
        min_edge = [float('inf')] * n
        min_edge[0] = 0
        total = 0
        heap = [(0, 0)]
        while heap:
            cost, u = heapq.heappop(heap)
            if in_mst[u]:
                continue
            in_mst[u] = True
            total += cost
            xu, yu = points[u]
            for v in range(n):
                if in_mst[v]:
                    continue
                xv, yv = points[v]
                d = abs(xu - xv) + abs(yu - yv)
                if d < min_edge[v]:
                    min_edge[v] = d
                    heapq.heappush(heap, (d, v))
        return total
