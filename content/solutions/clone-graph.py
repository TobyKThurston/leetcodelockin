class Node:
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
    stack = [head]
    while stack:
        node = stack.pop()
        if node.val in seen:
            continue
        seen[node.val] = node
        for nb in node.neighbors:
            if nb.val not in seen:
                stack.append(nb)
    ordered = sorted(seen.values(), key=lambda n: n.val)
    out = []
    for n in ordered:
        out.append(sorted([nb.val for nb in n.neighbors]))
    return out


class Solution:
    def cloneGraph(self, adjList: list[list[int]]) -> list[list[int]]:
        head = _to_graph(adjList)
        if head is None:
            return []
        mapping = {}

        def dfs(node: Node) -> Node:
            if node.val in mapping:
                return mapping[node.val]
            cloned = Node(node.val)
            mapping[node.val] = cloned
            for nb in node.neighbors:
                cloned.neighbors.append(dfs(nb))
            return cloned

        new_head = dfs(head)
        return _from_graph(new_head)
