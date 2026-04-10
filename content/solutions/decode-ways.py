class Solution:
    def numDecodings(self, s: str) -> int:
        if not s or s[0] == '0':
            return 0
        n = len(s)
        prev2 = 1
        prev1 = 1
        for i in range(1, n):
            cur = 0
            if s[i] != '0':
                cur += prev1
            two = int(s[i - 1:i + 1])
            if 10 <= two <= 26:
                cur += prev2
            prev2, prev1 = prev1, cur
        return prev1
