class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        out = []
        cur = []

        def backtrack(start: int):
            if len(cur) == k:
                out.append(list(cur))
                return
            for i in range(start, n + 1):
                cur.append(i)
                backtrack(i + 1)
                cur.pop()

        backtrack(1)
        out.sort()
        return out
