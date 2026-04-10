import heapq


class Solution:
    def kthSmallest(self, matrix: list[list[int]], k: int) -> int:
        n = len(matrix)
        heap = [(matrix[0][c], 0, c) for c in range(n)]
        heapq.heapify(heap)
        for _ in range(k - 1):
            val, r, c = heapq.heappop(heap)
            if r + 1 < n:
                heapq.heappush(heap, (matrix[r + 1][c], r + 1, c))
        return heap[0][0]
