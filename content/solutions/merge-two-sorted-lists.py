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
    def mergeTwoLists(self, list1: list[int], list2: list[int]) -> list[int]:
        a = _to_list(list1)
        b = _to_list(list2)
        dummy = ListNode()
        tail = dummy
        while a is not None and b is not None:
            if a.val <= b.val:
                tail.next = a
                a = a.next
            else:
                tail.next = b
                b = b.next
            tail = tail.next
        tail.next = a if a is not None else b
        return _from_list(dummy.next)
