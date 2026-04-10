class StockSpanner:
    def __init__(self):
        self.stack = []  # (price, span)

    def next(self, price: int) -> int:
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span


class Solution:
    def runStockSpanOps(self, ops: list[str], vals: list[list[int]]) -> list[int]:
        ss = StockSpanner()
        out = []
        for op, args in zip(ops, vals):
            out.append(ss.next(*args))
        return out
