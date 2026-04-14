// ─── Advanced Graphs problems ───────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const ADVANCED_GRAPHS_PROBLEMS: ProblemContent[] = [
  // ─── Course Schedule (LC #207) ─────────────────────────────────────────────
  {
    slug: 'course-schedule',
    lcNumber: 207,
    title: 'Course Schedule',
    difficulty: 'Medium',
    pattern: 'Topological Sort',
    tags: ['graph', 'topological-sort'],
    descriptionMd: `There are a total of \`numCourses\` courses you have to take, labelled from
\`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where
\`prerequisites[i] = [a, b]\` indicates that you **must** take course \`b\` first if you
want to take course \`a\`.

Return \`True\` if you can finish **all** courses. Otherwise, return \`False\`.`,
    examples: [
      {
        input: 'numCourses = 2, prerequisites = [[1, 0]]',
        output: 'True',
      },
      {
        input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= numCourses <= 2000`',
      '`0 <= len(prerequisites) <= 5000`',
      'All `prerequisites[i]` pairs are unique.',
    ],
    starterCode: {
      python: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        # Return True if every course can be taken given the prerequisite graph.
        pass
`,
    },
    methodName: 'canFinish',
    argKeys: ['numCourses', 'prerequisites'],
    defaultTests: [
      { label: 'No cycle',    inputJson: '{"numCourses":2,"prerequisites":[[1,0]]}',       expectedJson: 'true'  },
      { label: 'Cycle',       inputJson: '{"numCourses":2,"prerequisites":[[1,0],[0,1]]}', expectedJson: 'false' },
      { label: 'Chain',       inputJson: '{"numCourses":3,"prerequisites":[[1,0],[2,1]]}', expectedJson: 'true'  },
      { label: 'Empty prereqs', inputJson: '{"numCourses":1,"prerequisites":[]}',          expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS Cycle Detection',
        intuition: 'Build an adjacency list and run DFS from each node, tracking three states (unvisited, visiting, visited). If we revisit a node still in the "visiting" state, we found a cycle and return False.',
        code: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            graph[b].append(a)
        # 0 = unvisited, 1 = visiting, 2 = visited
        state = [0] * numCourses
        def dfs(node):
            if state[node] == 1:
                return False
            if state[node] == 2:
                return True
            state[node] = 1
            for nb in graph[node]:
                if not dfs(nb):
                    return False
            state[node] = 2
            return True
        return all(dfs(i) for i in range(numCourses))
`,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
      },
      {
        approach: "Kahn's BFS Topological Sort",
        intuition: "Track in-degrees for every node, push all zero-in-degree nodes into a queue, and peel them off layer by layer. If all nodes are processed, there is no cycle.",
        code: `from collections import deque


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
`,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
      },
    ],
  },

  // ─── Course Schedule II (LC #210) ──────────────────────────────────────────
  {
    slug: 'course-schedule-ii',
    lcNumber: 210,
    title: 'Course Schedule II',
    difficulty: 'Medium',
    pattern: 'Topological Sort',
    tags: ['graph', 'topological-sort'],
    descriptionMd: `There are a total of \`numCourses\` courses you have to take, labelled from
\`0\` to \`numCourses - 1\`. You are given an array \`prerequisites\` where
\`prerequisites[i] = [a, b]\` indicates that you **must** take course \`b\` first if you
want to take course \`a\`.

Return the **ordering** of courses you should take to finish all courses. If there are
many valid answers, return **any** of them. If it is impossible to finish all courses,
return an empty array.

> Because multiple valid orderings usually exist, our tests pick inputs whose ordering
> is uniquely determined (e.g. linear chains), so any correct solution matches.`,
    examples: [
      {
        input: 'numCourses = 3, prerequisites = [[1, 0], [2, 1]]',
        output: '[0, 1, 2]',
      },
      {
        input: 'numCourses = 2, prerequisites = [[1, 0], [0, 1]]',
        output: '[]',
      },
    ],
    constraints: [
      '`1 <= numCourses <= 2000`',
      '`0 <= len(prerequisites) <= 5000`',
    ],
    starterCode: {
      python: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:
        # Return a valid course ordering, or [] if impossible.
        pass
`,
    },
    methodName: 'findOrder',
    argKeys: ['numCourses', 'prerequisites'],
    defaultTests: [
      { label: 'Chain',  inputJson: '{"numCourses":3,"prerequisites":[[1,0],[2,1]]}', expectedJson: '[0,1,2]' },
      { label: 'Cycle',  inputJson: '{"numCourses":2,"prerequisites":[[1,0],[0,1]]}', expectedJson: '[]'      },
      { label: 'Single', inputJson: '{"numCourses":1,"prerequisites":[]}',            expectedJson: '[0]'     },
      { label: 'Two courses', inputJson: '{"numCourses":2,"prerequisites":[[1,0]]}',  expectedJson: '[0,1]'   },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS Topological Sort',
        intuition: 'Run a DFS-based topological sort, appending nodes in post-order and reversing at the end. If a cycle is detected (revisiting a node in the current path), return an empty list.',
        code: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: list[list[int]]) -> list[int]:
        graph = [[] for _ in range(numCourses)]
        for a, b in prerequisites:
            graph[b].append(a)
        # 0 = unvisited, 1 = visiting, 2 = visited
        state = [0] * numCourses
        order = []
        def dfs(node):
            if state[node] == 1:
                return False
            if state[node] == 2:
                return True
            state[node] = 1
            for nb in graph[node]:
                if not dfs(nb):
                    return False
            state[node] = 2
            order.append(node)
            return True
        for i in range(numCourses):
            if not dfs(i):
                return []
        return order[::-1]
`,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
      },
      {
        approach: "Kahn's BFS Topological Sort",
        intuition: "Use BFS with in-degree tracking. Process nodes with zero in-degree first, collecting them into the result order. If all nodes are collected, it is a valid ordering.",
        code: `from collections import deque


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
`,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
      },
    ],
  },

  // ─── Redundant Connection (LC #684) ────────────────────────────────────────
  {
    slug: 'redundant-connection',
    lcNumber: 684,
    title: 'Redundant Connection',
    difficulty: 'Medium',
    pattern: 'Union-Find',
    tags: ['graph', 'union-find'],
    descriptionMd: `In this problem, a tree is an undirected graph that is connected and has no
cycles. You are given a graph that started as a tree with \`n\` nodes labelled from
\`1\` to \`n\`, with one additional edge added. The added edge has two **different**
vertices chosen from \`1\` to \`n\`, and was not an edge that already existed.

The graph is represented as an array \`edges\` of length \`n\` where \`edges[i] = [ai,
bi]\` indicates that there is an edge between nodes \`ai\` and \`bi\` in the graph.

Return an edge that can be removed so that the resulting graph is a tree of \`n\` nodes.
If there are multiple answers, return the edge that occurs **last** in the input.`,
    examples: [
      {
        input: 'edges = [[1, 2], [1, 3], [2, 3]]',
        output: '[2, 3]',
      },
      {
        input: 'edges = [[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]',
        output: '[1, 4]',
      },
    ],
    constraints: [
      '`3 <= len(edges) <= 1000`',
      '`edges[i].length == 2`',
      '`1 <= ai < bi <= len(edges)`',
      'The graph is guaranteed to contain exactly one cycle.',
    ],
    starterCode: {
      python: `class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        # Return the single extra edge that turns the tree into a cycle.
        pass
`,
    },
    methodName: 'findRedundantConnection',
    argKeys: ['edges'],
    defaultTests: [
      { label: 'Simple',    inputJson: '{"edges":[[1,2],[1,3],[2,3]]}',                  expectedJson: '[2,3]' },
      { label: 'Ring tail', inputJson: '{"edges":[[1,2],[2,3],[3,4],[1,4],[1,5]]}',      expectedJson: '[1,4]' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS Cycle Detection',
        intuition: 'Build an adjacency list and for each edge, check if both endpoints are already reachable via DFS. If so, that edge creates the cycle and is the answer.',
        code: `class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        n = len(edges)
        graph = [[] for _ in range(n + 1)]
        def has_path(src, dst, visited):
            if src == dst:
                return True
            visited.add(src)
            for nb in graph[src]:
                if nb not in visited and has_path(nb, dst, visited):
                    return True
            return False
        for a, b in edges:
            if graph[a] and graph[b] and has_path(a, b, set()):
                return [a, b]
            graph[a].append(b)
            graph[b].append(a)
        return []
`,
        timeComplexity: 'O(n^2)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Union-Find',
        intuition: 'Walk edges left to right and union each pair. The first edge whose endpoints already share the same root is the redundant one that creates the cycle.',
        code: `class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        n = len(edges)
        parent = list(range(n + 1))

        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return [a, b]
            parent[ra] = rb
        return []
`,
        timeComplexity: 'O(n * alpha(n))',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Number of Connected Components in an Undirected Graph (LC #323) ──────
  {
    slug: 'number-of-connected-components-in-an-undirected-graph',
    lcNumber: 323,
    title: 'Number of Connected Components in an Undirected Graph',
    difficulty: 'Medium',
    pattern: 'Union-Find',
    tags: ['graph', 'union-find', 'dfs'],
    descriptionMd: `You have a graph of \`n\` nodes labelled \`0\` through \`n - 1\`. You are given
an integer \`n\` and a list of \`edges\` where \`edges[i] = [ai, bi]\` indicates that
there is an undirected edge between nodes \`ai\` and \`bi\` in the graph.

Return the number of **connected components** in the graph.`,
    examples: [
      {
        input: 'n = 5, edges = [[0, 1], [1, 2], [3, 4]]',
        output: '2',
      },
      {
        input: 'n = 4, edges = []',
        output: '4',
      },
    ],
    constraints: [
      '`1 <= n <= 2000`',
      '`0 <= len(edges) <= 5000`',
    ],
    starterCode: {
      python: `class Solution:
    def countComponents(self, n: int, edges: list[list[int]]) -> int:
        # Return the number of connected components in the undirected graph.
        pass
`,
    },
    methodName: 'countComponents',
    argKeys: ['n', 'edges'],
    defaultTests: [
      { label: 'Two components', inputJson: '{"n":5,"edges":[[0,1],[1,2],[3,4]]}',        expectedJson: '2' },
      { label: 'Fully connected',inputJson: '{"n":5,"edges":[[0,1],[1,2],[2,3],[3,4]]}',  expectedJson: '1' },
      { label: 'No edges',       inputJson: '{"n":4,"edges":[]}',                          expectedJson: '4' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS',
        intuition: 'Build an adjacency list and run DFS from every unvisited node, counting each DFS launch as a new connected component.',
        code: `class Solution:
    def countComponents(self, n: int, edges: list[list[int]]) -> int:
        graph = [[] for _ in range(n)]
        for a, b in edges:
            graph[a].append(b)
            graph[b].append(a)
        visited = [False] * n
        count = 0
        def dfs(node):
            visited[node] = True
            for nb in graph[node]:
                if not visited[nb]:
                    dfs(nb)
        for i in range(n):
            if not visited[i]:
                dfs(i)
                count += 1
        return count
`,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V + E)',
      },
      {
        approach: 'Union-Find',
        intuition: 'Initialize each node as its own component. For each edge, union the two endpoints. The answer is the number of distinct roots remaining.',
        code: `class Solution:
    def countComponents(self, n: int, edges: list[list[int]]) -> int:
        parent = list(range(n))

        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
        return len({find(i) for i in range(n)})
`,
        timeComplexity: 'O(n * alpha(n))',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Connecting Cities With Minimum Cost (LC #1135) ───────────────────────
  {
    slug: 'connecting-cities-with-minimum-cost',
    lcNumber: 1135,
    title: 'Connecting Cities With Minimum Cost',
    difficulty: 'Medium',
    pattern: 'MST',
    tags: ['graph', 'mst', 'union-find'],
    descriptionMd: `There are \`n\` cities labelled from \`1\` to \`n\`. You are given the array
\`connections\` where \`connections[i] = [ai, bi, costi]\` represents the cost to connect
city \`ai\` and city \`bi\` (bidirectional connection).

Return the **minimum cost** to connect all the \`n\` cities such that there is at least
one path between each pair of cities. If it is impossible to connect all the \`n\`
cities, return \`-1\`.`,
    examples: [
      {
        input: 'n = 3, connections = [[1, 2, 5], [1, 3, 6], [2, 3, 1]]',
        output: '6',
        explanation: 'Connecting (2,3) at cost 1 and (1,2) at cost 5 links all cities for a total of 6.',
      },
      {
        input: 'n = 4, connections = [[1, 2, 3], [3, 4, 4]]',
        output: '-1',
      },
    ],
    constraints: [
      '`1 <= n <= 10^4`',
      '`1 <= len(connections) <= 10^4`',
      '`1 <= cost <= 10^5`',
    ],
    starterCode: {
      python: `class Solution:
    def minimumCost(self, n: int, connections: list[list[int]]) -> int:
        # Return the MST weight, or -1 if the cities can't all be connected.
        pass
`,
    },
    methodName: 'minimumCost',
    argKeys: ['n', 'connections'],
    defaultTests: [
      { label: 'Solvable',    inputJson: '{"n":3,"connections":[[1,2,5],[1,3,6],[2,3,1]]}', expectedJson: '6'  },
      { label: 'Disconnected',inputJson: '{"n":4,"connections":[[1,2,3],[3,4,4]]}',          expectedJson: '-1' },
      { label: 'Single city', inputJson: '{"n":1,"connections":[]}',                         expectedJson: '0'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: "Kruskal's MST with Union-Find",
        intuition: "Sort all connections by cost, then greedily add the cheapest edge that connects two previously disconnected components using union-find. Stop when n-1 edges are used, or return -1 if that never happens.",
        code: `class Solution:
    def minimumCost(self, n: int, connections: list[list[int]]) -> int:
        parent = list(range(n + 1))

        def find(x: int) -> int:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        connections = sorted(connections, key=lambda e: e[2])
        total = 0
        edges_used = 0
        for a, b, cost in connections:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
                total += cost
                edges_used += 1
        return total if edges_used == n - 1 else -1
`,
        timeComplexity: 'O(E log E)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Min Cost to Connect All Points (LC #1584) ────────────────────────────
  {
    slug: 'min-cost-to-connect-all-points',
    lcNumber: 1584,
    title: 'Min Cost to Connect All Points',
    difficulty: 'Medium',
    pattern: 'MST',
    tags: ['graph', 'mst'],
    descriptionMd: `You are given an array \`points\` representing integer coordinates of some
points on a 2D plane, where \`points[i] = [xi, yi]\`.

The cost of connecting two points \`[xi, yi]\` and \`[xj, yj]\` is the **Manhattan
distance** between them: \`|xi - xj| + |yi - yj|\`.

Return the **minimum cost** to make all points connected. All points are connected if
there is exactly one simple path between any two points.`,
    examples: [
      {
        input: 'points = [[0, 0], [2, 2], [3, 10]]',
        output: '13',
        explanation: 'The two edges (0,0)-(2,2) and (2,2)-(3,10) connect all points for a total cost of 13.',
      },
      {
        input: 'points = [[0, 0]]',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= len(points) <= 1000`',
      '`-10^6 <= xi, yi <= 10^6`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def minCostConnectPoints(self, points: list[list[int]]) -> int:
        # Return the MST weight of the complete Manhattan-distance graph over points.
        pass
`,
    },
    methodName: 'minCostConnectPoints',
    argKeys: ['points'],
    defaultTests: [
      { label: 'Three points', inputJson: '{"points":[[0,0],[2,2],[3,10]]}', expectedJson: '13' },
      { label: 'Single',       inputJson: '{"points":[[0,0]]}',              expectedJson: '0'  },
      { label: 'Two',          inputJson: '{"points":[[0,0],[1,1]]}',        expectedJson: '2'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: "Prim's MST with Min-Heap",
        intuition: "Start from any point and greedily add the nearest unvisited point to the MST using a min-heap keyed by Manhattan distance. This avoids materializing all O(n^2) edges at once.",
        code: `import heapq


class Solution:
    def minCostConnectPoints(self, points: list[list[int]]) -> int:
        n = len(points)
        if n <= 1:
            return 0
        in_mst = [False] * n
        min_edge = [float('inf')] * n
        min_edge[0] = 0
        total = 0
        heap = [(0, 0)]
        while heap:
            cost, u = heapq.heappop(heap)
            if in_mst[u]:
                continue
            in_mst[u] = True
            total += cost
            xu, yu = points[u]
            for v in range(n):
                if in_mst[v]:
                    continue
                xv, yv = points[v]
                d = abs(xu - xv) + abs(yu - yv)
                if d < min_edge[v]:
                    min_edge[v] = d
                    heapq.heappush(heap, (d, v))
        return total
`,
        timeComplexity: 'O(n^2 log n)',
        spaceComplexity: 'O(n)',
      },
    ],
  },

  // ─── Network Delay Time (LC #743) ──────────────────────────────────────────
  {
    slug: 'network-delay-time',
    lcNumber: 743,
    title: 'Network Delay Time',
    difficulty: 'Medium',
    pattern: 'Dijkstra',
    tags: ['graph', 'dijkstra'],
    descriptionMd: `You are given a network of \`n\` nodes labelled from \`1\` to \`n\`. You are
also given \`times\`, a list of travel times as directed edges where
\`times[i] = [ui, vi, wi]\`, where \`ui\` is the source node, \`vi\` is the target node,
and \`wi\` is the time it takes for a signal to travel from source to target.

We will send a signal from a given node \`k\`. Return the **minimum time** it takes for
all the \`n\` nodes to receive the signal. If it is impossible for all the \`n\` nodes
to receive the signal, return \`-1\`.`,
    examples: [
      {
        input: 'times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n = 4, k = 2',
        output: '2',
      },
      {
        input: 'times = [[1, 2, 1]], n = 2, k = 1',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= n <= 100`',
      '`1 <= len(times) <= 6000`',
      '`1 <= w <= 100`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:
        # Return the minimum time for a signal from k to reach every node, or -1.
        pass
`,
    },
    methodName: 'networkDelayTime',
    argKeys: ['times', 'n', 'k'],
    defaultTests: [
      { label: 'Star',       inputJson: '{"times":[[2,1,1],[2,3,1],[3,4,1]],"n":4,"k":2}', expectedJson: '2'  },
      { label: 'Single hop', inputJson: '{"times":[[1,2,1]],"n":2,"k":1}',                  expectedJson: '1'  },
      { label: 'Unreachable',inputJson: '{"times":[[1,2,1]],"n":2,"k":2}',                  expectedJson: '-1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: "Dijkstra's Algorithm",
        intuition: "Build an adjacency list and run Dijkstra from node k using a min-heap. The answer is the maximum shortest-path distance among all nodes, or -1 if any node is unreachable.",
        code: `import heapq


class Solution:
    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:
        graph = [[] for _ in range(n + 1)]
        for u, v, w in times:
            graph[u].append((v, w))
        INF = float('inf')
        dist = [INF] * (n + 1)
        dist[k] = 0
        heap = [(0, k)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in graph[u]:
                nd = d + w
                if nd < dist[v]:
                    dist[v] = nd
                    heapq.heappush(heap, (nd, v))
        result = max(dist[1:])
        return -1 if result == INF else result
`,
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V + E)',
      },
    ],
  },

  // ─── Cheapest Flights Within K Stops (LC #787) ────────────────────────────
  {
    slug: 'cheapest-flights-within-k-stops',
    lcNumber: 787,
    title: 'Cheapest Flights Within K Stops',
    difficulty: 'Medium',
    pattern: 'Bellman-Ford',
    tags: ['graph', 'bellman-ford', 'dp'],
    descriptionMd: `There are \`n\` cities connected by some number of flights. You are given an
array \`flights\` where \`flights[i] = [fromi, toi, pricei]\` indicates that there is a
flight from city \`fromi\` to city \`toi\` with cost \`pricei\`.

You are also given three integers \`src\`, \`dst\`, and \`k\`. Return the **cheapest
price** from \`src\` to \`dst\` with at most \`k\` stops. If there is no such route,
return \`-1\`.`,
    examples: [
      {
        input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1',
        output: '200',
      },
      {
        input: 'n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 0',
        output: '500',
      },
    ],
    constraints: [
      '`1 <= n <= 100`',
      '`0 <= len(flights) <= n * (n - 1)`',
      '`0 <= k <= n - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def findCheapestPrice(self, n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
        # Return the cheapest fare within at most k stops, or -1 if none.
        pass
`,
    },
    methodName: 'findCheapestPrice',
    argKeys: ['n', 'flights', 'src', 'dst', 'k'],
    defaultTests: [
      {
        label: 'One stop allowed',
        inputJson: '{"n":3,"flights":[[0,1,100],[1,2,100],[0,2,500]],"src":0,"dst":2,"k":1}',
        expectedJson: '200',
      },
      {
        label: 'No stop allowed',
        inputJson: '{"n":3,"flights":[[0,1,100],[1,2,100],[0,2,500]],"src":0,"dst":2,"k":0}',
        expectedJson: '500',
      },
      {
        label: 'Unreachable',
        inputJson: '{"n":3,"flights":[[0,1,100],[1,2,100]],"src":0,"dst":2,"k":0}',
        expectedJson: '-1',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Bellman-Ford (Bounded Relaxation)',
        intuition: 'Run k+1 rounds of edge relaxation, but use a snapshot of distances each round so newly-relaxed values do not propagate within the same round. This correctly limits the path to at most k+1 edges (k stops).',
        code: `class Solution:
    def findCheapestPrice(self, n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
        INF = float('inf')
        dist = [INF] * n
        dist[src] = 0
        for _ in range(k + 1):
            snapshot = dist[:]
            for u, v, w in flights:
                if snapshot[u] != INF and snapshot[u] + w < dist[v]:
                    dist[v] = snapshot[u] + w
        return -1 if dist[dst] == INF else dist[dst]
`,
        timeComplexity: 'O(k * E)',
        spaceComplexity: 'O(V)',
      },
    ],
  },

  // ─── Path with Maximum Probability (LC #1514) ─────────────────────────────
  {
    slug: 'path-with-maximum-probability',
    lcNumber: 1514,
    title: 'Path with Maximum Probability',
    difficulty: 'Medium',
    pattern: 'Dijkstra',
    tags: ['graph', 'dijkstra'],
    descriptionMd: `You are given an undirected weighted graph of \`n\` nodes (0-indexed),
represented by an edge list \`edges\` where \`edges[i] = [a, b]\` is an undirected edge
connecting nodes \`a\` and \`b\` with a probability of success of traversing that edge
\`succProb[i]\`.

Given two nodes \`start\` and \`end\`, return the **maximum probability of success** to
go from \`start\` to \`end\`. The probability of a path is the **product** of the
success probabilities along its edges. If there is no path from \`start\` to \`end\`,
return \`0\`.`,
    examples: [
      {
        input: 'n = 2, edges = [[0, 1]], succProb = [0.5], start = 0, end = 1',
        output: '0.5',
      },
      {
        input: 'n = 2, edges = [], succProb = [], start = 0, end = 1',
        output: '0.0',
      },
    ],
    constraints: [
      '`2 <= n <= 10^4`',
      '`0 <= len(edges) <= 2 * 10^4`',
      '`0 <= succProb[i] <= 1`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def maxProbability(self, n: int, edges: list[list[int]], succProb: list[float], start: int, end: int) -> float:
        # Return the maximum path probability from start to end, or 0 if none.
        pass
`,
    },
    methodName: 'maxProbability',
    argKeys: ['n', 'edges', 'succProb', 'start', 'end'],
    defaultTests: [
      {
        label: 'Single edge',
        inputJson: '{"n":2,"edges":[[0,1]],"succProb":[0.5],"start":0,"end":1}',
        expectedJson: '0.5',
      },
      {
        label: 'Empty edges',
        inputJson: '{"n":2,"edges":[],"succProb":[],"start":0,"end":1}',
        expectedJson: '0.0',
      },
      {
        label: 'Product path',
        inputJson: '{"n":3,"edges":[[0,1],[1,2]],"succProb":[0.5,0.5],"start":0,"end":2}',
        expectedJson: '0.25',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Modified Dijkstra (Max-Heap)',
        intuition: 'Use a max-heap (negate probabilities to simulate max-heap with Python min-heap) and greedily expand the highest-probability path. When we pop the destination node, that is the answer.',
        code: `import heapq


class Solution:
    def maxProbability(self, n: int, edges: list[list[int]], succProb: list[float], start: int, end: int) -> float:
        graph = [[] for _ in range(n)]
        for (u, v), p in zip(edges, succProb):
            graph[u].append((v, p))
            graph[v].append((u, p))
        best = [0.0] * n
        best[start] = 1.0
        heap = [(-1.0, start)]
        while heap:
            neg_p, u = heapq.heappop(heap)
            p = -neg_p
            if u == end:
                return p
            if p < best[u]:
                continue
            for v, pw in graph[u]:
                np = p * pw
                if np > best[v]:
                    best[v] = np
                    heapq.heappush(heap, (-np, v))
        return 0.0
`,
        timeComplexity: 'O((V + E) log V)',
        spaceComplexity: 'O(V + E)',
      },
    ],
  },

  // ─── Alien Dictionary (LC #269) ────────────────────────────────────────────
  {
    slug: 'alien-dictionary',
    lcNumber: 269,
    title: 'Alien Dictionary',
    difficulty: 'Hard',
    pattern: 'Topological Sort',
    tags: ['graph', 'topological-sort', 'string'],
    descriptionMd: `There is a new alien language that uses the English alphabet. However, the
order among the letters is unknown to you.

You are given a list of \`words\` from the alien language's dictionary, where the words
are **sorted lexicographically** by the rules of this new language. Return a **string**
of the unique letters in the new alien language sorted in lexicographically increasing
order by the new language's rules.

If there is no solution — for example, because a word is a proper prefix of an earlier
word — return \`""\`.

> Because multiple valid orders often exist, our tests pick inputs whose ordering is
> uniquely determined, so any correct solution matches.`,
    examples: [
      {
        input: 'words = ["a", "b", "c"]',
        output: '"abc"',
      },
      {
        input: 'words = ["abc", "ab"]',
        output: '""',
        explanation: '"ab" is a proper prefix of "abc" but comes after it, so no valid ordering exists.',
      },
    ],
    constraints: [
      '`1 <= len(words) <= 100`',
      '`1 <= len(words[i]) <= 100`',
      '`words[i]` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def alienOrder(self, words: list[str]) -> str:
        # Return the alien alphabet order, or "" if invalid / under-determined.
        pass
`,
    },
    methodName: 'alienOrder',
    argKeys: ['words'],
    defaultTests: [
      { label: 'Linear chain', inputJson: '{"words":["a","b","c"]}', expectedJson: '"abc"' },
      { label: 'Invalid',      inputJson: '{"words":["abc","ab"]}',  expectedJson: '""'   },
      { label: 'Single',       inputJson: '{"words":["z"]}',          expectedJson: '"z"'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: "Kahn's BFS Topological Sort",
        intuition: "Compare adjacent words to extract letter-ordering constraints as directed edges. Then run Kahn's algorithm to produce a topological order. If a prefix violation or cycle is found, return empty string.",
        code: `from collections import deque


class Solution:
    def alienOrder(self, words: list[str]) -> str:
        letters = set()
        for w in words:
            for ch in w:
                letters.add(ch)
        graph = {c: set() for c in letters}
        indeg = {c: 0 for c in letters}
        for i in range(len(words) - 1):
            a, b = words[i], words[i + 1]
            if len(a) > len(b) and a.startswith(b):
                return ""
            for x, y in zip(a, b):
                if x != y:
                    if y not in graph[x]:
                        graph[x].add(y)
                        indeg[y] += 1
                    break
        queue = deque([c for c in letters if indeg[c] == 0])
        out = []
        while queue:
            cur = queue.popleft()
            out.append(cur)
            for nb in graph[cur]:
                indeg[nb] -= 1
                if indeg[nb] == 0:
                    queue.append(nb)
        if len(out) != len(letters):
            return ""
        return ''.join(out)
`,
        timeComplexity: 'O(C) where C is total characters across all words',
        spaceComplexity: 'O(U) where U is the number of unique letters',
      },
    ],
  },

  // ─── Satisfiability of Equality Equations (LC #990) ────────────────────────
  {
    slug: 'satisfiability-of-equality-equations',
    lcNumber: 990,
    title: 'Satisfiability of Equality Equations',
    difficulty: 'Medium',
    pattern: 'Union-Find',
    tags: ['union-find', 'graph'],
    descriptionMd: `You are given an array of strings \`equations\` that represent relationships
between variables where each string \`equations[i]\` is of length \`4\` and takes one of
two different forms: \`"xi==yi"\` or \`"xi!=yi"\`. Here, \`xi\` and \`yi\` are
lowercase letters (not necessarily different) that represent one-letter variable names.

Return \`True\` if it is possible to assign integers to variable names so as to satisfy
**all** the given equations, or \`False\` otherwise.`,
    examples: [
      {
        input: 'equations = ["b==a", "a==b"]',
        output: 'True',
      },
      {
        input: 'equations = ["a==b", "b!=a"]',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(equations) <= 500`',
      'Each equation is exactly 4 characters.',
      'Variables are single lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def equationsPossible(self, equations: list[str]) -> bool:
        # Return True if the equality/inequality constraints are jointly satisfiable.
        pass
`,
    },
    methodName: 'equationsPossible',
    argKeys: ['equations'],
    defaultTests: [
      { label: 'Consistent',   inputJson: '{"equations":["b==a","a==b"]}',       expectedJson: 'true'  },
      { label: 'Direct contradiction', inputJson: '{"equations":["a==b","b!=a"]}', expectedJson: 'false' },
      { label: 'Transitive contradiction', inputJson: '{"equations":["a==b","b==c","c!=a"]}', expectedJson: 'false' },
      { label: 'Independent',  inputJson: '{"equations":["a==b","c!=d"]}',        expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Union-Find',
        intuition: 'First union all variables in equality equations into the same group. Then check each inequality equation: if both variables share the same root, the constraints are contradictory.',
        code: `class Solution:
    def equationsPossible(self, equations: list[str]) -> bool:
        parent = {ch: ch for ch in 'abcdefghijklmnopqrstuvwxyz'}

        def find(x: str) -> str:
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for eq in equations:
            if eq[1] == '=':
                a, b = eq[0], eq[3]
                ra, rb = find(a), find(b)
                if ra != rb:
                    parent[ra] = rb
        for eq in equations:
            if eq[1] == '!':
                a, b = eq[0], eq[3]
                if find(a) == find(b):
                    return False
        return True
`,
        timeComplexity: 'O(n * alpha(26))',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Path With Minimum Effort (LC #1631) ──────────────────────────────────
  {
    slug: 'path-with-minimum-effort',
    lcNumber: 1631,
    title: 'Path With Minimum Effort',
    difficulty: 'Medium',
    pattern: 'Dijkstra',
    tags: ['matrix', 'dijkstra', 'binary-search'],
    descriptionMd: `You are a hiker preparing for an upcoming hike. You are given \`heights\`, a
\`m x n\` 0-indexed 2D array of size \`m x n\`, where \`heights[row][col]\` represents
the height of cell \`(row, col)\`. You are situated in the top-left cell \`(0, 0)\`, and
you hope to travel to the bottom-right cell \`(m - 1, n - 1)\` (i.e., 0-indexed). You
can move **up, down, left, or right**, and you wish to find a route that requires the
minimum **effort**.

A route's **effort** is the **maximum absolute difference** in heights between two
consecutive cells of the route.

Return the minimum **effort** required to travel from the top-left cell to the
bottom-right cell.`,
    examples: [
      {
        input: 'heights = [[1, 2, 3]]',
        output: '1',
      },
      {
        input: 'heights = [[1, 10], [10, 1]]',
        output: '9',
      },
    ],
    constraints: [
      '`1 <= m, n <= 100`',
      '`1 <= heights[i][j] <= 10^6`',
    ],
    starterCode: {
      python: `import heapq


class Solution:
    def minimumEffortPath(self, heights: list[list[int]]) -> int:
        # Return the minimum possible maximum step-height from (0,0) to (m-1,n-1).
        pass
`,
    },
    methodName: 'minimumEffortPath',
    argKeys: ['heights'],
    defaultTests: [
      { label: 'Single row',  inputJson: '{"heights":[[1,2,3]]}',       expectedJson: '1' },
      { label: 'Forced jump', inputJson: '{"heights":[[1,10],[10,1]]}', expectedJson: '9' },
      { label: 'Single cell', inputJson: '{"heights":[[1]]}',           expectedJson: '0' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Dijkstra (Modified)',
        intuition: 'Treat the grid as a graph where each cell is a node and each step has a cost equal to the absolute height difference. Use Dijkstra with a min-heap where the "distance" is the maximum step cost along the path so far.',
        code: `import heapq


class Solution:
    def minimumEffortPath(self, heights: list[list[int]]) -> int:
        m = len(heights)
        n = len(heights[0]) if m else 0
        INF = float('inf')
        effort = [[INF] * n for _ in range(m)]
        effort[0][0] = 0
        heap = [(0, 0, 0)]
        while heap:
            e, r, c = heapq.heappop(heap)
            if r == m - 1 and c == n - 1:
                return e
            if e > effort[r][c]:
                continue
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n:
                    ne = max(e, abs(heights[nr][nc] - heights[r][c]))
                    if ne < effort[nr][nc]:
                        effort[nr][nc] = ne
                        heapq.heappush(heap, (ne, nr, nc))
        return 0
`,
        timeComplexity: 'O(m * n * log(m * n))',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },
];
