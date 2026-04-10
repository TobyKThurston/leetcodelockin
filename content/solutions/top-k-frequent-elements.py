class Solution:
    def topKFrequent(self, nums: list[int], k: int) -> list[int]:
        counts = {}
        for v in nums:
            counts[v] = counts.get(v, 0) + 1
        buckets = [[] for _ in range(len(nums) + 1)]
        for v, c in counts.items():
            buckets[c].append(v)
        out = []
        for c in range(len(buckets) - 1, 0, -1):
            for v in buckets[c]:
                out.append(v)
                if len(out) == k:
                    return out
        return out
