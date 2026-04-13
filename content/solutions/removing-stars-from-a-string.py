class Solution:
    def removeStars(self, s: str) -> str:
        stack: list[str] = []
        for ch in s:
            if ch == '*':
                stack.pop()
            else:
                stack.append(ch)
        return "".join(stack)
