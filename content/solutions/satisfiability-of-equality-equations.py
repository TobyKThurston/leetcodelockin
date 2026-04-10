class Solution:
    def equationsPossible(self, equations: list[str]) -> bool:
        parent = {ch: ch for ch in 'abcdefghijklmnopqrstuvwxyz'}

        def find(x: str) -> str:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for eq in equations:
            if eq[1] == '=':
                a, b = eq[0], eq[3]
                ra, rb = find(a), find(b)
                if ra != rb:
                    parent[ra] = rb
        for eq in equations:
            if eq[1] == '!':
                a, b = eq[0], eq[3]
                if find(a) == find(b):
                    return False
        return True
