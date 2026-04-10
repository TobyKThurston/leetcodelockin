class Solution:
    def letterCombinations(self, digits: str) -> list[str]:
        if not digits:
            return []
        mapping = {
            '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl',
            '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz',
        }
        out = []

        def backtrack(i: int, path: list[str]):
            if i == len(digits):
                out.append(''.join(path))
                return
            for ch in mapping[digits[i]]:
                path.append(ch)
                backtrack(i + 1, path)
                path.pop()

        backtrack(0, [])
        out.sort()
        return out
