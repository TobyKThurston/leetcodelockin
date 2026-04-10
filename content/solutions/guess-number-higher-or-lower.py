class Solution:
    def guessNumber(self, n: int, pick: int) -> int:
        lo, hi = 1, n
        while lo < hi:
            mid = (lo + hi) // 2
            if mid == pick:
                return mid
            if mid < pick:
                lo = mid + 1
            else:
                hi = mid - 1
        return lo
