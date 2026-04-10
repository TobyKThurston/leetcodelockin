class Solution:
    def findMinArrowShots(self, points: list[list[int]]) -> int:
        if not points:
            return 0
        points = sorted(points, key=lambda p: p[1])
        arrows = 1
        shot = points[0][1]
        for a, b in points[1:]:
            if a > shot:
                arrows += 1
                shot = b
        return arrows
