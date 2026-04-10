class Solution:
    def partitionLabels(self, s: str) -> list[int]:
        last = {ch: i for i, ch in enumerate(s)}
        out = []
        start = 0
        end = 0
        for i, ch in enumerate(s):
            if last[ch] > end:
                end = last[ch]
            if i == end:
                out.append(end - start + 1)
                start = i + 1
        return out
