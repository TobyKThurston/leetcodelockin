class Solution:
    def deleteAndEarn(self, nums: list[int]) -> int:
        if not nums:
            return 0
        max_v = max(nums)
        points = [0] * (max_v + 1)
        for v in nums:
            points[v] += v
        prev = prev2 = 0
        for v in range(len(points)):
            prev, prev2 = max(prev, prev2 + points[v]), prev
        return prev
