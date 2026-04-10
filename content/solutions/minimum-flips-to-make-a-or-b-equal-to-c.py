class Solution:
    def minFlips(self, a: int, b: int, c: int) -> int:
        flips = 0
        while a or b or c:
            ab = (a & 1) | (b & 1)
            cb = c & 1
            if ab != cb:
                if cb == 0:
                    flips += (a & 1) + (b & 1)
                else:
                    flips += 1
            a >>= 1
            b >>= 1
            c >>= 1
        return flips
