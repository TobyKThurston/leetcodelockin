class Solution:
    def minGroups(self, intervals: list[list[int]]) -> int:
        events = []
        for a, b in intervals:
            events.append((a, 1))
            events.append((b + 1, -1))
        events.sort()
        best = cur = 0
        for _, delta in events:
            cur += delta
            if cur > best:
                best = cur
        return best
