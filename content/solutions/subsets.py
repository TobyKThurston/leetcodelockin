class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        out = []
        cur = []

        def backtrack(i: int):
            if i == len(nums):
                out.append(list(cur))
                return
            backtrack(i + 1)
            cur.append(nums[i])
            backtrack(i + 1)
            cur.pop()

        backtrack(0)
        out.sort()
        return out
