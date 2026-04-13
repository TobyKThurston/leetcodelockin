class Solution:
    def findRelativeRanks(self, score: list[int]) -> list[str]:
        labels = ["Gold Medal", "Silver Medal", "Bronze Medal"]
        order = sorted(range(len(score)), key=lambda i: -score[i])
        ans = [""] * len(score)
        for place, idx in enumerate(order):
            ans[idx] = labels[place] if place < 3 else str(place + 1)
        return ans
