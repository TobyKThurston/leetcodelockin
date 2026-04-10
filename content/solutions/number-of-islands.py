class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        m = len(grid)
        n = len(grid[0]) if m else 0
        seen = [[False] * n for _ in range(m)]

        def dfs(r: int, c: int):
            stack = [(r, c)]
            while stack:
                cr, cc = stack.pop()
                if cr < 0 or cr >= m or cc < 0 or cc >= n:
                    continue
                if seen[cr][cc] or grid[cr][cc] == '0':
                    continue
                seen[cr][cc] = True
                stack.append((cr + 1, cc))
                stack.append((cr - 1, cc))
                stack.append((cr, cc + 1))
                stack.append((cr, cc - 1))

        count = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == '1' and not seen[r][c]:
                    dfs(r, c)
                    count += 1
        return count
