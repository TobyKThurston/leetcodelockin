class Solution:
    def jump(self, nums: list[int]) -> int:
        jumps = 0
        cur_end = 0
        farthest = 0
        for i in range(len(nums) - 1):
            if i + nums[i] > farthest:
                farthest = i + nums[i]
            if i == cur_end:
                jumps += 1
                cur_end = farthest
        return jumps
