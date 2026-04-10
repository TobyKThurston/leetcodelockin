class Solution:
    def singleNumber(self, nums: list[int]) -> int:
        ones = twos = 0
        for v in nums:
            ones = (ones ^ v) & ~twos
            twos = (twos ^ v) & ~ones
        return ones
