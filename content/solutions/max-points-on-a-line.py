from math import gcd


class Solution:
    def maxPoints(self, points: list[list[int]]) -> int:
        n = len(points)
        if n < 2:
            return n
        best = 1
        for i in range(n):
            slopes = {}
            for j in range(n):
                if i == j:
                    continue
                dx = points[j][0] - points[i][0]
                dy = points[j][1] - points[i][1]
                if dx == 0:
                    key = (0, 1)
                elif dy == 0:
                    key = (1, 0)
                else:
                    g = gcd(dx, dy)
                    dx //= g
                    dy //= g
                    if dx < 0:
                        dx, dy = -dx, -dy
                    key = (dx, dy)
                slopes[key] = slopes.get(key, 0) + 1
            local_best = max(slopes.values())
            if local_best + 1 > best:
                best = local_best + 1
        return best
