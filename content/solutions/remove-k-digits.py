class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        st = []
        remaining = k
        for ch in num:
            while st and remaining > 0 and st[-1] > ch:
                st.pop()
                remaining -= 1
            st.append(ch)
        # Still need to remove trailing digits.
        while remaining > 0 and st:
            st.pop()
            remaining -= 1
        # Strip leading zeros.
        out = ''.join(st).lstrip('0')
        return out if out else '0'
