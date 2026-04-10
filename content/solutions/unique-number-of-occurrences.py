class Solution:
    def uniqueOccurrences(self, arr: list[int]) -> bool:
        counts = {}
        for v in arr:
            counts[v] = counts.get(v, 0) + 1
        vals = list(counts.values())
        return len(set(vals)) == len(vals)
