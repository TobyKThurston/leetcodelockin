class Solution:
    def canJump(self, nums: list[int]) -> bool:
        reach = 0
        for i, v in enumerate(nums):
            if i > reach:
                return False
            if i + v > reach:
                reach = i + v
        return True
