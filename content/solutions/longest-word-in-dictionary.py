class Solution:
    def longestWord(self, words: list[str]) -> str:
        word_set = set(words)
        best = ""
        for w in words:
            if all(w[:i] in word_set for i in range(1, len(w) + 1)):
                if len(w) > len(best) or (len(w) == len(best) and w < best):
                    best = w
        return best
