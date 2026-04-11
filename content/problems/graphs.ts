// ─── Graphs problems ────────────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const GRAPHS_PROBLEMS: ProblemContent[] = [
  // ─── Flood Fill (LC #733) ──────────────────────────────────────────────────
  {
    slug: 'flood-fill',
    lcNumber: 733,
    title: 'Flood Fill',
    difficulty: 'Easy',
    pattern: 'DFS / BFS',
    tags: ['matrix', 'dfs', 'bfs'],
    descriptionMd: `You are given a 2D grid \`image\` of integer colours, a starting pixel at
\`(sr, sc)\`, and a new \`color\`. Perform a **flood fill** from \`(sr, sc)\`: replace the
colour of the starting pixel and every 4-connected neighbour that currently has the same
original colour with the new \`color\`. Return the updated image.

> Edge case: if the starting pixel is already \`color\`, return the image unchanged —
> otherwise a naive DFS will loop forever.`,
    examples: [
      {
        input: 'image = [[0, 0, 0], [0, 1, 1]], sr = 1, sc = 1, color = 5',
        output: '[[0, 0, 0], [0, 5, 5]]',
      },
      {
        input: 'image = [[3]], sr = 0, sc = 0, color = 3',
        output: '[[3]]',
        explanation: 'Already the target colour — no work to do.',
      },
    ],
    constraints: [
      '`1 <= m, n <= 50`',
      '`0 <= image[i][j], color < 2^16`',
      '`0 <= sr < m, 0 <= sc < n`',
    ],
    starterCode: {
      python: `class Solution:
    def floodFill(self, image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
        # Flood fill starting at (sr, sc) with the new color; return the updated image.
        pass
`,
    },
    methodName: 'floodFill',
    argKeys: ['image', 'sr', 'sc', 'color'],
    defaultTests: [
      {
        label: 'Two-pixel fill',
        inputJson: '{"image":[[0,0,0],[0,1,1]],"sr":1,"sc":1,"color":5}',
        expectedJson: '[[0,0,0],[0,5,5]]',
      },
      {
        label: 'Same colour',
        inputJson: '{"image":[[3]],"sr":0,"sc":0,"color":3}',
        expectedJson: '[[3]]',
      },
      {
        label: 'Single cell',
        inputJson: '{"image":[[1,2],[3,4]],"sr":0,"sc":0,"color":9}',
        expectedJson: '[[9,2],[3,4]]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS',
        intuition: 'Start from (sr, sc) and recursively visit all 4-connected cells that share the original color, recoloring each to the new color. If the starting pixel already matches the target color, return immediately to avoid infinite recursion.',
        code: `class Solution:
    def floodFill(self, image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:
        original = image[sr][sc]
        if original == color:
            return image
        m = len(image)
        n = len(image[0]) if m else 0

        def dfs(r: int, c: int):
            if r < 0 or r >= m or c < 0 or c >= n or image[r][c] != original:
                return
            image[r][c] = color
            dfs(r + 1, c)
            dfs(r - 1, c)
            dfs(r, c + 1)
            dfs(r, c - 1)

        dfs(sr, sc)
        return image`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Number of Islands (LC #200) ───────────────────────────────────────────
  {
    slug: 'number-of-islands',
    lcNumber: 200,
    title: 'Number of Islands',
    difficulty: 'Medium',
    pattern: 'DFS / BFS',
    tags: ['matrix', 'dfs', 'bfs', 'union-find'],
    descriptionMd: `Given an \`m x n\` grid of characters \`'1'\` (land) and \`'0'\` (water), return the
number of islands — a group of 4-connected land cells counts as a single island.

A DFS or BFS from every unvisited \`'1'\` cell works; so does union-find over all
horizontal/vertical pairs of land cells.`,
    examples: [
      {
        input: 'grid = [["1","1","0","0"],["1","1","0","0"],["0","0","1","0"]]',
        output: '2',
      },
      {
        input: 'grid = [["1","0","1"],["0","1","0"],["1","0","1"]]',
        output: '5',
      },
    ],
    constraints: [
      '`1 <= m, n <= 300`',
      '`grid[i][j]` is `"0"` or `"1"`.',
    ],
    starterCode: {
      python: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        # Return the number of 4-connected "1" components.
        pass
`,
    },
    methodName: 'numIslands',
    argKeys: ['grid'],
    defaultTests: [
      {
        label: 'Two islands',
        inputJson: '{"grid":[["1","1","0","0"],["1","1","0","0"],["0","0","1","0"]]}',
        expectedJson: '2',
      },
      {
        label: 'Checkerboard',
        inputJson: '{"grid":[["1","0","1"],["0","1","0"],["1","0","1"]]}',
        expectedJson: '5',
      },
      {
        label: 'All water',
        inputJson: '{"grid":[["0"]]}',
        expectedJson: '0',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS',
        intuition: 'Scan the grid for unvisited land cells. When you find one, run a DFS/BFS to mark all connected land as visited, incrementing the island count. Use a seen matrix or mutate the grid to track visits.',
        code: `class Solution:
    def numIslands(self, grid: list[list[str]]) -> int:
        m = len(grid)
        n = len(grid[0]) if m else 0
        seen = [[False] * n for _ in range(m)]

        def dfs(r: int, c: int):
            stack = [(r, c)]
            while stack:
                cr, cc = stack.pop()
                if cr < 0 or cr >= m or cc < 0 or cc >= n:
                    continue
                if seen[cr][cc] or grid[cr][cc] == '0':
                    continue
                seen[cr][cc] = True
                stack.append((cr + 1, cc))
                stack.append((cr - 1, cc))
                stack.append((cr, cc + 1))
                stack.append((cr, cc - 1))

        count = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == '1' and not seen[r][c]:
                    dfs(r, c)
                    count += 1
        return count`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Max Area of Island (LC #695) ──────────────────────────────────────────
  {
    slug: 'max-area-of-island',
    lcNumber: 695,
    title: 'Max Area of Island',
    difficulty: 'Medium',
    pattern: 'DFS',
    tags: ['matrix', 'dfs'],
    descriptionMd: `Given an \`m x n\` grid of integers \`0\` (water) and \`1\` (land), return the
**area** (number of cells) of the largest 4-connected island. Return \`0\` if there is no
land.`,
    examples: [
      {
        input: 'grid = [[1, 1, 0], [1, 0, 0], [0, 0, 1]]',
        output: '3',
      },
      {
        input: 'grid = [[0, 0], [0, 0]]',
        output: '0',
      },
    ],
    constraints: [
      '`1 <= m, n <= 50`',
      '`grid[i][j]` is `0` or `1`.',
    ],
    starterCode: {
      python: `class Solution:
    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:
        # Return the area of the largest 4-connected island, or 0 if none.
        pass
`,
    },
    methodName: 'maxAreaOfIsland',
    argKeys: ['grid'],
    defaultTests: [
      { label: 'Three cells', inputJson: '{"grid":[[1,1,0],[1,0,0],[0,0,1]]}', expectedJson: '3' },
      { label: 'All water',   inputJson: '{"grid":[[0,0],[0,0]]}',               expectedJson: '0' },
      { label: 'Single cell', inputJson: '{"grid":[[1]]}',                       expectedJson: '1' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS',
        intuition: 'For each land cell, run a recursive DFS that marks the cell as visited (e.g. set to -1), counts it as 1, and adds the area of all 4-connected land neighbors. Track the maximum area across all DFS calls.',
        code: `class Solution:
    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:
        m = len(grid)
        n = len(grid[0]) if m else 0

        def dfs(r: int, c: int) -> int:
            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != 1:
                return 0
            grid[r][c] = -1
            return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)

        best = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == 1:
                    best = max(best, dfs(r, c))
        return best`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Island Perimeter (LC #463) ────────────────────────────────────────────
  {
    slug: 'island-perimeter',
    lcNumber: 463,
    title: 'Island Perimeter',
    difficulty: 'Easy',
    pattern: 'Grid',
    tags: ['matrix'],
    descriptionMd: `Given a grid with exactly one 4-connected island (cells of \`1\`) surrounded by
water (cells of \`0\`), return the **perimeter** of the island. The perimeter is the number
of edges that border either water or the edge of the grid.

The direct scan: for each land cell, add \`4\` minus twice the number of land neighbours
(each shared edge is counted twice across the two cells).`,
    examples: [
      {
        input: 'grid = [[0, 1, 0], [1, 1, 1], [0, 1, 0]]',
        output: '12',
        explanation: 'A plus-shaped island with 5 cells, 4 internal edges: 20 - 2*4 = 12.',
      },
      {
        input: 'grid = [[1]]',
        output: '4',
      },
    ],
    constraints: [
      '`1 <= m, n <= 100`',
      '`grid[i][j]` is `0` or `1`.',
      'The island is guaranteed to be connected with no lakes.',
    ],
    starterCode: {
      python: `class Solution:
    def islandPerimeter(self, grid: list[list[int]]) -> int:
        # Return the total perimeter of the single island.
        pass
`,
    },
    methodName: 'islandPerimeter',
    argKeys: ['grid'],
    defaultTests: [
      { label: 'Plus shape',  inputJson: '{"grid":[[0,1,0],[1,1,1],[0,1,0]]}', expectedJson: '12' },
      { label: 'Single cell', inputJson: '{"grid":[[1]]}',                       expectedJson: '4'  },
      { label: 'Corner',      inputJson: '{"grid":[[1,0],[0,0]]}',               expectedJson: '4'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Direct Counting',
        intuition: 'For each land cell, start with 4 edges of perimeter. Subtract 2 for every neighbor above or to the left that is also land, since each shared edge removes one perimeter unit from each cell.',
        code: `class Solution:
    def islandPerimeter(self, grid: list[list[int]]) -> int:
        m = len(grid)
        n = len(grid[0]) if m else 0
        total = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] != 1:
                    continue
                total += 4
                if r > 0 and grid[r - 1][c] == 1:
                    total -= 2
                if c > 0 and grid[r][c - 1] == 1:
                    total -= 2
        return total`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Rotting Oranges (LC #994) ─────────────────────────────────────────────
  {
    slug: 'rotting-oranges',
    lcNumber: 994,
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    pattern: 'BFS',
    tags: ['matrix', 'bfs'],
    descriptionMd: `You are given an \`m x n\` grid where \`0\` is empty, \`1\` is a fresh orange, and
\`2\` is a rotten orange. Every minute, every fresh orange that is 4-connected to at least
one rotten orange becomes rotten. Return the **minimum number of minutes** until no fresh
oranges remain, or \`-1\` if some fresh orange can never rot.

The canonical solution is a multi-source BFS from every initially-rotten orange, tracking
levels as minutes.`,
    examples: [
      {
        input: 'grid = [[2, 1], [1, 1]]',
        output: '2',
      },
      {
        input: 'grid = [[1]]',
        output: '-1',
      },
    ],
    constraints: [
      '`1 <= m, n <= 10`',
      '`grid[i][j]` is `0`, `1`, or `2`.',
    ],
    starterCode: {
      python: `class Solution:
    def orangesRotting(self, grid: list[list[int]]) -> int:
        # Return the minutes until all fresh oranges rot, or -1 if impossible.
        pass
`,
    },
    methodName: 'orangesRotting',
    argKeys: ['grid'],
    defaultTests: [
      { label: 'Corner source', inputJson: '{"grid":[[2,1],[1,1]]}',  expectedJson: '2'  },
      { label: 'Unreachable',   inputJson: '{"grid":[[1]]}',          expectedJson: '-1' },
      { label: 'Already done',  inputJson: '{"grid":[[0,2]]}',        expectedJson: '0'  },
      { label: 'Empty grid',    inputJson: '{"grid":[[0]]}',          expectedJson: '0'  },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Multi-Source BFS',
        intuition: 'Enqueue all initially rotten oranges with time 0. BFS level by level -- each level is one minute. When a rotten orange is dequeued, rot its fresh neighbors and enqueue them. If any fresh oranges remain unreached, return -1.',
        code: `from collections import deque


class Solution:
    def orangesRotting(self, grid: list[list[int]]) -> int:
        m = len(grid)
        n = len(grid[0]) if m else 0
        queue = deque()
        fresh = 0
        for r in range(m):
            for c in range(n):
                if grid[r][c] == 2:
                    queue.append((r, c, 0))
                elif grid[r][c] == 1:
                    fresh += 1
        last_minute = 0
        while queue:
            r, c, t = queue.popleft()
            last_minute = max(last_minute, t)
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc, t + 1))
        if fresh > 0:
            return -1
        return last_minute`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Clone Graph (LC #133) ─────────────────────────────────────────────────
  {
    slug: 'clone-graph',
    lcNumber: 133,
    title: 'Clone Graph',
    difficulty: 'Medium',
    pattern: 'DFS / BFS',
    tags: ['graph', 'dfs', 'bfs'],
    descriptionMd: `You are given an undirected, connected graph serialised as an **adjacency list**
\`adjList\`, where node values are \`1\` through \`n\` and \`adjList[i]\` is the list of
1-indexed neighbours of the \`(i + 1)\`-th node. Return a **deep copy** of the graph,
serialised in the same way.

The two classic approaches are DFS with a hash map from original to cloned node, or BFS
with the same kind of map.`,
    examples: [
      {
        input: 'adjList = [[2], [1]]',
        output: '[[2], [1]]',
      },
      {
        input: 'adjList = [[2, 4], [1, 3], [2, 4], [1, 3]]',
        output: '[[2, 4], [1, 3], [2, 4], [1, 3]]',
      },
    ],
    constraints: [
      '`0 <= len(adjList) <= 100`',
      'Neighbour lists use 1-based indices.',
      'The graph has no self-loops and no repeated edges.',
    ],
    starterCode: {
      python: `class Node:
    def __init__(self, val: int = 0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


def _to_graph(adj_list):
    if not adj_list:
        return None
    nodes = [Node(i + 1) for i in range(len(adj_list))]
    for i, neigh in enumerate(adj_list):
        nodes[i].neighbors = [nodes[j - 1] for j in neigh]
    return nodes[0]


def _from_graph(head):
    if head is None:
        return []
    seen = {}
    order = []
    stack = [head]
    while stack:
        node = stack.pop()
        if node.val in seen:
            continue
        seen[node.val] = len(order)
        order.append(node)
        for nb in node.neighbors:
            if nb.val not in seen:
                stack.append(nb)
    order.sort(key=lambda n: n.val)
    out = [[] for _ in range(len(order))]
    val_to_idx = {n.val: i for i, n in enumerate(order)}
    for n in order:
        out[val_to_idx[n.val]] = sorted([nb.val for nb in n.neighbors])
    return out


class Solution:
    def cloneGraph(self, adjList: list[list[int]]) -> list[list[int]]:
        head = _to_graph(adjList)

        # ─── Produce a deep copy of the graph below ────────────────
        # Hint: DFS with a dict[original_node, cloned_node].
        new_head = head  # TODO: replace with the cloned head
        # ───────────────────────────────────────────────────────────

        return _from_graph(new_head)
`,
    },
    methodName: 'cloneGraph',
    argKeys: ['adjList'],
    defaultTests: [
      { label: 'Two nodes',  inputJson: '{"adjList":[[2],[1]]}',               expectedJson: '[[2],[1]]'              },
      { label: 'Four nodes', inputJson: '{"adjList":[[2,4],[1,3],[2,4],[1,3]]}', expectedJson: '[[2,4],[1,3],[2,4],[1,3]]' },
      { label: 'Empty',      inputJson: '{"adjList":[]}',                       expectedJson: '[]'                      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'DFS with Hash Map',
        intuition: 'Traverse the original graph with DFS. For each node, create a clone and store the original-to-clone mapping. When visiting neighbors, return the existing clone if already mapped, otherwise recurse.',
        code: `class Solution:
    def cloneGraph(self, adjList: list[list[int]]) -> list[list[int]]:
        head = _to_graph(adjList)
        if head is None:
            return []
        mapping = {}

        def dfs(node):
            if node.val in mapping:
                return mapping[node.val]
            cloned = Node(node.val)
            mapping[node.val] = cloned
            for nb in node.neighbors:
                cloned.neighbors.append(dfs(nb))
            return cloned

        new_head = dfs(head)
        return _from_graph(new_head)`,
        timeComplexity: 'O(V + E)',
        spaceComplexity: 'O(V)',
      },
    ],
  },

  // ─── Pacific Atlantic Water Flow (LC #417) ─────────────────────────────────
  {
    slug: 'pacific-atlantic-water-flow',
    lcNumber: 417,
    title: 'Pacific Atlantic Water Flow',
    difficulty: 'Medium',
    pattern: 'DFS',
    tags: ['matrix', 'dfs', 'bfs'],
    descriptionMd: `You are given an \`m x n\` integer grid \`heights\` where \`heights[i][j]\` is the
height of the cell at position \`(i, j)\`. The Pacific Ocean touches the **top** and
**left** edges of the grid; the Atlantic Ocean touches the **bottom** and **right** edges.
Water can flow from a cell to any neighbouring cell with height **less than or equal** to
its own. Return every cell from which water can reach **both** oceans, as a list of
\`[r, c]\` pairs.

The efficient solution reverses the flow: from each ocean's edge, run a DFS that only steps
to a neighbour with **greater-or-equal** height, marking every reachable cell. The answer
is the intersection of the two reachable sets.`,
    examples: [
      {
        input: 'heights = [[1, 2], [3, 4]]',
        output: '[[0, 1], [1, 0], [1, 1]]',
      },
      {
        input: 'heights = [[5]]',
        output: '[[0, 0]]',
      },
    ],
    constraints: [
      '`1 <= m, n <= 200`',
      '`0 <= heights[i][j] <= 10^5`',
    ],
    starterCode: {
      python: `class Solution:
    def pacificAtlantic(self, heights: list[list[int]]) -> list[list[int]]:
        # Return every (r, c) that can reach both the Pacific and Atlantic edges.
        pass
`,
    },
    methodName: 'pacificAtlantic',
    argKeys: ['heights'],
    defaultTests: [
      { label: 'Two by two', inputJson: '{"heights":[[1,2],[3,4]]}', expectedJson: '[[0,1],[1,0],[1,1]]' },
      { label: 'Single',     inputJson: '{"heights":[[5]]}',         expectedJson: '[[0,0]]'              },
    ],
    // set: order of returned cells is unspecified.
    resultCompare: 'set',
    solutions: [
      {
        approach: 'Reverse DFS from Edges',
        intuition: 'Instead of checking each cell, reverse the flow: DFS from every Pacific-edge cell and every Atlantic-edge cell, stepping only to neighbors with greater-or-equal height. The answer is the intersection of cells reachable from both oceans.',
        code: `class Solution:
    def pacificAtlantic(self, heights: list[list[int]]) -> list[list[int]]:
        m = len(heights)
        n = len(heights[0]) if m else 0
        pacific = [[False] * n for _ in range(m)]
        atlantic = [[False] * n for _ in range(m)]

        def dfs(r: int, c: int, visited):
            visited[r][c] = True
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and not visited[nr][nc]:
                    if heights[nr][nc] >= heights[r][c]:
                        dfs(nr, nc, visited)

        for r in range(m):
            dfs(r, 0, pacific)
            dfs(r, n - 1, atlantic)
        for c in range(n):
            dfs(0, c, pacific)
            dfs(m - 1, c, atlantic)

        out = []
        for r in range(m):
            for c in range(n):
                if pacific[r][c] and atlantic[r][c]:
                    out.append([r, c])
        return out`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Surrounded Regions (LC #130) ──────────────────────────────────────────
  {
    slug: 'surrounded-regions',
    lcNumber: 130,
    title: 'Surrounded Regions',
    difficulty: 'Medium',
    pattern: 'DFS',
    tags: ['matrix', 'dfs'],
    descriptionMd: `Given an \`m x n\` matrix \`board\` of characters \`'X'\` and \`'O'\`, capture
every region of \`'O'\` that is **completely surrounded** by \`'X'\`. Capturing means
flipping those \`'O'\` cells to \`'X'\`. \`'O'\` regions that touch the **border** of the
matrix remain as \`'O'\`.

The canonical approach is the complement trick: DFS from every \`'O'\` on the border,
marking reachable \`'O'\`s as \`'#'\` (safe), then scan the whole grid and flip the
remaining \`'O'\`s to \`'X'\` and the \`'#'\`s back to \`'O'\`.`,
    examples: [
      {
        input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]',
        output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]',
        explanation: 'The interior O region is captured; the bottom-row O on the border stays.',
      },
      {
        input: 'board = [["O"]]',
        output: '[["O"]]',
      },
    ],
    constraints: [
      '`1 <= m, n <= 200`',
      '`board[i][j]` is either `"X"` or `"O"`.',
    ],
    starterCode: {
      python: `class Solution:
    def solve(self, board: list[list[str]]) -> list[list[str]]:
        # Flip every "O" region not connected to the border into "X"; return the board.
        pass
`,
    },
    methodName: 'solve',
    argKeys: ['board'],
    defaultTests: [
      {
        label: 'Capture interior',
        inputJson: '{"board":[["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]}',
        expectedJson: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]',
      },
      { label: 'Single cell', inputJson: '{"board":[["O"]]}', expectedJson: '[["O"]]' },
      {
        label: 'All border',
        inputJson: '{"board":[["X","O"],["O","X"]]}',
        expectedJson: '[["X","O"],["O","X"]]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Border DFS (Complement Trick)',
        intuition: 'DFS from every border "O" cell, marking reachable O cells as "#" (safe). Then scan the whole grid: remaining "O" cells are surrounded so flip to "X", and "#" cells revert to "O".',
        code: `class Solution:
    def solve(self, board: list[list[str]]) -> list[list[str]]:
        m = len(board)
        n = len(board[0]) if m else 0

        def mark_safe(r: int, c: int):
            stack = [(r, c)]
            while stack:
                cr, cc = stack.pop()
                if cr < 0 or cr >= m or cc < 0 or cc >= n or board[cr][cc] != 'O':
                    continue
                board[cr][cc] = '#'
                stack.append((cr + 1, cc))
                stack.append((cr - 1, cc))
                stack.append((cr, cc + 1))
                stack.append((cr, cc - 1))

        for r in range(m):
            mark_safe(r, 0)
            mark_safe(r, n - 1)
        for c in range(n):
            mark_safe(0, c)
            mark_safe(m - 1, c)

        for r in range(m):
            for c in range(n):
                if board[r][c] == 'O':
                    board[r][c] = 'X'
                elif board[r][c] == '#':
                    board[r][c] = 'O'
        return board`,
        timeComplexity: 'O(m * n)',
        spaceComplexity: 'O(m * n)',
      },
    ],
  },

  // ─── Keys and Rooms (LC #841) ──────────────────────────────────────────────
  {
    slug: 'keys-and-rooms',
    lcNumber: 841,
    title: 'Keys and Rooms',
    difficulty: 'Medium',
    pattern: 'DFS / BFS',
    tags: ['graph', 'dfs', 'bfs'],
    descriptionMd: `You start in room \`0\` of a building with \`n\` rooms. Each room \`i\` has a list
\`rooms[i]\` of keys to other rooms. Return \`True\` if you can reach **every** room by
walking from room to room along the keys you pick up; otherwise \`False\`.

This is a textbook DFS/BFS over an implicit graph — treat rooms as nodes and keys as
directed edges.`,
    examples: [
      {
        input: 'rooms = [[1], [2], [3], []]',
        output: 'True',
      },
      {
        input: 'rooms = [[1, 3], [3, 0, 1], [2], [0]]',
        output: 'False',
        explanation: 'Room 2 is isolated — you never pick up a key to it.',
      },
    ],
    constraints: [
      '`1 <= len(rooms) <= 1000`',
      '`0 <= len(rooms[i]) <= 1000`',
      '`0 <= rooms[i][j] < len(rooms)`',
    ],
    starterCode: {
      python: `class Solution:
    def canVisitAllRooms(self, rooms: list[list[int]]) -> bool:
        # Return True if every room is reachable from room 0.
        pass
`,
    },
    methodName: 'canVisitAllRooms',
    argKeys: ['rooms'],
    defaultTests: [
      { label: 'Chain',      inputJson: '{"rooms":[[1],[2],[3],[]]}',            expectedJson: 'true'  },
      { label: 'Orphan',     inputJson: '{"rooms":[[1,3],[3,0,1],[2],[0]]}',     expectedJson: 'false' },
      { label: 'Single room',inputJson: '{"rooms":[[]]}',                         expectedJson: 'true'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Number of Provinces (LC #547) ─────────────────────────────────────────
  {
    slug: 'number-of-provinces',
    lcNumber: 547,
    title: 'Number of Provinces',
    difficulty: 'Medium',
    pattern: 'Union-Find',
    tags: ['graph', 'union-find', 'dfs'],
    descriptionMd: `You are given an \`n x n\` matrix \`isConnected\` where \`isConnected[i][j] == 1\`
means city \`i\` is directly connected to city \`j\` (and the matrix is symmetric with
\`1\`s on the diagonal). A **province** is a maximal set of cities that are all
(transitively) connected. Return the number of provinces.

Either a DFS that marks each city's province, or a union-find that unions every connected
pair, gives the count.`,
    examples: [
      {
        input: 'isConnected = [[1, 0, 1], [0, 1, 0], [1, 0, 1]]',
        output: '2',
        explanation: 'Cities 0 and 2 form one province; city 1 is its own province.',
      },
      {
        input: 'isConnected = [[1, 1], [1, 1]]',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= n <= 200`',
      '`isConnected[i][i] == 1`',
      '`isConnected[i][j] == isConnected[j][i]`',
    ],
    starterCode: {
      python: `class Solution:
    def findCircleNum(self, isConnected: list[list[int]]) -> int:
        # Return the number of connected components in the city graph.
        pass
`,
    },
    methodName: 'findCircleNum',
    argKeys: ['isConnected'],
    defaultTests: [
      { label: 'Two provinces', inputJson: '{"isConnected":[[1,0,1],[0,1,0],[1,0,1]]}', expectedJson: '2' },
      { label: 'One province',  inputJson: '{"isConnected":[[1,1],[1,1]]}',              expectedJson: '1' },
      { label: 'Singleton',     inputJson: '{"isConnected":[[1]]}',                      expectedJson: '1' },
    ],
    resultCompare: 'exact',
  },

  // ─── Shortest Path in Binary Matrix (LC #1091) ────────────────────────────
  {
    slug: 'shortest-path-in-binary-matrix',
    lcNumber: 1091,
    title: 'Shortest Path in Binary Matrix',
    difficulty: 'Medium',
    pattern: 'BFS',
    tags: ['matrix', 'bfs'],
    descriptionMd: `Given an \`n x n\` binary matrix \`grid\`, return the length of the shortest
**clear path** from the top-left cell \`(0, 0)\` to the bottom-right cell \`(n-1, n-1)\`.
A clear path only walks through cells with value \`0\`, and can step to any of the **eight**
neighbouring cells. If no such path exists, return \`-1\`. The path length is the number of
cells visited (including both endpoints).

BFS from \`(0, 0)\` over the 8-neighbour lattice is the straightforward solution.`,
    examples: [
      {
        input: 'grid = [[0, 1], [1, 0]]',
        output: '2',
      },
      {
        input: 'grid = [[1, 0], [0, 0]]',
        output: '-1',
        explanation: 'The starting cell itself is blocked.',
      },
    ],
    constraints: [
      '`1 <= n <= 100`',
      '`grid[i][j]` is `0` or `1`.',
    ],
    starterCode: {
      python: `class Solution:
    def shortestPathBinaryMatrix(self, grid: list[list[int]]) -> int:
        # Return the shortest 8-directional path length from (0,0) to (n-1,n-1), or -1.
        pass
`,
    },
    methodName: 'shortestPathBinaryMatrix',
    argKeys: ['grid'],
    defaultTests: [
      { label: 'Diagonal',     inputJson: '{"grid":[[0,1],[1,0]]}', expectedJson: '2'  },
      { label: 'Start blocked',inputJson: '{"grid":[[1,0],[0,0]]}', expectedJson: '-1' },
      { label: 'Single cell',  inputJson: '{"grid":[[0]]}',          expectedJson: '1'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Detonate the Maximum Bombs (LC #2101) ─────────────────────────────────
  {
    slug: 'detonate-the-maximum-bombs',
    lcNumber: 2101,
    title: 'Detonate the Maximum Bombs',
    difficulty: 'Medium',
    pattern: 'DFS / BFS',
    tags: ['graph', 'dfs', 'bfs'],
    descriptionMd: `You are given a list \`bombs\` where each \`bombs[i] = [xi, yi, ri]\` represents a
bomb at position \`(xi, yi)\` with blast radius \`ri\`. Detonating a bomb triggers every
bomb whose centre falls inside its blast radius (including on the boundary), which in turn
may trigger more bombs in a chain reaction. Return the **maximum number of bombs** that can
be detonated when you choose the best starting bomb.

Build a directed graph \`i -> j\` whenever bomb \`j\` is within bomb \`i\`'s radius, then
run a BFS/DFS from every node and return the largest reachable-set size.`,
    examples: [
      {
        input: 'bombs = [[1, 1, 5], [4, 1, 2]]',
        output: '2',
        explanation: 'Starting at bomb 0 triggers bomb 1 (distance 3 <= 5). Starting at bomb 1 covers only itself.',
      },
      {
        input: 'bombs = [[1, 1, 5], [10, 10, 5]]',
        output: '1',
      },
    ],
    constraints: [
      '`1 <= len(bombs) <= 100`',
      '`-10^5 <= xi, yi <= 10^5`',
      '`1 <= ri <= 10^5`',
    ],
    starterCode: {
      python: `class Solution:
    def maximumDetonation(self, bombs: list[list[int]]) -> int:
        # Return the largest chain of bombs triggered from one starting bomb.
        pass
`,
    },
    methodName: 'maximumDetonation',
    argKeys: ['bombs'],
    defaultTests: [
      { label: 'One triggers one', inputJson: '{"bombs":[[1,1,5],[4,1,2]]}',          expectedJson: '2' },
      { label: 'Isolated pair',    inputJson: '{"bombs":[[1,1,5],[10,10,5]]}',        expectedJson: '1' },
      { label: 'Chain of three',   inputJson: '{"bombs":[[0,0,3],[1,1,3],[2,2,3]]}',  expectedJson: '3' },
    ],
    resultCompare: 'exact',
  },
];
