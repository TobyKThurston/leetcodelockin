class Solution:
    def splitArray(self, nums: list[int], k: int) -> int:
        def can_split(limit: int) -> bool:
            parts = 1
            cur = 0
            for v in nums:
                if cur + v > limit:
                    parts += 1
                    cur = 0
                cur += v
            return parts <= k

        lo, hi = max(nums), sum(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if can_split(mid):
                hi = mid
            else:
                lo = mid + 1
        return lo
