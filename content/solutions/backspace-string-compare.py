class Solution:
    def backspaceCompare(self, s: str, t: str) -> bool:
        def reduce(string: str) -> list:
            st = []
            for ch in string:
                if ch == '#':
                    if st:
                        st.pop()
                else:
                    st.append(ch)
            return st
        return reduce(s) == reduce(t)
