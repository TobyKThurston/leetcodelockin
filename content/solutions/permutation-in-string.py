class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        if len(s1) > len(s2):
            return False
        need = [0] * 26
        have = [0] * 26
        for ch in s1:
            need[ord(ch) - 97] += 1
        for i in range(len(s1)):
            have[ord(s2[i]) - 97] += 1
        if have == need:
            return True
        for i in range(len(s1), len(s2)):
            have[ord(s2[i]) - 97] += 1
            have[ord(s2[i - len(s1)]) - 97] -= 1
            if have == need:
                return True
        return False
