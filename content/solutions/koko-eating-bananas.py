class Solution:
    def minEatingSpeed(self, piles: list[int], h: int) -> int:
        def hours_at(k: int) -> int:
            total = 0
            for p in piles:
                total += (p + k - 1) // k
            return total

        lo, hi = 1, max(piles)
        while lo < hi:
            mid = (lo + hi) // 2
            if hours_at(mid) <= h:
                hi = mid
            else:
                lo = mid + 1
        return lo
