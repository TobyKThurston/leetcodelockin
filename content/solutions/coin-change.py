class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        INF = amount + 1
        dp = [INF] * (amount + 1)
        dp[0] = 0
        for i in range(1, amount + 1):
            for c in coins:
                if c <= i and dp[i - c] + 1 < dp[i]:
                    dp[i] = dp[i - c] + 1
        return -1 if dp[amount] >= INF else dp[amount]
