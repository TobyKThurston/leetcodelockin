class Solution:
    def solve(self, board: list[list[str]]) -> list[list[str]]:
        m = len(board)
        n = len(board[0]) if m else 0

        def mark_safe(r: int, c: int):
            stack = [(r, c)]
            while stack:
                cr, cc = stack.pop()
                if cr < 0 or cr >= m or cc < 0 or cc >= n or board[cr][cc] != 'O':
                    continue
                board[cr][cc] = '#'
                stack.append((cr + 1, cc))
                stack.append((cr - 1, cc))
                stack.append((cr, cc + 1))
                stack.append((cr, cc - 1))

        for r in range(m):
            mark_safe(r, 0)
            mark_safe(r, n - 1)
        for c in range(n):
            mark_safe(0, c)
            mark_safe(m - 1, c)

        for r in range(m):
            for c in range(n):
                if board[r][c] == 'O':
                    board[r][c] = 'X'
                elif board[r][c] == '#':
                    board[r][c] = 'O'
        return board
