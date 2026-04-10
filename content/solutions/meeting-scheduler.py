class Solution:
    def minAvailableDuration(self, slots1: list[list[int]], slots2: list[list[int]], duration: int) -> list[int]:
        slots1 = sorted(slots1, key=lambda x: x[0])
        slots2 = sorted(slots2, key=lambda x: x[0])
        i = j = 0
        while i < len(slots1) and j < len(slots2):
            lo = max(slots1[i][0], slots2[j][0])
            hi = min(slots1[i][1], slots2[j][1])
            if hi - lo >= duration:
                return [lo, lo + duration]
            if slots1[i][1] < slots2[j][1]:
                i += 1
            else:
                j += 1
        return []
