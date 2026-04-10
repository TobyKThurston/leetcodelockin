class Solution:
    def pacificAtlantic(self, heights: list[list[int]]) -> list[list[int]]:
        m = len(heights)
        n = len(heights[0]) if m else 0
        pacific = [[False] * n for _ in range(m)]
        atlantic = [[False] * n for _ in range(m)]

        def dfs(r: int, c: int, visited):
            visited[r][c] = True
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and not visited[nr][nc]:
                    if heights[nr][nc] >= heights[r][c]:
                        dfs(nr, nc, visited)

        for r in range(m):
            dfs(r, 0, pacific)
            dfs(r, n - 1, atlantic)
        for c in range(n):
            dfs(0, c, pacific)
            dfs(m - 1, c, atlantic)

        out = []
        for r in range(m):
            for c in range(n):
                if pacific[r][c] and atlantic[r][c]:
                    out.append([r, c])
        return out
