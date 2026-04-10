class Solution:
    def evalRPN(self, tokens: list[str]) -> int:
        st = []
        for tok in tokens:
            if tok in '+-*/' and len(tok) == 1:
                b = st.pop()
                a = st.pop()
                if tok == '+':
                    st.append(a + b)
                elif tok == '-':
                    st.append(a - b)
                elif tok == '*':
                    st.append(a * b)
                else:
                    # Truncate toward zero, not toward negative infinity.
                    st.append(int(a / b))
            else:
                st.append(int(tok))
        return st[0]
