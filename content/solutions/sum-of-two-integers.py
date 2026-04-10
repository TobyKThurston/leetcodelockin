class Solution:
    def getSum(self, a: int, b: int) -> int:
        MASK = 0xFFFFFFFF
        SIGN = 0x80000000
        while b & MASK:
            carry = (a & b) << 1
            a = (a ^ b) & MASK
            b = carry & MASK
        if a & SIGN:
            return a - (1 << 32)
        return a
