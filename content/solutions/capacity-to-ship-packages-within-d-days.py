class Solution:
    def shipWithinDays(self, weights: list[int], days: int) -> int:
        def can_ship(cap: int) -> bool:
            used = 1
            cur = 0
            for w in weights:
                if cur + w > cap:
                    used += 1
                    cur = 0
                cur += w
            return used <= days

        lo, hi = max(weights), sum(weights)
        while lo < hi:
            mid = (lo + hi) // 2
            if can_ship(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo
