class Solution:
    def singleNumber(self, nums: list[int]) -> list[int]:
        xor_all = 0
        for v in nums:
            xor_all ^= v
        # Isolate the lowest differing bit.
        diff_bit = xor_all & -xor_all
        a = b = 0
        for v in nums:
            if v & diff_bit:
                a ^= v
            else:
                b ^= v
        return [a, b]
