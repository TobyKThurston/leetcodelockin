class Solution:
    def generateMatrix(self, n: int) -> list[list[int]]:
        out = [[0] * n for _ in range(n)]
        val = 1
        top, bottom = 0, n - 1
        left, right = 0, n - 1
        while top <= bottom and left <= right:
            for c in range(left, right + 1):
                out[top][c] = val
                val += 1
            top += 1
            for r in range(top, bottom + 1):
                out[r][right] = val
                val += 1
            right -= 1
            if top <= bottom:
                for c in range(right, left - 1, -1):
                    out[bottom][c] = val
                    val += 1
                bottom -= 1
            if left <= right:
                for r in range(bottom, top - 1, -1):
                    out[r][left] = val
                    val += 1
                left += 1
        return out
