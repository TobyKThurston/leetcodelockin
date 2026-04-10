class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        root = {}
        for w in words:
            node = root
            for ch in w:
                if ch not in node:
                    node[ch] = {}
                node = node[ch]
            node['$'] = w

        m = len(board)
        n = len(board[0]) if m else 0
        found = set()

        def dfs(r, c, node):
            ch = board[r][c]
            if ch not in node:
                return
            nxt = node[ch]
            if '$' in nxt:
                found.add(nxt['$'])
            board[r][c] = '#'
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and board[nr][nc] != '#':
                    dfs(nr, nc, nxt)
            board[r][c] = ch

        for r in range(m):
            for c in range(n):
                dfs(r, c, root)

        return list(found)
