import heapq


class MedianFinder:
    def __init__(self):
        self.lower = []  # max-heap (store negated)
        self.upper = []  # min-heap

    def addNum(self, num: int) -> None:
        heapq.heappush(self.lower, -num)
        # Push the top of lower into upper to maintain ordering.
        heapq.heappush(self.upper, -heapq.heappop(self.lower))
        # Rebalance so len(lower) >= len(upper).
        if len(self.upper) > len(self.lower):
            heapq.heappush(self.lower, -heapq.heappop(self.upper))

    def findMedian(self) -> float:
        if len(self.lower) > len(self.upper):
            return float(-self.lower[0])
        return (-self.lower[0] + self.upper[0]) / 2


class Solution:
    def runMedianOps(self, ops: list[str], vals: list[list[int]]) -> list:
        mf = MedianFinder()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(mf, op)(*args)
            out.append(result)
        return out
