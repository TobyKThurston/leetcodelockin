class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        buckets = {}
        for s in strs:
            key = ''.join(sorted(s))
            buckets.setdefault(key, []).append(s)
        out = []
        for group in buckets.values():
            group.sort()
            out.append(group)
        out.sort()
        return out
