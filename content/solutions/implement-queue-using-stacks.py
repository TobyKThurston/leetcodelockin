class MyQueue:
    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def push(self, x: int) -> None:
        self.in_stack.append(x)

    def _shift(self):
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())

    def pop(self) -> int:
        self._shift()
        return self.out_stack.pop()

    def peek(self) -> int:
        self._shift()
        return self.out_stack[-1]

    def empty(self) -> bool:
        return not self.in_stack and not self.out_stack


class Solution:
    def runQueueOps(self, ops: list[str], vals: list[list[int]]) -> list:
        q = MyQueue()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(q, op)(*args)
            out.append(result)
        return out
