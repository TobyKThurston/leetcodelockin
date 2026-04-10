class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        n = len(temperatures)
        out = [0] * n
        st = []  # stack of indices with strictly decreasing temperatures
        for i in range(n):
            while st and temperatures[st[-1]] < temperatures[i]:
                j = st.pop()
                out[j] = i - j
            st.append(i)
        return out
