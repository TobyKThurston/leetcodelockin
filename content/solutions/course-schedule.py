from collections import deque


class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            graph[b].append(a)
            indeg[a] += 1
        queue = deque([i for i in range(numCourses) if indeg[i] == 0])
        taken = 0
        while queue:
            cur = queue.popleft()
            taken += 1
            for nb in graph[cur]:
                indeg[nb] -= 1
                if indeg[nb] == 0:
                    queue.append(nb)
        return taken == numCourses
