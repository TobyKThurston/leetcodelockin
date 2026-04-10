class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        dp = [0] * (amount + 1)
        dp[0] = 1
        for c in coins:
            for s in range(c, amount + 1):
                dp[s] += dp[s - c]
        return dp[amount]
