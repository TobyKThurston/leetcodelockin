class Solution:
    def setZeroes(self, matrix: list[list[int]]) -> list[list[int]]:
        m = len(matrix)
        n = len(matrix[0]) if m else 0
        zero_rows = set()
        zero_cols = set()
        for r in range(m):
            for c in range(n):
                if matrix[r][c] == 0:
                    zero_rows.add(r)
                    zero_cols.add(c)
        for r in range(m):
            for c in range(n):
                if r in zero_rows or c in zero_cols:
                    matrix[r][c] = 0
        return matrix
