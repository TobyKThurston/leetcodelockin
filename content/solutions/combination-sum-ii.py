class Solution:
    def combinationSum2(self, candidates: list[int], target: int) -> list[list[int]]:
        candidates = sorted(candidates)
        out = []
        cur = []

        def backtrack(start: int, remaining: int):
            if remaining == 0:
                out.append(list(cur))
                return
            for i in range(start, len(candidates)):
                if i > start and candidates[i] == candidates[i - 1]:
                    continue
                if candidates[i] > remaining:
                    break
                cur.append(candidates[i])
                backtrack(i + 1, remaining - candidates[i])
                cur.pop()

        backtrack(0, target)
        out.sort()
        return out
