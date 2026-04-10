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
    def addTwoNumbers(self, l1: list[int], l2: list[int]) -> list[int]:
        a = _to_list(l1)
        b = _to_list(l2)
        dummy = ListNode()
        tail = dummy
        carry = 0
        while a is not None or b is not None or carry:
            x = a.val if a is not None else 0
            y = b.val if b is not None else 0
            total = x + y + carry
            carry = total // 10
            tail.next = ListNode(total % 10)
            tail = tail.next
            if a is not None:
                a = a.next
            if b is not None:
                b = b.next
        return _from_list(dummy.next)
