class Solution:
    def findMaximumXOR(self, nums: list[int]) -> int:
        best = 0
        mask = 0
        for bit in range(31, -1, -1):
            mask |= (1 << bit)
            prefixes = {n & mask for n in nums}
            candidate = best | (1 << bit)
            found = False
            for p in prefixes:
                if (candidate ^ p) in prefixes:
                    found = True
                    break
            if found:
                best = candidate
        return best
