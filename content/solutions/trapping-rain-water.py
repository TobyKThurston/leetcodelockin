class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        i, j = 0, len(height) - 1
        lmax = rmax = 0
        total = 0
        while i < j:
            if height[i] < height[j]:
                if height[i] >= lmax:
                    lmax = height[i]
                else:
                    total += lmax - height[i]
                i += 1
            else:
                if height[j] >= rmax:
                    rmax = height[j]
                else:
                    total += rmax - height[j]
                j -= 1
        return total
