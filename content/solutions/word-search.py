class Solution:
    def exist(self, board: list[list[str]], word: str) -> bool:
        m = len(board)
        n = len(board[0]) if m else 0

        def dfs(r: int, c: int, i: int) -> bool:
            if i == len(word):
                return True
            if r < 0 or r >= m or c < 0 or c >= n or board[r][c] != word[i]:
                return False
            saved = board[r][c]
            board[r][c] = '#'
            found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)
                     or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
            board[r][c] = saved
            return found

        for r in range(m):
            for c in range(n):
                if dfs(r, c, 0):
                    return True
        return False
