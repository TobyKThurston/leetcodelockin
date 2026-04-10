class Solution:
    def employeeFreeTime(self, schedule: list[list[list[int]]]) -> list[list[int]]:
        flat = []
        for emp in schedule:
            for iv in emp:
                flat.append(iv)
        flat.sort(key=lambda x: x[0])
        merged = []
        for a, b in flat:
            if merged and a <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], b)
            else:
                merged.append([a, b])
        out = []
        for i in range(1, len(merged)):
            out.append([merged[i - 1][1], merged[i][0]])
        return out
