class Solution:
    def firstBadVersion(self, n: int, bad: int) -> int:
        lo, hi = 1, n
        while lo < hi:
            mid = (lo + hi) // 2
            if mid >= bad:
                hi = mid
            else:
                lo = mid + 1
        return lo
