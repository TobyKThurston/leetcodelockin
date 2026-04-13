class Solution:
    def summaryRanges(self, nums: list[int]) -> list[str]:
        if not nums:
            return []
        ranges: list[str] = []
        start = nums[0]
        prev = nums[0]
        for v in nums[1:]:
            if v == prev + 1:
                prev = v
                continue
            ranges.append(str(start) if start == prev else f"{start}->{prev}")
            start = v
            prev = v
        ranges.append(str(start) if start == prev else f"{start}->{prev}")
        return ranges
