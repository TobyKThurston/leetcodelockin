class Solution:
    def topKFrequent(self, words: list[str], k: int) -> list[str]:
        counts = {}
        for w in words:
            counts[w] = counts.get(w, 0) + 1
        # Sort by (-count, word) — highest frequency first, alphabetical ties.
        ordered = sorted(counts.keys(), key=lambda w: (-counts[w], w))
        return ordered[:k]
