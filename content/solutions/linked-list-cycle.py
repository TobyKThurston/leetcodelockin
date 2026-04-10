class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt


def _to_list(arr):
    head = None
    for v in reversed(arr):
        head = ListNode(v, head)
    return head


def _build_cyclic(values, pos):
    head = _to_list(values)
    if head is None or pos == -1:
        return head
    tail = head
    while tail.next is not None:
        tail = tail.next
    node = head
    for _ in range(pos):
        node = node.next
    tail.next = node
    return head


class Solution:
    def hasCycle(self, values: list[int], pos: int) -> bool:
        head = _build_cyclic(values, pos)
        slow = head
        fast = head
        while fast is not None and fast.next is not None:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False
