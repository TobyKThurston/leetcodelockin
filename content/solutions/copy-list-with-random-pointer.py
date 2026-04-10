class Node:
    def __init__(self, val: int, nxt=None, random=None):
        self.val = val
        self.next = nxt
        self.random = random


def _to_rand_list(nodes):
    if not nodes:
        return None
    built = [Node(v) for v, _ in nodes]
    for i, (_, r) in enumerate(nodes):
        if i + 1 < len(built):
            built[i].next = built[i + 1]
        built[i].random = built[r] if r is not None else None
    return built[0]


def _from_rand_list(head):
    if head is None:
        return []
    order = []
    cur = head
    while cur is not None:
        order.append(cur)
        cur = cur.next
    index_of = {id(n): i for i, n in enumerate(order)}
    out = []
    for n in order:
        r = None if n.random is None else index_of[id(n.random)]
        out.append([n.val, r])
    return out


class Solution:
    def copyRandomList(self, nodes: list) -> list:
        head = _to_rand_list(nodes)
        if head is None:
            return []
        mapping = {}
        cur = head
        while cur is not None:
            mapping[id(cur)] = Node(cur.val)
            cur = cur.next
        cur = head
        while cur is not None:
            new_node = mapping[id(cur)]
            new_node.next = mapping[id(cur.next)] if cur.next is not None else None
            new_node.random = mapping[id(cur.random)] if cur.random is not None else None
            cur = cur.next
        return _from_rand_list(mapping[id(head)])
