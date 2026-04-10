class Solution:
    def maxArea(self, height: list[int]) -> int:
        i, j = 0, len(height) - 1
        best = 0
        while i < j:
            h = min(height[i], height[j])
            area = h * (j - i)
            if area > best:
                best = area
            if height[i] < height[j]:
                i += 1
            else:
                j -= 1
        return best
