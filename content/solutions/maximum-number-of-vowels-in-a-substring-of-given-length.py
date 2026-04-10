class Solution:
    def maxVowels(self, s: str, k: int) -> int:
        vowels = set('aeiou')
        cur = sum(1 for c in s[:k] if c in vowels)
        best = cur
        for i in range(k, len(s)):
            if s[i] in vowels:
                cur += 1
            if s[i - k] in vowels:
                cur -= 1
            if cur > best:
                best = cur
        return best
