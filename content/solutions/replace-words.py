class Solution:
    def replaceWords(self, dictionary: list[str], sentence: str) -> str:
        root = {}
        for w in dictionary:
            node = root
            for ch in w:
                if ch not in node:
                    node[ch] = {}
                node = node[ch]
            node['$'] = True

        def shortest(word):
            node = root
            prefix = []
            for ch in word:
                if ch not in node:
                    return word
                node = node[ch]
                prefix.append(ch)
                if node.get('$', False):
                    return ''.join(prefix)
            return word

        return ' '.join(shortest(w) for w in sentence.split())
