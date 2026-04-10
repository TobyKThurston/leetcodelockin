class Solution:
    def solveSudoku(self, board: list[list[str]]) -> list[list[str]]:
        rows = [set() for _ in range(9)]
        cols = [set() for _ in range(9)]
        boxes = [set() for _ in range(9)]
        empties = []
        for r in range(9):
            for c in range(9):
                ch = board[r][c]
                if ch == '.':
                    empties.append((r, c))
                else:
                    rows[r].add(ch)
                    cols[c].add(ch)
                    boxes[(r // 3) * 3 + (c // 3)].add(ch)

        def backtrack(i: int) -> bool:
            if i == len(empties):
                return True
            r, c = empties[i]
            b = (r // 3) * 3 + (c // 3)
            for d in '123456789':
                if d in rows[r] or d in cols[c] or d in boxes[b]:
                    continue
                rows[r].add(d)
                cols[c].add(d)
                boxes[b].add(d)
                board[r][c] = d
                if backtrack(i + 1):
                    return True
                rows[r].remove(d)
                cols[c].remove(d)
                boxes[b].remove(d)
                board[r][c] = '.'
            return False

        backtrack(0)
        return board
