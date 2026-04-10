class Solution:
    def removeCoveredIntervals(self, intervals: list[list[int]]) -> int:
        intervals = sorted(intervals, key=lambda x: (x[0], -x[1]))
        kept = 0
        best_end = 0
        for a, b in intervals:
            if b > best_end:
                kept += 1
                best_end = b
        return kept
