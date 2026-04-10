class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        st = []  # indices with increasing heights
        best = 0
        extended = heights + [0]
        for i, h in enumerate(extended):
            while st and extended[st[-1]] > h:
                top = st.pop()
                left = st[-1] if st else -1
                width = i - left - 1
                area = extended[top] * width
                if area > best:
                    best = area
            st.append(i)
        return best
