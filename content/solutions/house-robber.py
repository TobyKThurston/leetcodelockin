class Solution:
    def rob(self, nums: list[int]) -> int:
        prev = prev2 = 0
        for v in nums:
            prev, prev2 = max(prev, prev2 + v), prev
        return prev
