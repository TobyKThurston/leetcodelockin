class Solution:
    def numSquares(self, n: int) -> int:
        dp = [0] * (n + 1)
        for i in range(1, n + 1):
            best = i  # worst case: all 1s
            j = 1
            while j * j <= i:
                best = min(best, dp[i - j * j] + 1)
                j += 1
            dp[i] = best
        return dp[n]
