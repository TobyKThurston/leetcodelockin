class Solution:
    def totalFruit(self, fruits: list[int]) -> int:
        counts = {}
        left = 0
        best = 0
        for right in range(len(fruits)):
            f = fruits[right]
            counts[f] = counts.get(f, 0) + 1
            while len(counts) > 2:
                out = fruits[left]
                counts[out] -= 1
                if counts[out] == 0:
                    del counts[out]
                left += 1
            if right - left + 1 > best:
                best = right - left + 1
        return best
