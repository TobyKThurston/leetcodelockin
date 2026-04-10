class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        best = 0
        cur = 0
        left = 0
        for right in range(len(nums)):
            cur += nums[right]
            while cur >= target:
                window = right - left + 1
                if best == 0 or window < best:
                    best = window
                cur -= nums[left]
                left += 1
        return best
