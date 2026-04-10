class Solution:
    def findDisappearedNumbers(self, nums: list[int]) -> list[int]:
        present = set(nums)
        return [v for v in range(1, len(nums) + 1) if v not in present]
