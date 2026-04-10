class Solution:
    def minTotalDistance(self, grid: list[list[int]]) -> int:
        rows = []
        cols = []
        for r, row in enumerate(grid):
            for c, v in enumerate(row):
                if v == 1:
                    rows.append(r)
                    cols.append(c)
        rows.sort()
        cols.sort()

        def median_distance(xs):
            lo, hi = 0, len(xs) - 1
            total = 0
            while lo < hi:
                total += xs[hi] - xs[lo]
                lo += 1
                hi -= 1
            return total

        return median_distance(rows) + median_distance(cols)
