class Solution:
    def islandPerimeter(self, grid: list[list[int]]) -> int:
        m = len(grid)
        n = len(grid[0]) if m else 0
        total = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] != 1:
                    continue
                total += 4
                if r > 0 and grid[r - 1][c] == 1:
                    total -= 2
                if c > 0 and grid[r][c - 1] == 1:
                    total -= 2
        return total
