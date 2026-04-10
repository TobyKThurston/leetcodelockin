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
    def reverseKGroup(self, values: list[int], k: int) -> list[int]:
        head = _to_list(values)
        dummy = ListNode(0, head)
        group_prev = dummy
        while True:
            # Check k nodes ahead.
            kth = group_prev
            for _ in range(k):
                kth = kth.next
                if kth is None:
                    return _from_list(dummy.next)
            group_next = kth.next
            # Reverse group.
            prev = group_next
            cur = group_prev.next
            while cur is not group_next:
                nxt = cur.next
                cur.next = prev
                prev = cur
                cur = nxt
            new_group_prev = group_prev.next
            group_prev.next = kth
            group_prev = new_group_prev
