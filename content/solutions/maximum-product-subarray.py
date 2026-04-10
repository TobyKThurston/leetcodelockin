class Solution:
    def maxProduct(self, nums: list[int]) -> int:
        best = cur_max = cur_min = nums[0]
        for v in nums[1:]:
            if v < 0:
                cur_max, cur_min = cur_min, cur_max
            cur_max = max(v, cur_max * v)
            cur_min = min(v, cur_min * v)
            if cur_max > best:
                best = cur_max
        return best
