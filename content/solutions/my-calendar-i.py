class MyCalendar:
    def __init__(self):
        self.events = []

    def book(self, start: int, end: int) -> bool:
        for s, e in self.events:
            if start < e and s < end:
                return False
        self.events.append((start, end))
        return True


class Solution:
    def runCalendarOps(self, ops: list[str], vals: list[list[int]]) -> list[bool]:
        cal = MyCalendar()
        out = []
        for op, args in zip(ops, vals):
            out.append(getattr(cal, op)(*args))
        return out
