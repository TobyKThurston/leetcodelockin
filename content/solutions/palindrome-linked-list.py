class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val = val
        self.next = nxt


def _to_list(arr):
    head = None
    for v in reversed(arr):
        head = ListNode(v, head)
    return head


class Solution:
    def isPalindrome(self, values: list[int]) -> bool:
        head = _to_list(values)
        # Collect values walking the list — simpler than in-place reverse.
        vals = []
        cur = head
        while cur is not None:
            vals.append(cur.val)
            cur = cur.next
        return vals == vals[::-1]
