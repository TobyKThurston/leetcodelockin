class Solution:
    def solveNQueens(self, n: int) -> list[list[str]]:
        out = []
        cols = set()
        diag1 = set()  # r - c
        diag2 = set()  # r + c
        queens = []

        def backtrack(r: int):
            if r == n:
                board = []
                for col in queens:
                    row = ['.'] * n
                    row[col] = 'Q'
                    board.append(''.join(row))
                out.append(board)
                return
            for c in range(n):
                if c in cols or (r - c) in diag1 or (r + c) in diag2:
                    continue
                cols.add(c)
                diag1.add(r - c)
                diag2.add(r + c)
                queens.append(c)
                backtrack(r + 1)
                queens.pop()
                cols.remove(c)
                diag1.remove(r - c)
                diag2.remove(r + c)

        backtrack(0)
        out.sort()
        return out
