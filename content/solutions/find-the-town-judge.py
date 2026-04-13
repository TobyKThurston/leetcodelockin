class Solution:
    def findJudge(self, n: int, trust: list[list[int]]) -> int:
        net = [0] * (n + 1)
        for a, b in trust:
            net[a] -= 1
            net[b] += 1
        for p in range(1, n + 1):
            if net[p] == n - 1:
                return p
        return -1
