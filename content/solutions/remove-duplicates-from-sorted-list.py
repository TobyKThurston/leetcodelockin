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
    def deleteDuplicates(self, values: list[int]) -> list[int]:
        head = _to_list(values)
        cur = head
        while cur is not None and cur.next is not None:
            if cur.next.val == cur.val:
                cur.next = cur.next.next
            else:
                cur = cur.next
        return _from_list(head)
