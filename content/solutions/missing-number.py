class Solution:
    def missingNumber(self, nums: list[int]) -> int:
        n = len(nums)
        result = n
        for i, v in enumerate(nums):
            result ^= i ^ v
        return result
