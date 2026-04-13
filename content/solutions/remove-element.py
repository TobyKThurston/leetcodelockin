class Solution:
    def removeElement(self, nums: list[int], val: int) -> list[int]:
        w = 0
        for v in nums:
            if v != val:
                nums[w] = v
                w += 1
        return nums[:w]
