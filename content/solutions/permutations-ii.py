class Solution:
    def permuteUnique(self, nums: list[int]) -> list[list[int]]:
        nums = sorted(nums)
        out = []
        used = [False] * len(nums)
        cur = []

        def backtrack():
            if len(cur) == len(nums):
                out.append(list(cur))
                return
            for i in range(len(nums)):
                if used[i]:
                    continue
                if i > 0 and nums[i] == nums[i - 1] and not used[i - 1]:
                    continue
                used[i] = True
                cur.append(nums[i])
                backtrack()
                cur.pop()
                used[i] = False

        backtrack()
        out.sort()
        return out
