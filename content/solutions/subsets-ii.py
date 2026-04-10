class Solution:
    def subsetsWithDup(self, nums: list[int]) -> list[list[int]]:
        nums = sorted(nums)
        out = []
        cur = []

        def backtrack(start: int):
            out.append(list(cur))
            for i in range(start, len(nums)):
                if i > start and nums[i] == nums[i - 1]:
                    continue
                cur.append(nums[i])
                backtrack(i + 1)
                cur.pop()

        backtrack(0)
        out.sort()
        return out
