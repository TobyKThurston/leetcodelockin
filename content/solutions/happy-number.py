class Solution:
    def isHappy(self, n: int) -> bool:
        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            total = 0
            while n > 0:
                d = n % 10
                total += d * d
                n //= 10
            n = total
        return n == 1
