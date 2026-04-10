class Solution:
    def rob(self, nums: list[int]) -> int:
        if len(nums) == 1:
            return nums[0]

        def rob_line(arr):
            prev = prev2 = 0
            for v in arr:
                prev, prev2 = max(prev, prev2 + v), prev
            return prev

        return max(rob_line(nums[:-1]), rob_line(nums[1:]))
