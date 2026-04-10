class Solution:
    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:
        candidates = sorted(candidates)
        out = []
        cur = []

        def backtrack(start: int, remaining: int):
            if remaining == 0:
                out.append(list(cur))
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break
                cur.append(candidates[i])
                backtrack(i, remaining - candidates[i])
                cur.pop()

        backtrack(0, target)
        out.sort()
        return out
