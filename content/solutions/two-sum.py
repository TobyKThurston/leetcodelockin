class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, v in enumerate(nums):
            j = seen.get(target - v)
            if j is not None:
                return [j, i]
            seen[v] = i
        return []
