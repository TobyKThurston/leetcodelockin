class Solution:
    def findTargetSumWays(self, nums: list[int], target: int) -> int:
        total = sum(nums)
        if abs(target) > total or (total + target) % 2 != 0:
            return 0
        p = (total + target) // 2
        if p < 0:
            return 0
        dp = [0] * (p + 1)
        dp[0] = 1
        for v in nums:
            for s in range(p, v - 1, -1):
                dp[s] += dp[s - v]
        return dp[p]
