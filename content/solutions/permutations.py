class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        out = []

        def backtrack(cur: list[int], remaining: list[int]):
            if not remaining:
                out.append(list(cur))
                return
            for i in range(len(remaining)):
                cur.append(remaining[i])
                backtrack(cur, remaining[:i] + remaining[i + 1:])
                cur.pop()

        backtrack([], nums)
        out.sort()
        return out
