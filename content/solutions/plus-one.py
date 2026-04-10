class Solution:
    def plusOne(self, digits: list[int]) -> list[int]:
        out = digits[:]
        i = len(out) - 1
        while i >= 0:
            if out[i] < 9:
                out[i] += 1
                return out
            out[i] = 0
            i -= 1
        return [1] + out
