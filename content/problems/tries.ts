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
    descriptionMd: `Given a list of strings \`strs\`, return the longest string that is a prefix of
**every** entry in \`strs\`. If there is no common prefix (including the empty list case),
return the empty string \`""\`.

The simplest solution is a vertical scan: at each column index \`i\`, check whether every
string has the same character at position \`i\` and stop at the first disagreement or when
some string runs out.`,
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
  },

  // ─── Implement Trie (Prefix Tree) (LC #208) ────────────────────────────────
  {
    slug: 'implement-trie-prefix-tree',
    lcNumber: 208,
    title: 'Implement Trie (Prefix Tree)',
    difficulty: 'Medium',
    pattern: 'Design',
    tags: ['trie', 'design'],
    descriptionMd: `Design a **trie** (prefix tree) supporting three operations:

- \`insert(word)\` — insert \`word\` into the trie.
- \`search(word)\` — return \`True\` if the exact word is in the trie.
- \`startsWith(prefix)\` — return \`True\` if any inserted word begins with \`prefix\`.

Expose the class behaviour through a driver \`runTrieOps(ops, vals)\` that instantiates
your \`Trie\`, runs each operation, and returns a list of results (using \`None\` for
\`insert\`).`,
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
  },

  // ─── Design Add and Search Words Data Structure (LC #211) ─────────────────
  {
    slug: 'design-add-and-search-words-data-structure',
    lcNumber: 211,
    title: 'Design Add and Search Words Data Structure',
    difficulty: 'Medium',
    pattern: 'Design',
    tags: ['trie', 'design', 'dfs'],
    descriptionMd: `Design a \`WordDictionary\` that supports:

- \`addWord(word)\` — insert \`word\`.
- \`search(word)\` — return \`True\` if \`word\` matches any inserted word. The search word
  may contain the wildcard character \`'.'\` which matches any single letter.

A trie with DFS on the search is the idiomatic approach. Expose the class through a driver
\`runWordDictOps(ops, vals)\` that records each op's result (with \`None\` for \`addWord\`).`,
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
  },

  // ─── Replace Words (LC #648) ───────────────────────────────────────────────
  {
    slug: 'replace-words',
    lcNumber: 648,
    title: 'Replace Words',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'string'],
    descriptionMd: `You are given a list of short \`dictionary\` words (the "roots") and a
space-separated \`sentence\`. Replace every word in \`sentence\` that has a dictionary root
as a prefix with its **shortest** matching root. Words that have no matching root remain
unchanged. Return the modified sentence.

A trie built from \`dictionary\` lets you walk each input word letter by letter until you
either hit a root marker (return the prefix) or fall off the trie (return the original
word). Total time is \`O(total_input_letters)\`.`,
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
- \`sum(prefix)\` — return the sum of all values whose key has \`prefix\` as a prefix.

A trie with a \`sum\` field at each node (maintaining the total of values below it) makes
both operations \`O(len(key))\`. Expose the class behaviour via a driver
\`runMapSumOps(ops, vals)\`.`,
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
  },

  // ─── Longest Word in Dictionary (LC #720) ─────────────────────────────────
  {
    slug: 'longest-word-in-dictionary',
    lcNumber: 720,
    title: 'Longest Word in Dictionary',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'string'],
    descriptionMd: `Given an array of strings \`words\`, return the **longest** word that can be built
**one letter at a time** by other words already present in \`words\`. That is, every prefix
\`word[0..i]\` (for \`i\` from 1 up to \`len(word)\`) must also be in \`words\`.

If multiple candidates tie for longest, return the **lexicographically smallest** one. If no
word qualifies, return \`""\`.

A trie plus a DFS that only descends into children with an \`end-of-word\` marker finds the
answer in one sweep. Alternatively, sort \`words\` and track built words in a set.`,
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
  },

  // ─── Short Encoding of Words (LC #820) ─────────────────────────────────────
  {
    slug: 'short-encoding-of-words',
    lcNumber: 820,
    title: 'Short Encoding of Words',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'string'],
    descriptionMd: `A **valid encoding** of an array of strings \`words\` is any string \`S\` together
with an index array \`indices\` such that, for every \`i\`, reading \`S\` starting at
\`indices[i]\` up to the next \`'#'\` yields \`words[i]\`.

Return the **minimum possible length** of \`S\` across all valid encodings.

Key insight: a word \`w\` can share its encoding with any other word that has \`w\` as a
**suffix** — so you only need to encode the words that are not a suffix of some other word.
The neat trick is to insert every word **reversed** into a trie; any word that becomes an
interior node (non-leaf) in the reversed trie is redundant. The answer is the sum over all
leaves of \`(depth + 1)\` (the \`+1\` is the trailing \`'#'\`).`,
    examples: [
      {
        input: 'words = ["me", "time"]',
        output: '5',
        explanation: '"me" is a suffix of "time", so "time#" suffices — length 5.',
      },
      {
        input: 'words = ["at", "it"]',
        output: '6',
        explanation: 'No suffix sharing: "at#it#" has length 6.',
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
  },

  // ─── Search Suggestions System (LC #1268) ──────────────────────────────────
  {
    slug: 'search-suggestions-system',
    lcNumber: 1268,
    title: 'Search Suggestions System',
    difficulty: 'Medium',
    pattern: 'Trie',
    tags: ['trie', 'string', 'sorting'],
    descriptionMd: `You are given a list of \`products\` and a \`searchWord\`. After every character the
user types, your system should return up to **three lexicographically smallest** products
from \`products\` whose name starts with what has been typed so far.

Return a list of lists where the \`i\`-th inner list is the set of suggestions shown after
the user has typed the first \`i + 1\` characters of \`searchWord\`.

Either a sorted list + binary search over prefixes, or a trie that stores up to three
lexicographically smallest words at each prefix, works. The sorted approach is simpler to
implement.`,
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
  },

  // ─── Maximum XOR of Two Numbers in an Array (LC #421) ─────────────────────
  {
    slug: 'maximum-xor-of-two-numbers-in-an-array',
    lcNumber: 421,
    title: 'Maximum XOR of Two Numbers in an Array',
    difficulty: 'Medium',
    pattern: 'Bit Trie',
    tags: ['array', 'bit-manipulation', 'trie'],
    descriptionMd: `Given an integer array \`nums\`, return the maximum value of \`nums[i] XOR
nums[j]\` for any pair of indices \`i != j\`.

The elegant \`O(n)\` solution builds a **binary trie** of the numbers (one child per bit,
most-significant bit first). For each number, walk the trie greedily: at each level take the
opposite bit if it exists, otherwise take the same bit. The accumulated value is the largest
XOR pairing for that number.`,
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
  },

  // ─── Word Search II (LC #212) ──────────────────────────────────────────────
  {
    slug: 'word-search-ii',
    lcNumber: 212,
    title: 'Word Search II',
    difficulty: 'Hard',
    pattern: 'Trie + Backtracking',
    tags: ['trie', 'backtracking', 'matrix'],
    descriptionMd: `You are given an \`m x n\` grid of characters \`board\` and a list \`words\`. Return
all words from \`words\` that can be assembled by walking from cell to neighbouring cell
(up/down/left/right) without reusing any cell more than once per word.

The idiomatic solution builds a trie from \`words\` and runs a DFS from every cell, descending
into the trie one letter at a time. The trie cuts off dead branches early, turning what would
be a per-word board scan into a single global sweep.`,
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
  },
];
