class Solution:
    def generate(self, numRows: int) -> list[list[int]]:
        rows: list[list[int]] = [[1]]
        for i in range(1, numRows):
            prev = rows[-1]
            row = [1]
            for j in range(1, i):
                row.append(prev[j - 1] + prev[j])
            row.append(1)
            rows.append(row)
        return rows
