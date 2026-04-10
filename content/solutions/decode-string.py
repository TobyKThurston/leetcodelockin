class Solution:
    def decodeString(self, s: str) -> str:
        count_stack = []
        string_stack = []
        cur_string = ''
        cur_count = 0
        for ch in s:
            if ch.isdigit():
                cur_count = cur_count * 10 + int(ch)
            elif ch == '[':
                count_stack.append(cur_count)
                string_stack.append(cur_string)
                cur_count = 0
                cur_string = ''
            elif ch == ']':
                k = count_stack.pop()
                prev = string_stack.pop()
                cur_string = prev + cur_string * k
            else:
                cur_string += ch
        return cur_string
