class Solution:
    def findContentChildren(self, g: list[int], s: list[int]) -> int:
        g = sorted(g)
        s = sorted(s)
        i = j = 0
        while i < len(g) and j < len(s):
            if s[j] >= g[i]:
                i += 1
            j += 1
        return i
