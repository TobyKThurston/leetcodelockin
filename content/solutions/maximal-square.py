class Solution:
    def maximalSquare(self, matrix: list[list[str]]) -> int:
        m = len(matrix)
        n = len(matrix[0])
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        best = 0
        for r in range(1, m + 1):
            for c in range(1, n + 1):
                if matrix[r - 1][c - 1] == '1':
                    dp[r][c] = 1 + min(dp[r - 1][c - 1], dp[r - 1][c], dp[r][c - 1])
                    if dp[r][c] > best:
                        best = dp[r][c]
        return best * best
