class Solution:
    def leastInterval(self, tasks: list[str], n: int) -> int:
        counts = {}
        for t in tasks:
            counts[t] = counts.get(t, 0) + 1
        max_count = max(counts.values())
        count_of_max = sum(1 for c in counts.values() if c == max_count)
        formula = (max_count - 1) * (n + 1) + count_of_max
        return max(len(tasks), formula)
