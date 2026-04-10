class Solution:
    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:
        m = len(grid)
        n = len(grid[0]) if m else 0

        def dfs(r: int, c: int) -> int:
            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != 1:
                return 0
            grid[r][c] = -1
            return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)

        best = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == 1:
                    best = max(best, dfs(r, c))
        return best
