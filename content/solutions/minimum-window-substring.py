class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or not s:
            return ""
        need = {}
        for ch in t:
            need[ch] = need.get(ch, 0) + 1
        required = len(need)
        have_counts = {}
        formed = 0
        left = 0
        best = None  # (length, left, right)
        for right in range(len(s)):
            ch = s[right]
            have_counts[ch] = have_counts.get(ch, 0) + 1
            if ch in need and have_counts[ch] == need[ch]:
                formed += 1
            while formed == required:
                if best is None or right - left + 1 < best[0]:
                    best = (right - left + 1, left, right)
                lch = s[left]
                have_counts[lch] -= 1
                if lch in need and have_counts[lch] < need[lch]:
                    formed -= 1
                left += 1
        return "" if best is None else s[best[1]:best[2] + 1]
