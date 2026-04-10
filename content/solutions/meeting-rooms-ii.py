import heapq


class Solution:
    def minMeetingRooms(self, intervals: list[list[int]]) -> int:
        intervals = sorted(intervals, key=lambda x: x[0])
        heap = []
        for start, end in intervals:
            if heap and heap[0] <= start:
                heapq.heappop(heap)
            heapq.heappush(heap, end)
        return len(heap)
