class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last = {}
        best = 0
        left = 0
        for i, ch in enumerate(s):
            if ch in last and last[ch] >= left:
                left = last[ch] + 1
            last[ch] = i
            if i - left + 1 > best:
                best = i - left + 1
        return best
