import heapq


class Solution:
    def reorganizeString(self, s: str) -> str:
        counts = {}
        for ch in s:
            counts[ch] = counts.get(ch, 0) + 1
        n = len(s)
        if max(counts.values()) > (n + 1) // 2:
            return ""
        heap = [(-c, ch) for ch, c in counts.items()]
        heapq.heapify(heap)
        out = []
        while len(heap) >= 2:
            c1, ch1 = heapq.heappop(heap)
            c2, ch2 = heapq.heappop(heap)
            out.append(ch1)
            out.append(ch2)
            if c1 + 1 < 0:
                heapq.heappush(heap, (c1 + 1, ch1))
            if c2 + 1 < 0:
                heapq.heappush(heap, (c2 + 1, ch2))
        if heap:
            out.append(heap[0][1])
        return ''.join(out)
