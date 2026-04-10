import heapq


class Solution:
    def findKthLargest(self, nums: list[int], k: int) -> int:
        heap = []
        for v in nums:
            heapq.heappush(heap, v)
            if len(heap) > k:
                heapq.heappop(heap)
        return heap[0]
