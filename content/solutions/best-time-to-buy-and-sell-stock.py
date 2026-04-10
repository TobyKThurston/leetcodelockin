class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        best = 0
        lo = prices[0]
        for p in prices:
            if p < lo:
                lo = p
            elif p - lo > best:
                best = p - lo
        return best
