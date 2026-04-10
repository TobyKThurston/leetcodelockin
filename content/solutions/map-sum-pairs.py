class MapSum:
    def __init__(self):
        self.store = {}

    def insert(self, key: str, val: int) -> None:
        self.store[key] = val

    def sum(self, prefix: str) -> int:
        total = 0
        for k, v in self.store.items():
            if k.startswith(prefix):
                total += v
        return total


class Solution:
    def runMapSumOps(self, ops: list[str], vals: list) -> list:
        ms = MapSum()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(ms, op)(*args)
            out.append(result)
        return out
