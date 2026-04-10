class Solution:
    def fib(self, n: int) -> int:
        if n < 2:
            return n
        a, b = 0, 1
        for _ in range(n - 1):
            a, b = b, a + b
        return b
