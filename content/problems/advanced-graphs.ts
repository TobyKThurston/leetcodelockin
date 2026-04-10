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
    descriptionMd: `You have \`numCourses\` courses labelled \`0..numCourses - 1\`. Some courses have
prerequisites represented as \`prerequisites[i] = [a, b]\`, meaning "to take course \`a\`
you must first take course \`b\`". Return \`True\` if you can complete **every** course
(i.e., the prerequisite graph has no cycle) and \`False\` otherwise.

Either Kahn's BFS topological sort or a DFS with "visiting / visited" colours detects the
cycle in linear time.`,
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
  },

  // ─── Course Schedule II (LC #210) ──────────────────────────────────────────
  {
    slug: 'course-schedule-ii',
    lcNumber: 210,
    title: 'Course Schedule II',
    difficulty: 'Medium',
    pattern: 'Topological Sort',
    tags: ['graph', 'topological-sort'],
    descriptionMd: `Given \`numCourses\` courses labelled \`0..numCourses - 1\` and a list of
prerequisite pairs \`[a, b]\` meaning "course \`a\` requires course \`b\` first", return a
**valid ordering** to take all of them. If no valid ordering exists (i.e. a cycle), return
the empty list.

> Because multiple valid orderings usually exist, our tests pick inputs whose topological
> order is uniquely determined (e.g. linear chains), so any correct Kahn's / DFS solution
> matches.`,
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
  },

  // ─── Redundant Connection (LC #684) ────────────────────────────────────────
  {
    slug: 'redundant-connection',
    lcNumber: 684,
    title: 'Redundant Connection',
    difficulty: 'Medium',
    pattern: 'Union-Find',
    tags: ['graph', 'union-find'],
    descriptionMd: `You are given an undirected graph that started as a tree on nodes \`1..n\` and had
exactly one extra edge added. Return that extra edge as \`[a, b]\`. If more than one answer
exists, return the one that appears **last** in \`edges\`.

Union-find makes this elegant: walk \`edges\` left to right, unioning each endpoint pair;
the first edge whose endpoints are already in the same component is the redundant one
(and because the problem guarantees exactly one extra edge, that's also the last such).`,
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
  },

  // ─── Number of Connected Components in an Undirected Graph (LC #323) ──────
  {
    slug: 'number-of-connected-components-in-an-undirected-graph',
    lcNumber: 323,
    title: 'Number of Connected Components in an Undirected Graph',
    difficulty: 'Medium',
    pattern: 'Union-Find',
    tags: ['graph', 'union-find', 'dfs'],
    descriptionMd: `You are given an integer \`n\` (nodes labelled \`0..n-1\`) and a list of undirected
\`edges\`. Return the number of **connected components** in the graph.

Union-find runs in near-linear time. A plain DFS/BFS from every unvisited node also works.`,
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
  },

  // ─── Connecting Cities With Minimum Cost (LC #1135) ───────────────────────
  {
    slug: 'connecting-cities-with-minimum-cost',
    lcNumber: 1135,
    title: 'Connecting Cities With Minimum Cost',
    difficulty: 'Medium',
    pattern: 'MST',
    tags: ['graph', 'mst', 'union-find'],
    descriptionMd: `You are given \`n\` cities labelled \`1..n\` and a list of bidirectional
\`connections\`, where each entry \`[a, b, cost]\` is a cable you can lay between cities
\`a\` and \`b\` for \`cost\`. Return the **minimum total cost** to connect every city
(i.e., the weight of a minimum spanning tree). If the cities can't all be connected, return
\`-1\`.

Classic MST problem — Kruskal's with union-find is the short solution.`,
    examples: [
      {
        input: 'n = 3, connections = [[1, 2, 5], [1, 3, 6], [2, 3, 1]]',
        output: '6',
        explanation: 'Take edges (2,3,1) and (1,2,5) — total 6.',
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
  },

  // ─── Min Cost to Connect All Points (LC #1584) ────────────────────────────
  {
    slug: 'min-cost-to-connect-all-points',
    lcNumber: 1584,
    title: 'Min Cost to Connect All Points',
    difficulty: 'Medium',
    pattern: 'MST',
    tags: ['graph', 'mst'],
    descriptionMd: `You are given an array \`points\` where \`points[i] = [xi, yi]\` is a point on a
2D plane. The cost of connecting any two points is their **Manhattan distance**
\`|xi - xj| + |yi - yj|\`. Return the **minimum total cost** to connect all the points
into a single connected graph.

Construct the complete graph of \`n\` points and run an MST algorithm (Prim's with a heap
is \`O(n^2 log n)\`; union-find Kruskal's also works).`,
    examples: [
      {
        input: 'points = [[0, 0], [2, 2], [3, 10]]',
        output: '13',
        explanation: 'Connect (0,0)-(2,2) cost 4, then (2,2)-(3,10) cost 9 → total 13.',
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
  },

  // ─── Network Delay Time (LC #743) ──────────────────────────────────────────
  {
    slug: 'network-delay-time',
    lcNumber: 743,
    title: 'Network Delay Time',
    difficulty: 'Medium',
    pattern: 'Dijkstra',
    tags: ['graph', 'dijkstra'],
    descriptionMd: `You have \`n\` network nodes labelled \`1..n\`. A signal is sent from node \`k\`
across weighted directed edges \`times[i] = [u, v, w]\` (edge \`u -> v\` with travel
time \`w\`). Return the **minimum time** for the signal to reach **every** node, or \`-1\`
if any node cannot receive it.

The textbook solution is Dijkstra's algorithm from \`k\`: the answer is the maximum of all
shortest-path distances, or \`-1\` if any is infinite.`,
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
  },

  // ─── Cheapest Flights Within K Stops (LC #787) ────────────────────────────
  {
    slug: 'cheapest-flights-within-k-stops',
    lcNumber: 787,
    title: 'Cheapest Flights Within K Stops',
    difficulty: 'Medium',
    pattern: 'Bellman-Ford',
    tags: ['graph', 'bellman-ford', 'dp'],
    descriptionMd: `There are \`n\` cities connected by directed \`flights[i] = [from, to, price]\`.
Given a start city \`src\`, a destination city \`dst\`, and an integer \`k\`, return the
cheapest price to travel from \`src\` to \`dst\` using **at most \`k\` stops** (i.e. at
most \`k + 1\` edges). If no such path exists, return \`-1\`.

Bounded-edge shortest path is a job for Bellman-Ford: run \`k + 1\` relaxation rounds,
using a **snapshot** of distances each round so a newly-relaxed distance isn't propagated
within the same round.`,
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
  },

  // ─── Path with Maximum Probability (LC #1514) ─────────────────────────────
  {
    slug: 'path-with-maximum-probability',
    lcNumber: 1514,
    title: 'Path with Maximum Probability',
    difficulty: 'Medium',
    pattern: 'Dijkstra',
    tags: ['graph', 'dijkstra'],
    descriptionMd: `You are given an undirected graph with \`n\` nodes and a list of bidirectional
\`edges\`, where \`edges[i] = [u, v]\` has success probability \`succProb[i]\`. Return the
maximum probability that a path from node \`start\` to node \`end\` succeeds, where the
probability of a path is the **product** of its edge probabilities. If no path exists,
return \`0\`.

Dijkstra's algorithm applied to logarithms — or equivalently a max-heap keyed by
probability — gives the answer in \`O((n + m) log n)\`.`,
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
  },

  // ─── Alien Dictionary (LC #269) ────────────────────────────────────────────
  {
    slug: 'alien-dictionary',
    lcNumber: 269,
    title: 'Alien Dictionary',
    difficulty: 'Hard',
    pattern: 'Topological Sort',
    tags: ['graph', 'topological-sort', 'string'],
    descriptionMd: `You are given a list of \`words\` from an alien language, sorted lexicographically
according to the rules of that language's alphabet. Return a **string** of the letters in
the order they appear in the alien alphabet. If the order cannot be determined (for example,
because a prefix word appears **after** one of its extensions), return the empty string.

Build a directed graph of letter-before-letter constraints from adjacent word pairs, then
run a topological sort (either Kahn's or DFS).

> Because multiple valid orders often exist, our tests pick inputs whose topological order
> is uniquely determined, so any correct topological-sort solution matches.`,
    examples: [
      {
        input: 'words = ["a", "b", "c"]',
        output: '"abc"',
      },
      {
        input: 'words = ["abc", "ab"]',
        output: '""',
        explanation: '"ab" is a proper prefix of "abc" but comes after it — invalid dictionary.',
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
  },

  // ─── Satisfiability of Equality Equations (LC #990) ────────────────────────
  {
    slug: 'satisfiability-of-equality-equations',
    lcNumber: 990,
    title: 'Satisfiability of Equality Equations',
    difficulty: 'Medium',
    pattern: 'Union-Find',
    tags: ['union-find', 'graph'],
    descriptionMd: `You are given a list of four-character \`equations\` like \`"a==b"\` or
\`"b!=c"\`. Return \`True\` if it is possible to assign values to the involved single-letter
variables so that **every** equation holds. Otherwise return \`False\`.

Union-find makes this simple: first union all variables appearing in \`==\` equations, then
walk the \`!=\` equations and check that no pair is already in the same component.`,
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
  },

  // ─── Path With Minimum Effort (LC #1631) ──────────────────────────────────
  {
    slug: 'path-with-minimum-effort',
    lcNumber: 1631,
    title: 'Path With Minimum Effort',
    difficulty: 'Medium',
    pattern: 'Dijkstra',
    tags: ['matrix', 'dijkstra', 'binary-search'],
    descriptionMd: `You are given an \`m x n\` integer matrix \`heights\`. You start at the top-left
cell \`(0, 0)\` and want to reach the bottom-right cell \`(m-1, n-1)\`. At every step you
can move up / down / left / right. The **effort** of a path is the **maximum absolute
difference** in heights between any two consecutive cells. Return the minimum effort of any
valid path.

Either a Dijkstra-style search where each node's "distance" is the minimum max-edge cost
seen so far, or a binary search on the effort value with a BFS/DFS predicate, works.`,
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
  },
];
