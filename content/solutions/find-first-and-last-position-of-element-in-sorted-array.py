class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        def lower():
            lo, hi = 0, len(nums)
            while lo < hi:
                m = (lo + hi) // 2
                if nums[m] < target:
                    lo = m + 1
                else:
                    hi = m
            return lo

        def upper():
            lo, hi = 0, len(nums)
            while lo < hi:
                m = (lo + hi) // 2
                if nums[m] <= target:
                    lo = m + 1
                else:
                    hi = m
            return lo

        lb = lower()
        ub = upper()
        if lb == ub:
            return [-1, -1]
        return [lb, ub - 1]
