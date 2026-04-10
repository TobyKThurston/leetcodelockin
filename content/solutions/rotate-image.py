class Solution:
    def rotate(self, matrix: list[list[int]]) -> list[list[int]]:
        n = len(matrix)
        # Transpose.
        for i in range(n):
            for j in range(i + 1, n):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
        # Reverse each row.
        for row in matrix:
            row.reverse()
        return matrix
