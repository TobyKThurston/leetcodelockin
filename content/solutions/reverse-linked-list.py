class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt


def _to_list(arr):
    head = None
    for v in reversed(arr):
        head = ListNode(v, head)
    return head


def _from_list(head):
    out = []
    while head is not None:
        out.append(head.val)
        head = head.next
    return out


class Solution:
    def reverseList(self, values: list[int]) -> list[int]:
        head = _to_list(values)
        prev = None
        cur = head
        while cur is not None:
            nxt = cur.next
            cur.next = prev
            prev = cur
            cur = nxt
        return _from_list(prev)
