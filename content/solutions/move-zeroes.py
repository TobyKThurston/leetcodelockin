class Solution:
    def moveZeroes(self, nums: list[int]) -> list[int]:
        w = 0
        for r in range(len(nums)):
            if nums[r] != 0:
                nums[w], nums[r] = nums[r], nums[w]
                w += 1
        return nums
