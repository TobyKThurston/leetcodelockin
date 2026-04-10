class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        s = set(nums)
        best = 0
        for v in s:
            if v - 1 in s:
                continue
            length = 1
            cur = v + 1
            while cur in s:
                length += 1
                cur += 1
            if length > best:
                best = length
        return best
