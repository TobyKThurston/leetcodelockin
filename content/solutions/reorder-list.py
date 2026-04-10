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
    def reorderList(self, values: list[int]) -> list[int]:
        head = _to_list(values)
        if head is None or head.next is None:
            return _from_list(head)
        # Step 1: find middle.
        slow = head
        fast = head
        while fast.next is not None and fast.next.next is not None:
            slow = slow.next
            fast = fast.next.next
        # Step 2: reverse second half.
        prev = None
        cur = slow.next
        slow.next = None
        while cur is not None:
            nxt = cur.next
            cur.next = prev
            prev = cur
            cur = nxt
        # Step 3: weave.
        first = head
        second = prev
        while second is not None:
            t1 = first.next
            t2 = second.next
            first.next = second
            second.next = t1
            first = t1
            second = t2
        return _from_list(head)
