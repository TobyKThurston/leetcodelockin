class Solution:
    def subarraySum(self, nums: list[int], k: int) -> int:
        seen = {0: 1}
        cur = 0
        count = 0
        for v in nums:
            cur += v
            count += seen.get(cur - k, 0)
            seen[cur] = seen.get(cur, 0) + 1
        return count
