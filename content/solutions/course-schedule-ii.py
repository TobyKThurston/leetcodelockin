from collections import deque


class Solution:
    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:
        graph = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indeg[a] += 1
        queue = deque([i for i in range(numCourses) if indeg[i] == 0])
        order = []
        while queue:
            cur = queue.popleft()
            order.append(cur)
            for nb in graph[cur]:
                indeg[nb] -= 1
                if indeg[nb] == 0:
                    queue.append(nb)
        return order if len(order) == numCourses else []
