import heapq


class Solution:
    def minimumEffortPath(self, heights: list[list[int]]) -> int:
        m = len(heights)
        n = len(heights[0]) if m else 0
        INF = float('inf')
        effort = [[INF] * n for _ in range(m)]
        effort[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            e, r, c = heapq.heappop(heap)
            if r == m - 1 and c == n - 1:
                return e
            if e > effort[r][c]:
                continue
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    ne = max(e, abs(heights[nr][nc] - heights[r][c]))
                    if ne < effort[nr][nc]:
                        effort[nr][nc] = ne
                        heapq.heappush(heap, (ne, nr, nc))
        return 0
