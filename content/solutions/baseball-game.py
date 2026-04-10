class Solution:
    def calPoints(self, operations: list[str]) -> int:
        st = []
        for op in operations:
            if op == '+':
                st.append(st[-1] + st[-2])
            elif op == 'D':
                st.append(2 * st[-1])
            elif op == 'C':
                st.pop()
            else:
                st.append(int(op))
        return sum(st)
