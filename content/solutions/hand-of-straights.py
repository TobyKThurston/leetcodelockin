class Solution:
    def isNStraightHand(self, hand: list[int], groupSize: int) -> bool:
        if len(hand) % groupSize != 0:
            return False
        counts = {}
        for v in hand:
            counts[v] = counts.get(v, 0) + 1
        for key in sorted(counts.keys()):
            k = counts[key]
            if k == 0:
                continue
            for i in range(groupSize):
                v = key + i
                if counts.get(v, 0) < k:
                    return False
                counts[v] -= k
        return True
