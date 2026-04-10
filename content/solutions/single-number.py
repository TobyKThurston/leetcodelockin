class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        result = 0
        for v in nums:
            result ^= v
        return result
