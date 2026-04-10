class Solution:
    def minCostClimbingStairs(self, cost: list[int]) -> int:
        a = b = 0
        for i in range(2, len(cost) + 1):
            cur = min(a + cost[i - 2], b + cost[i - 1])
            a, b = b, cur
        return b
