import heapq


class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = []
        for v in nums:
            self.add_initial(v)

    def add_initial(self, val: int):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]


class Solution:
    def runKthLargestOps(self, k: int, nums: list[int], ops: list[str], vals: list[list[int]]) -> list[int]:
        kl = KthLargest(k, nums)
        out = []
        for op, args in zip(ops, vals):
            out.append(getattr(kl, op)(*args))
        return out
