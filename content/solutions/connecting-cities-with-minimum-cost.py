class Solution:
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
