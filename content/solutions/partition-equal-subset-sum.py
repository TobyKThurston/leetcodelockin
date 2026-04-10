class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        total = sum(nums)
        if total % 2 != 0:
            return False
        target = total // 2
        dp = [False] * (target + 1)
        dp[0] = True
        for v in nums:
            for s in range(target, v - 1, -1):
                if dp[s - v]:
                    dp[s] = True
        return dp[target]
