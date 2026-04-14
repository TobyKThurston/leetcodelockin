// ─── Tries problems ──────────────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const TRIES_PROBLEMS: ProblemContent[] = [
  // ─── Longest Common Prefix (LC #14) ────────────────────────────────────────
  {
    slug: 'longest-common-prefix',
    lcNumber: 14,
    title: 'Longest Common Prefix',
    difficulty: 'Easy',
    pattern: 'String',
    tags: ['string'],
    descriptionMd: `Write a function to find the longest common prefix string amongst an array
of strings \`strs\`.

If there is no common prefix (including the empty list case), return the empty string
\`""\`.`,
    examples: [
      {
        input: 'strs = ["apple", "application", "app"]',
        output: '"app"',
      },
      {
        input: 'strs = ["dog", "racecar", "car"]',
        output: '""',
      },
    ],
    constraints: [
      '`0 <= len(strs) <= 200`',
      '`0 <= len(strs[i]) <= 200`',
      '`strs[i]` consists of lowercase English letters only.',
    ],
    starterCode: {
      python: `class Solution:
    def longestCommonPrefix(self, strs: list[str]) -> str:
        # Return the longest common prefix of every string, or "".
        pass
`,
    },
    methodName: 'longestCommonPrefix',
    argKeys: ['strs'],
    defaultTests: [
      { label: 'Has prefix',   inputJson: '{"strs":["apple","application","app"]}', expectedJson: '"app"'    },
      { label: 'No prefix',    inputJson: '{"strs":["dog","racecar","car"]}',        expectedJson: '""'       },
      { label: 'Single word',  inputJson: '{"strs":["single"]}',                      expectedJson: '"single"' },
      { label: 'Empty list',   inputJson: '{"strs":[]}',                              expectedJson: '""'       },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Vertical Scan',
        intuition: 'Compare characters column by column across all strings. At each index i, check if every string has the same character. Stop at the first mismatch or when the shortest string runs out.',
        code: `class Solution:
    def longestCommonPrefix(self, strs: list[str]) -> str:
        if not strs:
            return ""
        shortest = min(strs, key=len)
        for i, ch in enumerate(shortest):
            for s in strs:
                if s[i] != ch:
                    return shortest[:i]
        return shortest
`,
        timeComplexity: 'O(S) where S is the sum of all string lengths',
        spaceComplexity: 'O(1)',
      },
      {
        approach: 'Sorting',
        intuition: 'Sort the array lexicographically. The common prefix of the entire array must be the common prefix of just the first and last strings after sorting, since they are the most different pair.',
        code: `class Solution:
    def longestCommonPrefix(self, strs: list[str]) -> str:
        if not strs:
            return ""
        strs.sort()
        first, last = strs[0], strs[-1]
        i = 0
        while i < len(first) and i < len(last) and first[i] == last[i]:
            i += 1
        return first[:i]
`,
        timeComplexity: 'O(S log n) where S is total characters and n is number of strings',
        spaceComplexity: 'O(1)',
      },
    ],
  },

  // ─── Implement Trie (Prefix Tree) (LC #208) ────────────────────────────────
  {
    slug: 'implement-trie-prefix-tree',
    lcNumber: 208,
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    pattern: 'Design',
    tags: ['trie', 'design'],
    descriptionMd: `A **trie** (pronounced as "try") or prefix tree is a tree data structure used
to efficiently store and retrieve keys in a dataset of strings. Implement the \`Trie\` class
supporting three operations:

- \`insert(word)\` — insert \`word\` into the trie.
- \`search(word)\` — return \`True\` if \`word\` is in the trie (i.e. was previously inserted
  as an exact word), and \`False\` otherwise.
- \`startsWith(prefix)\` — return \`True\` if there is a previously inserted word that has
  \`prefix\` as a prefix, and \`False\` otherwise.

Expose the class behaviour through a driver \`runTrieOps(ops, vals)\` that instantiates
your \`Trie\`, runs each operation in order, and returns a list of results (using \`None\`
for \`insert\`).`,
    examples: [
      {
        input: 'ops = ["insert","search","search","startsWith","insert","search"], vals = [["apple"],["apple"],["app"],["app"],["app"],["app"]]',
        output: '[None, True, False, True, None, True]',
      },
    ],
    constraints: [
      '`1 <= len(ops) <= 3 * 10^4`',
      'Each op is one of `"insert"`, `"search"`, `"startsWith"`.',
      'Words and prefixes consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Trie:
    def __init__(self):
        pass

    def insert(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass

    def startsWith(self, prefix: str) -> bool:
        pass


class Solution:
    def runTrieOps(self, ops: list[str], vals: list[list[str]]) -> list:
        tr = Trie()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(tr, op)(*args)
            out.append(result)
        return out
`,
    },
    methodName: 'runTrieOps',
    argKeys: ['ops', 'vals'],
    defaultTests: [
      {
        label: 'Classic run',
        inputJson: '{"ops":["insert","search","search","startsWith","insert","search"],"vals":[["apple"],["apple"],["app"],["app"],["app"],["app"]]}',
        expectedJson: '[null,true,false,true,null,true]',
      },
      {
        label: 'Only startsWith',
        inputJson: '{"ops":["insert","startsWith"],"vals":[["hello"],["he"]]}',
        expectedJson: '[null,true]',
      },
      {
        label: 'Missing word',
        inputJson: '{"ops":["search"],"vals":[["ghost"]]}',
        expectedJson: '[false]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Hash Map Trie',
        intuition: 'Use nested dictionaries as trie nodes, with each key being a character and a special "$" key marking end-of-word. Insert walks down creating nodes; search walks down checking existence; startsWith is the same but does not require the end marker.',
        code: `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
        node['$'] = True

    def _walk(self, s: str):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.get('$', False)

    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None


class Solution:
    def runTrieOps(self, ops: list[str], vals: list[list[str]]) -> list:
        tr = Trie()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(tr, op)(*args)
            out.append(result)
        return out
`,
        timeComplexity: 'O(m) per operation where m is the word/prefix length',
        spaceComplexity: 'O(total characters inserted)',
      },
    ],
  },

  // ─── Design Add and Search Words Data Structure (LC #211) ─────────────────
  {
    slug: 'design-add-and-search-words-data-structure',
    lcNumber: 211,
    title: 'Design Add and Search Words Data Structure',
    difficulty: 'Medium',
    pattern: 'Design',
    tags: ['trie', 'design', 'dfs'],
    descriptionMd: `Design a data structure \`WordDictionary\` that supports adding new words
and finding whether a string matches any previously added word:

- \`addWord(word)\` — add \`word\` to the data structure.
- \`search(word)\` — return \`True\` if any added word matches \`word\`. A search word may
  contain the wildcard character \`'.'\`, which matches any single letter.

Expose the class through a driver \`runWordDictOps(ops, vals)\` that records each op's
result (with \`None\` for \`addWord\`).`,
    examples: [
      {
        input: 'ops = ["addWord","addWord","addWord","search","search","search","search"], vals = [["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]',
        output: '[None, None, None, False, True, True, True]',
      },
    ],
    constraints: [
      '`1 <= len(ops) <= 10^4`',
      'Each op is one of `"addWord"`, `"search"`.',
      'Words consist of lowercase English letters; search words may additionally contain `.`.',
    ],
    starterCode: {
      python: `class WordDictionary:
    def __init__(self):
        pass

    def addWord(self, word: str) -> None:
        pass

    def search(self, word: str) -> bool:
        pass


class Solution:
    def runWordDictOps(self, ops: list[str], vals: list[list[str]]) -> list:
        wd = WordDictionary()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(wd, op)(*args)
            out.append(result)
        return out
`,
    },
    methodName: 'runWordDictOps',
    argKeys: ['ops', 'vals'],
    defaultTests: [
      {
        label: 'Wildcards',
        inputJson: '{"ops":["addWord","addWord","addWord","search","search","search","search"],"vals":[["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]}',
        expectedJson: '[null,null,null,false,true,true,true]',
      },
      {
        label: 'Single add',
        inputJson: '{"ops":["addWord","search"],"vals":[["at"],["a."]]}',
        expectedJson: '[null,true]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Trie with DFS for Wildcards',
        intuition: 'Build a trie from inserted words. For search, walk the trie character by character. When a "." wildcard is encountered, branch into all children using DFS. Return True if any branch leads to a complete word at the end.',
        code: `class WordDictionary:
    def __init__(self):
        self.root = {}

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node:
                node[ch] = {}
            node = node[ch]
        node['$'] = True

    def search(self, word: str) -> bool:
        def dfs(node, i):
            if i == len(word):
                return node.get('$', False)
            ch = word[i]
            if ch == '.':
                for k, child in node.items():
                    if k == '$':
                        continue
                    if dfs(child, i + 1):
                        return True
                return False
            return ch in node and dfs(node[ch], i + 1)
        return dfs(self.root, 0)


class Solution:
    def runWordDictOps(self, ops: list[str], vals: list[list[str]]) -> list:
        wd = WordDictionary()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(wd, op)(*args)
            out.append(result)
        return out
`,
        timeComplexity: 'O(m) for addWord, O(26^m) worst case for search with all dots',
        spaceComplexity: 'O(total characters inserted)',
      },
    ],
  },

  // ─── Replace Words (LC #648) ───────────────────────────────────────────────
  {
    slug: 'replace-words',
    lcNumber: 648,
    title: 'Replace Words',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'string'],
    descriptionMd: `In English, we have a concept called a **root**, which can be followed by
some other word to form another longer word — for example, the root \`"help"\` followed by
the word \`"ful"\` gives \`"helpful"\`.

You are given a \`dictionary\` of roots and a space-separated \`sentence\`. Replace every
word in \`sentence\` that has any root in \`dictionary\` as a prefix with that root. If a
word has more than one matching root, replace it with the **shortest** matching root. Words
with no matching root remain unchanged. Return the modified sentence.`,
    examples: [
      {
        input: 'dictionary = ["go", "walk"], sentence = "going for a walk"',
        output: '"go for a walk"',
      },
      {
        input: 'dictionary = [], sentence = "hello world"',
        output: '"hello world"',
      },
    ],
    constraints: [
      '`0 <= len(dictionary) <= 1000`',
      '`1 <= len(sentence) <= 10^6`',
      'Words consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def replaceWords(self, dictionary: list[str], sentence: str) -> str:
        # Replace each sentence word that has a dict root prefix with its shortest root.
        pass
`,
    },
    methodName: 'replaceWords',
    argKeys: ['dictionary', 'sentence'],
    defaultTests: [
      { label: 'Has roots', inputJson: '{"dictionary":["go","walk"],"sentence":"going for a walk"}', expectedJson: '"go for a walk"' },
      { label: 'No dict',   inputJson: '{"dictionary":[],"sentence":"hello world"}',                expectedJson: '"hello world"'  },
      { label: 'All match', inputJson: '{"dictionary":["a","b"],"sentence":"aaa bbb"}',              expectedJson: '"a b"'          },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Trie-based Lookup',
        intuition: 'Build a trie from dictionary roots. For each word in the sentence, walk the trie letter by letter. If you hit a node marked as end-of-word, return that prefix as the replacement. If you fall off the trie, keep the original word.',
        code: `class Solution:
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
`,
        timeComplexity: 'O(n) where n is the total characters in dictionary + sentence',
        spaceComplexity: 'O(d) where d is total characters in dictionary',
      },
      {
        approach: 'Set-based Prefix Check',
        intuition: 'Put all dictionary words in a set. For each word in the sentence, check every prefix from shortest to longest. Return the first prefix found in the set, or the original word if none matches.',
        code: `class Solution:
    def replaceWords(self, dictionary: list[str], sentence: str) -> str:
        roots = set(dictionary)

        def shortest(word):
            for i in range(1, len(word) + 1):
                if word[:i] in roots:
                    return word[:i]
            return word

        return ' '.join(shortest(w) for w in sentence.split())
`,
        timeComplexity: 'O(n * k) where k is max root length',
        spaceComplexity: 'O(d)',
      },
    ],
  },

  // ─── Map Sum Pairs (LC #677) ───────────────────────────────────────────────
  {
    slug: 'map-sum-pairs',
    lcNumber: 677,
    title: 'Map Sum Pairs',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'design'],
    descriptionMd: `Design a \`MapSum\` data structure supporting two operations:

- \`insert(key, val)\` — associate the integer \`val\` with the string \`key\`. If the key
  already exists, its value is **overwritten**.
- \`sum(prefix)\` — return the sum of all values whose key starts with \`prefix\`.

Expose the class behaviour via a driver \`runMapSumOps(ops, vals)\`.`,
    examples: [
      {
        input: 'ops = ["insert","sum","insert","sum"], vals = [["apple",3],["ap"],["app",2],["ap"]]',
        output: '[None, 3, None, 5]',
      },
    ],
    constraints: [
      '`1 <= len(ops) <= 50`',
      'Keys consist of lowercase English letters.',
      '`1 <= val <= 1000`',
    ],
    starterCode: {
      python: `class MapSum:
    def __init__(self):
        pass

    def insert(self, key: str, val: int) -> None:
        pass

    def sum(self, prefix: str) -> int:
        pass


class Solution:
    def runMapSumOps(self, ops: list[str], vals: list) -> list:
        ms = MapSum()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(ms, op)(*args)
            out.append(result)
        return out
`,
    },
    methodName: 'runMapSumOps',
    argKeys: ['ops', 'vals'],
    defaultTests: [
      {
        label: 'Classic run',
        inputJson: '{"ops":["insert","sum","insert","sum"],"vals":[["apple",3],["ap"],["app",2],["ap"]]}',
        expectedJson: '[null,3,null,5]',
      },
      {
        label: 'Overwrite',
        inputJson: '{"ops":["insert","insert","sum"],"vals":[["a",1],["a",5],["a"]]}',
        expectedJson: '[null,null,5]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Hash Map Store',
        intuition: 'Store key-value pairs in a dictionary. For sum, iterate over all stored keys and sum up values whose key starts with the given prefix. Overwriting is handled naturally by dict assignment.',
        code: `class MapSum:
    def __init__(self):
        self.store = {}

    def insert(self, key: str, val: int) -> None:
        self.store[key] = val

    def sum(self, prefix: str) -> int:
        total = 0
        for k, v in self.store.items():
            if k.startswith(prefix):
                total += v
        return total


class Solution:
    def runMapSumOps(self, ops: list[str], vals: list) -> list:
        ms = MapSum()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(ms, op)(*args)
            out.append(result)
        return out
`,
        timeComplexity: 'O(1) insert, O(n * m) sum where n is number of keys',
        spaceComplexity: 'O(n * m) for stored keys',
      },
    ],
  },

  // ─── Longest Word in Dictionary (LC #720) ─────────────────────────────────
  {
    slug: 'longest-word-in-dictionary',
    lcNumber: 720,
    title: 'Longest Word in Dictionary',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'string'],
    descriptionMd: `Given an array of strings \`words\`, return the **longest** word in \`words\`
that can be built **one character at a time** by other words in \`words\`. That is, every
prefix \`word[0..i]\` (for \`i\` from 1 up to \`len(word)\`) must also be in \`words\`.

If more than one word meets this condition, return the **lexicographically smallest** one.
If no word qualifies, return \`""\`.`,
    examples: [
      {
        input: 'words = ["a", "ab", "abc", "ac"]',
        output: '"abc"',
      },
      {
        input: 'words = ["apple", "apply", "appl", "app", "ap", "a"]',
        output: '"apple"',
        explanation: '"apple" and "apply" both qualify; "apple" is lexicographically smaller.',
      },
    ],
    constraints: [
      '`0 <= len(words) <= 1000`',
      '`1 <= len(words[i]) <= 30`',
      '`words[i]` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def longestWord(self, words: list[str]) -> str:
        # Return the longest buildable word, tie-broken lexicographically.
        pass
`,
    },
    methodName: 'longestWord',
    argKeys: ['words'],
    defaultTests: [
      { label: 'Simple',      inputJson: '{"words":["a","ab","abc","ac"]}',                    expectedJson: '"abc"'   },
      { label: 'Tie break',   inputJson: '{"words":["apple","apply","appl","app","ap","a"]}',  expectedJson: '"apple"' },
      { label: 'Nothing builds', inputJson: '{"words":["cat"]}',                               expectedJson: '""'      },
      { label: 'Empty',       inputJson: '{"words":[]}',                                       expectedJson: '""'      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sort and Set Check',
        intuition: 'A word qualifies if every prefix w[0..i] for i from 1 to len(w) is also in the word set. Put all words in a set, iterate, and track the longest qualifying word (tie-break lexicographically).',
        code: `class Solution:
    def longestWord(self, words: list[str]) -> str:
        word_set = set(words)
        best = ""
        for w in words:
            if all(w[:i] in word_set for i in range(1, len(w) + 1)):
                if len(w) > len(best) or (len(w) == len(best) and w < best):
                    best = w
        return best
`,
        timeComplexity: 'O(n * m^2) where m is max word length',
        spaceComplexity: 'O(n * m)',
      },
    ],
  },

  // ─── Short Encoding of Words (LC #820) ─────────────────────────────────────
  {
    slug: 'short-encoding-of-words',
    lcNumber: 820,
    title: 'Short Encoding of Words',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'string'],
    descriptionMd: `A **valid encoding** of an array of strings \`words\` is any string \`S\`
together with an index array \`indices\` such that, for every \`i\`, reading \`S\` starting
at \`indices[i]\` up to the next \`'#'\` character yields \`words[i]\`.

Given an array of \`words\`, return the **minimum possible length** of any valid encoding
of \`words\`.`,
    examples: [
      {
        input: 'words = ["me", "time"]',
        output: '5',
        explanation: 'The string "time#" is a valid encoding of length 5.',
      },
      {
        input: 'words = ["at", "it"]',
        output: '6',
        explanation: 'The string "at#it#" has length 6.',
      },
    ],
    constraints: [
      '`1 <= len(words) <= 2000`',
      '`1 <= len(words[i]) <= 7`',
      '`words[i]` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def minimumLengthEncoding(self, words: list[str]) -> int:
        # Return the minimum total length of any valid S encoding of words.
        pass
`,
    },
    methodName: 'minimumLengthEncoding',
    argKeys: ['words'],
    defaultTests: [
      { label: 'Suffix shared', inputJson: '{"words":["me","time"]}', expectedJson: '5' },
      { label: 'Disjoint',      inputJson: '{"words":["at","it"]}',   expectedJson: '6' },
      { label: 'Single word',   inputJson: '{"words":["a"]}',         expectedJson: '2' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Reversed Trie',
        intuition: 'Insert every word reversed into a trie. Words that are suffixes of other words become interior nodes. Only leaf nodes need their own encoding. The answer is the sum of (depth + 1) across all leaf nodes, where +1 accounts for the trailing "#".',
        code: `class Solution:
    def minimumLengthEncoding(self, words: list[str]) -> int:
        root = {}
        for w in set(words):
            node = root
            for ch in reversed(w):
                if ch not in node:
                    node[ch] = {}
                node = node[ch]

        total = 0

        def dfs(node, depth):
            nonlocal total
            if not node:
                total += depth + 1
                return
            for child in node.values():
                dfs(child, depth + 1)

        dfs(root, 0)
        return total
`,
        timeComplexity: 'O(n * m) where m is max word length',
        spaceComplexity: 'O(n * m)',
      },
      {
        approach: 'Suffix Set Elimination',
        intuition: 'A word is redundant if it is a suffix of another word. Start with all unique words in a set, then remove any word that is a suffix of another. The answer is the sum of (len(w) + 1) for remaining words.',
        code: `class Solution:
    def minimumLengthEncoding(self, words: list[str]) -> int:
        good = set(words)
        for w in words:
            for k in range(1, len(w)):
                good.discard(w[k:])
        return sum(len(w) + 1 for w in good)
`,
        timeComplexity: 'O(n * m^2)',
        spaceComplexity: 'O(n * m)',
      },
    ],
  },

  // ─── Search Suggestions System (LC #1268) ──────────────────────────────────
  {
    slug: 'search-suggestions-system',
    lcNumber: 1268,
    title: 'Search Suggestions System',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'string', 'sorting'],
    descriptionMd: `You are given an array of strings \`products\` and a string \`searchWord\`.

Design a system that suggests at most **three** product names from \`products\` after each
character of \`searchWord\` is typed. Suggested products should have common prefix with the
typed substring of \`searchWord\`. If there are more than three products with a common
prefix, return the **three lexicographically smallest** ones.

Return a list of lists where the \`i\`-th inner list is the suggestions shown after the user
has typed the first \`i + 1\` characters of \`searchWord\`.`,
    examples: [
      {
        input: 'products = ["apple","app","application"], searchWord = "app"',
        output: '[["app","apple","application"], ["app","apple","application"], ["app","apple","application"]]',
      },
      {
        input: 'products = ["xbox"], searchWord = "xb"',
        output: '[["xbox"], ["xbox"]]',
      },
    ],
    constraints: [
      '`1 <= len(products) <= 1000`',
      '`1 <= len(searchWord) <= 1000`',
      'Words consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def suggestedProducts(self, products: list[str], searchWord: str) -> list[list[str]]:
        # Return up to three suggestions per typed-prefix of searchWord.
        pass
`,
    },
    methodName: 'suggestedProducts',
    argKeys: ['products', 'searchWord'],
    defaultTests: [
      {
        label: 'Repeated top',
        inputJson: '{"products":["apple","app","application"],"searchWord":"app"}',
        expectedJson: '[["app","apple","application"],["app","apple","application"],["app","apple","application"]]',
      },
      {
        label: 'Single product',
        inputJson: '{"products":["xbox"],"searchWord":"xb"}',
        expectedJson: '[["xbox"],["xbox"]]',
      },
      {
        label: 'Empty products',
        inputJson: '{"products":[],"searchWord":"ab"}',
        expectedJson: '[[],[]]',
      },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Sort + Binary Search',
        intuition: 'Sort products. For each prefix of searchWord, use the sorted order to find matching products. Since the list is sorted, products starting with the prefix are contiguous. Filter and take up to 3.',
        code: `class Solution:
    def suggestedProducts(self, products: list[str], searchWord: str) -> list[list[str]]:
        products = sorted(products)
        out = []
        prefix = ""
        for ch in searchWord:
            prefix += ch
            matches = [p for p in products if p.startswith(prefix)]
            out.append(matches[:3])
        return out
`,
        timeComplexity: 'O(n log n + n * m * k) where k is searchWord length',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Trie with DFS Collection',
        intuition: 'Build a trie from products. For each prefix of searchWord, walk the trie to that prefix node, then DFS to collect up to 3 lexicographically smallest words reachable from that node.',
        code: `class Solution:
    def suggestedProducts(self, products: list[str], searchWord: str) -> list[list[str]]:
        root = {}
        for p in products:
            node = root
            for ch in p:
                if ch not in node:
                    node[ch] = {}
                node = node[ch]
            node['$'] = p

        def collect(node, results):
            if len(results) >= 3:
                return
            if '$' in node:
                results.append(node['$'])
            for ch in sorted(node):
                if ch == '$':
                    continue
                collect(node[ch], results)
                if len(results) >= 3:
                    return

        out = []
        cur = root
        fallen = False
        for ch in searchWord:
            if fallen or ch not in cur:
                fallen = True
                out.append([])
            else:
                cur = cur[ch]
                results = []
                collect(cur, results)
                out.append(results)
        return out
`,
        timeComplexity: 'O(n * m) for trie build + O(k * 3) for queries',
        spaceComplexity: 'O(n * m)',
      },
    ],
  },

  // ─── Maximum XOR of Two Numbers in an Array (LC #421) ─────────────────────
  {
    slug: 'maximum-xor-of-two-numbers-in-an-array',
    lcNumber: 421,
    title: 'Maximum XOR of Two Numbers in an Array',
    difficulty: 'Medium',
    pattern: 'Bit Trie',
    tags: ['array', 'bit-manipulation', 'trie'],
    descriptionMd: `Given an integer array \`nums\`, return the **maximum** result of
\`nums[i] XOR nums[j]\` over all pairs of indices \`0 <= i, j < len(nums)\` with
\`i != j\`.`,
    examples: [
      {
        input: 'nums = [1, 2, 3]',
        output: '3',
        explanation: '1 XOR 2 = 3 is the largest pairing.',
      },
      {
        input: 'nums = [4, 1]',
        output: '5',
      },
    ],
    constraints: [
      '`2 <= len(nums) <= 2 * 10^5`',
      '`0 <= nums[i] <= 2^31 - 1`',
    ],
    starterCode: {
      python: `class Solution:
    def findMaximumXOR(self, nums: list[int]) -> int:
        # Return the max of nums[i] XOR nums[j] across all i != j.
        pass
`,
    },
    methodName: 'findMaximumXOR',
    argKeys: ['nums'],
    defaultTests: [
      { label: 'Small set', inputJson: '{"nums":[1,2,3]}',  expectedJson: '3'  },
      { label: 'Two vals',  inputJson: '{"nums":[4,1]}',     expectedJson: '5'  },
      { label: 'Mixed',     inputJson: '{"nums":[8,10,2]}',  expectedJson: '10' },
    ],
    resultCompare: 'exact',
    solutions: [
      {
        approach: 'Bitwise Greedy with Prefix Set',
        intuition: 'Process bits from the most significant to least significant. At each bit position, try setting that bit in the result. Check if any pair of number prefixes can produce this candidate XOR by using a set: for each prefix p, check if (candidate XOR p) exists in the set.',
        code: `class Solution:
    def findMaximumXOR(self, nums: list[int]) -> int:
        best = 0
        mask = 0
        for bit in range(31, -1, -1):
            mask |= (1 << bit)
            prefixes = {n & mask for n in nums}
            candidate = best | (1 << bit)
            found = False
            for p in prefixes:
                if (candidate ^ p) in prefixes:
                    found = True
                    break
            if found:
                best = candidate
        return best
`,
        timeComplexity: 'O(32 * n) = O(n)',
        spaceComplexity: 'O(n)',
      },
      {
        approach: 'Binary Trie',
        intuition: 'Build a binary trie of all numbers (one node per bit, MSB first). For each number, greedily walk the trie choosing the opposite bit at each level to maximize XOR. The accumulated value is the best XOR for that number.',
        code: `class Solution:
    def findMaximumXOR(self, nums: list[int]) -> int:
        root = {}
        for n in nums:
            node = root
            for i in range(31, -1, -1):
                bit = (n >> i) & 1
                if bit not in node:
                    node[bit] = {}
                node = node[bit]

        best = 0
        for n in nums:
            node = root
            cur_xor = 0
            for i in range(31, -1, -1):
                bit = (n >> i) & 1
                toggled = 1 - bit
                if toggled in node:
                    cur_xor |= (1 << i)
                    node = node[toggled]
                else:
                    node = node[bit]
            best = max(best, cur_xor)
        return best
`,
        timeComplexity: 'O(32 * n) = O(n)',
        spaceComplexity: 'O(32 * n) = O(n)',
      },
    ],
  },

  // ─── Word Search II (LC #212) ──────────────────────────────────────────────
  {
    slug: 'word-search-ii',
    lcNumber: 212,
    title: 'Word Search II',
    difficulty: 'Hard',
    pattern: 'Trie + Backtracking',
    tags: ['trie', 'backtracking', 'matrix'],
    descriptionMd: `Given an \`m x n\` grid of characters \`board\` and a list of strings
\`words\`, return all words from \`words\` that exist on the board.

Each word must be constructed from letters of **sequentially adjacent** cells, where
adjacent cells are horizontally or vertically neighbouring. The **same letter cell may not
be used more than once** in a single word.`,
    examples: [
      {
        input: 'board = [["a","b"],["c","d"]], words = ["ab","cb","abd"]',
        output: '["ab","abd"]',
        explanation: '"ab" and "abd" exist on the board; "cb" does not (c at (1,0) has no b neighbour).',
      },
      {
        input: 'board = [["a"]], words = ["a"]',
        output: '["a"]',
      },
    ],
    constraints: [
      '`1 <= m, n <= 12`',
      '`1 <= len(words) <= 3 * 10^4`',
      '`1 <= len(words[i]) <= 10`',
      'All strings consist of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        # Return the list of words that can be assembled on the board.
        pass
`,
    },
    methodName: 'findWords',
    argKeys: ['board', 'words'],
    defaultTests: [
      {
        label: 'Two hits',
        inputJson: '{"board":[["a","b"],["c","d"]],"words":["ab","cb","abd"]}',
        expectedJson: '["ab","abd"]',
      },
      {
        label: 'Single cell',
        inputJson: '{"board":[["a"]],"words":["a"]}',
        expectedJson: '["a"]',
      },
      {
        label: 'No hit',
        inputJson: '{"board":[["a"]],"words":["b"]}',
        expectedJson: '[]',
      },
    ],
    // sorted_array: order of returned words is not specified.
    resultCompare: 'sorted_array',
    solutions: [
      {
        approach: 'Trie + Backtracking',
        intuition: 'Build a trie from all target words. DFS from every cell on the board, descending into the trie one letter at a time. When a trie node has an end-of-word marker, record that word. The trie prunes dead branches early, avoiding redundant per-word board scans.',
        code: `class Solution:
    def findWords(self, board: list[list[str]], words: list[str]) -> list[str]:
        root = {}
        for w in words:
            node = root
            for ch in w:
                if ch not in node:
                    node[ch] = {}
                node = node[ch]
            node['$'] = w

        m = len(board)
        n = len(board[0]) if m else 0
        found = set()

        def dfs(r, c, node):
            ch = board[r][c]
            if ch not in node:
                return
            nxt = node[ch]
            if '$' in nxt:
                found.add(nxt['$'])
            board[r][c] = '#'
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and board[nr][nc] != '#':
                    dfs(nr, nc, nxt)
            board[r][c] = ch

        for r in range(m):
            for c in range(n):
                dfs(r, c, root)

        return list(found)
`,
        timeComplexity: 'O(m * n * 4^L) where L is max word length',
        spaceComplexity: 'O(total characters in words)',
      },
    ],
  },
];
