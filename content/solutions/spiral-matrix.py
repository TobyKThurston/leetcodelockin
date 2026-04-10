class Solution:
    def spiralOrder(self, matrix: list[list[int]]) -> list[int]:
        m = len(matrix)
        n = len(matrix[0]) if m else 0
        out = []
        top, bottom = 0, m - 1
        left, right = 0, n - 1
        while top <= bottom and left <= right:
            for c in range(left, right + 1):
                out.append(matrix[top][c])
            top += 1
            for r in range(top, bottom + 1):
                out.append(matrix[r][right])
            right -= 1
            if top <= bottom:
                for c in range(right, left - 1, -1):
                    out.append(matrix[bottom][c])
                bottom -= 1
            if left <= right:
                for r in range(bottom, top - 1, -1):
                    out.append(matrix[r][left])
                left += 1
        return out
