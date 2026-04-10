class Solution:
    def sortedSquares(self, nums: list[int]) -> list[int]:
        n = len(nums)
        out = [0] * n
        i, j, k = 0, n - 1, n - 1
        while i <= j:
            a, b = nums[i] * nums[i], nums[j] * nums[j]
            if a > b:
                out[k] = a
                i += 1
            else:
                out[k] = b
                j -= 1
            k -= 1
        return out
