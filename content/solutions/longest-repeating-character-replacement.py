class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        counts = {}
        left = 0
        best = 0
        max_freq = 0
        for right in range(len(s)):
            ch = s[right]
            counts[ch] = counts.get(ch, 0) + 1
            if counts[ch] > max_freq:
                max_freq = counts[ch]
            while (right - left + 1) - max_freq > k:
                counts[s[left]] -= 1
                left += 1
                max_freq = max(counts.values()) if counts else 0
            if right - left + 1 > best:
                best = right - left + 1
        return best
