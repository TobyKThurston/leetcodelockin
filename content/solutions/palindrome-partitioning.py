class Solution:
    def partition(self, s: str) -> list[list[str]]:
        out = []
        cur = []

        def is_pal(a: str) -> bool:
            return a == a[::-1]

        def backtrack(start: int):
            if start == len(s):
                out.append(list(cur))
                return
            for end in range(start + 1, len(s) + 1):
                piece = s[start:end]
                if is_pal(piece):
                    cur.append(piece)
                    backtrack(end)
                    cur.pop()

        backtrack(0)
        out.sort()
        return out
