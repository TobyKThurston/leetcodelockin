class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        intervals = sorted(intervals, key=lambda x: x[1])
        kept_end = float('-inf')
        kept = 0
        for a, b in intervals:
            if a >= kept_end:
                kept += 1
                kept_end = b
        return len(intervals) - kept
