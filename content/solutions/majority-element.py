class Solution:
    def majorityElement(self, nums: list[int]) -> int:
        candidate = None
        count = 0
        for v in nums:
            if count == 0:
                candidate = v
            count += 1 if v == candidate else -1
        return candidate
