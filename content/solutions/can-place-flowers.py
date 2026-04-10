class Solution:
    def canPlaceFlowers(self, flowerbed: list[int], n: int) -> bool:
        bed = flowerbed[:]
        count = 0
        for i in range(len(bed)):
            if bed[i] == 0:
                left = i == 0 or bed[i - 1] == 0
                right = i == len(bed) - 1 or bed[i + 1] == 0
                if left and right:
                    bed[i] = 1
                    count += 1
                    if count >= n:
                        return True
        return count >= n
