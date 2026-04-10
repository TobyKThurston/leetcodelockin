// ─── Stack problems ──────────────────────────────────────────────────────────

import type { ProblemContent } from '../../lib/problem-types';

export const STACK_PROBLEMS: ProblemContent[] = [
  // ─── Valid Parentheses (LC #20) ─────────────────────────────────────────────
  {
    slug: 'valid-parentheses',
    lcNumber: 20,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    pattern: 'Stack',
    tags: ['string', 'stack'],
    descriptionMd: `Given a string \`s\` containing only the bracket characters \`(\`, \`)\`, \`[\`, \`]\`,
\`{\`, and \`}\`, return \`True\` if every opening bracket is closed by a matching bracket of
the same type **and brackets are properly nested**. Otherwise return \`False\`.

The standard approach uses a stack: push opening brackets as you see them and pop on every
closing bracket, checking that the popped opener matches.`,
    examples: [
      {
        input: 's = "([{}])"',
        output: 'True',
      },
      {
        input: 's = "(]"',
        output: 'False',
      },
      {
        input: 's = "((("',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 10^4`',
      '`s` contains only the characters `()[]{}`.',
    ],
    starterCode: {
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Return True if all brackets are properly matched and nested.
        pass
`,
    },
    methodName: 'isValid',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Nested OK',    inputJson: '{"s":"([{}])"}', expectedJson: 'true'  },
      { label: 'Bad pair',     inputJson: '{"s":"(]"}',     expectedJson: 'false' },
      { label: 'Open only',    inputJson: '{"s":"((("}',    expectedJson: 'false' },
      { label: 'Empty stack',  inputJson: '{"s":")"}',      expectedJson: 'false' },
    ],
    resultCompare: 'exact',
  },

  // ─── Remove All Adjacent Duplicates In String (LC #1047) ───────────────────
  {
    slug: 'remove-all-adjacent-duplicates-in-string',
    lcNumber: 1047,
    title: 'Remove All Adjacent Duplicates In String',
    difficulty: 'Easy',
    pattern: 'Stack',
    tags: ['string', 'stack'],
    descriptionMd: `Given a lowercase string \`s\`, repeatedly remove any two **adjacent identical
characters** until no more removals are possible, then return the resulting string.

A stack makes this trivial: for each character, if it matches the top of the stack pop the
top; otherwise push it. At the end the stack is the answer, in order.`,
    examples: [
      {
        input: 's = "azxxzy"',
        output: '"ay"',
        explanation: '"azxxzy" → "azzy" → "ay".',
      },
      {
        input: 's = "aabb"',
        output: '""',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 10^5`',
      '`s` consists of lowercase English letters.',
    ],
    starterCode: {
      python: `class Solution:
    def removeDuplicates(self, s: str) -> str:
        # Repeatedly remove adjacent equal characters until none remain.
        pass
`,
    },
    methodName: 'removeDuplicates',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Two rounds', inputJson: '{"s":"azxxzy"}', expectedJson: '"ay"' },
      { label: 'All gone',   inputJson: '{"s":"aabb"}',   expectedJson: '""'   },
      { label: 'Single',     inputJson: '{"s":"a"}',      expectedJson: '"a"'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Baseball Game (LC #682) ───────────────────────────────────────────────
  {
    slug: 'baseball-game',
    lcNumber: 682,
    title: 'Baseball Game',
    difficulty: 'Easy',
    pattern: 'Stack',
    tags: ['array', 'stack'],
    descriptionMd: `You are keeping score for a silly baseball game. Each entry in \`operations\` is
one of:

- An integer literal (as a string): record a new score equal to that value.
- \`"+"\`: record a new score equal to the sum of the **previous two** recorded scores.
- \`"D"\`: record a new score equal to **double** the previous recorded score.
- \`"C"\`: **invalidate** the previous recorded score and remove it.

Return the **sum of all scores** still recorded after processing every operation.

A stack of previously-recorded scores lets you implement each operation in constant time.`,
    examples: [
      {
        input: 'operations = ["3","4","+","C"]',
        output: '7',
        explanation: 'Record 3, record 4, record 7 (=3+4), then cancel the 7. Remaining: 3+4 = 7.',
      },
      {
        input: 'operations = ["10","20"]',
        output: '30',
      },
    ],
    constraints: [
      '`1 <= len(operations) <= 1000`',
      'Each entry is a valid integer string, `"+"`, `"D"`, or `"C"`.',
      'You may assume every operation is applicable (no `"C"` or `"+"` with too few prior scores).',
    ],
    starterCode: {
      python: `class Solution:
    def calPoints(self, operations: list[str]) -> int:
        # Return the sum of valid scores after processing every operation.
        pass
`,
    },
    methodName: 'calPoints',
    argKeys: ['operations'],
    defaultTests: [
      { label: 'Plus then cancel', inputJson: '{"operations":["3","4","+","C"]}', expectedJson: '7'  },
      { label: 'Two pushes',       inputJson: '{"operations":["10","20"]}',        expectedJson: '30' },
      { label: 'Double then cancel', inputJson: '{"operations":["5","D","C"]}',    expectedJson: '5'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Implement Queue using Stacks (LC #232) ────────────────────────────────
  {
    slug: 'implement-queue-using-stacks',
    lcNumber: 232,
    title: 'Implement Queue using Stacks',
    difficulty: 'Easy',
    pattern: 'Design',
    tags: ['stack', 'queue', 'design'],
    descriptionMd: `Design a **FIFO queue** that internally uses only LIFO stacks as its storage. Your
class should support \`push(x)\`, \`pop()\`, \`peek()\`, and \`empty()\` with amortized
\`O(1)\` time per operation.

Because our grader calls a single Python method per test, please expose the class behaviour
through a driver method \`runQueueOps(ops, vals)\` that:

1. Instantiates your queue.
2. Iterates over \`ops\` (a list of operation name strings) and \`vals\` (the corresponding
   argument lists — empty list for zero-argument ops).
3. Records the return value of each op into a result list, using \`None\` for operations that
   return nothing (like \`push\`).
4. Returns the result list.

This lets the same grader replay a whole op sequence in a single call.`,
    examples: [
      {
        input: 'ops = ["push","push","peek","pop","empty"], vals = [[1],[2],[],[],[]]',
        output: '[None, None, 1, 1, False]',
      },
      {
        input: 'ops = ["empty"], vals = [[]]',
        output: '[True]',
      },
    ],
    constraints: [
      '`1 <= len(ops) <= 100`',
      'Each op is one of `"push"`, `"pop"`, `"peek"`, `"empty"`.',
      '`pop` and `peek` are never called on an empty queue.',
    ],
    starterCode: {
      python: `class MyQueue:
    def __init__(self):
        # Two stacks — one for pushes ("in"), one for pops ("out").
        pass

    def push(self, x: int) -> None:
        pass

    def pop(self) -> int:
        pass

    def peek(self) -> int:
        pass

    def empty(self) -> bool:
        pass


class Solution:
    def runQueueOps(self, ops: list[str], vals: list[list[int]]) -> list:
        q = MyQueue()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(q, op)(*args)
            out.append(result)
        return out
`,
    },
    methodName: 'runQueueOps',
    argKeys: ['ops', 'vals'],
    defaultTests: [
      {
        label: 'Push/peek/pop',
        inputJson: '{"ops":["push","push","peek","pop","empty"],"vals":[[1],[2],[],[],[]]}',
        expectedJson: '[null,null,1,1,false]',
      },
      {
        label: 'Empty check',
        inputJson: '{"ops":["empty"],"vals":[[]]}',
        expectedJson: '[true]',
      },
      {
        label: 'Push then drain',
        inputJson: '{"ops":["push","pop","empty"],"vals":[[7],[],[]]}',
        expectedJson: '[null,7,true]',
      },
    ],
    resultCompare: 'exact',
  },

  // ─── Backspace String Compare (LC #844) ────────────────────────────────────
  {
    slug: 'backspace-string-compare',
    lcNumber: 844,
    title: 'Backspace String Compare',
    difficulty: 'Easy',
    pattern: 'Stack',
    tags: ['string', 'stack', 'two-pointers'],
    descriptionMd: `You are given two strings \`s\` and \`t\`. Each \`'#'\` represents a backspace that
deletes the previous character (if any). Return \`True\` if, after applying all backspaces,
both strings contain the same final sequence of characters.

The straightforward solution pushes characters onto a stack and pops on every \`'#'\`, then
compares the two stacks. An advanced follow-up asks for \`O(1)\` extra memory using two
reverse pointers, but either approach is fine.`,
    examples: [
      {
        input: 's = "xy#z", t = "xz"',
        output: 'True',
        explanation: '"xy#z" becomes "xz" after the backspace.',
      },
      {
        input: 's = "a##c", t = "#c"',
        output: 'True',
        explanation: 'Both reduce to "c" — extra backspaces on an empty stack do nothing.',
      },
      {
        input: 's = "a#b", t = "c"',
        output: 'False',
      },
    ],
    constraints: [
      '`1 <= len(s), len(t) <= 200`',
      '`s` and `t` contain only lowercase letters and the `#` character.',
    ],
    starterCode: {
      python: `class Solution:
    def backspaceCompare(self, s: str, t: str) -> bool:
        # Return True if applying '#' as backspace yields the same string for both.
        pass
`,
    },
    methodName: 'backspaceCompare',
    argKeys: ['s', 't'],
    defaultTests: [
      { label: 'Equal after bs', inputJson: '{"s":"xy#z","t":"xz"}',  expectedJson: 'true'  },
      { label: 'Empty backspaces',inputJson: '{"s":"a##c","t":"#c"}', expectedJson: 'true'  },
      { label: 'Not equal',      inputJson: '{"s":"a#b","t":"c"}',    expectedJson: 'false' },
    ],
    resultCompare: 'exact',
  },

  // ─── Evaluate Reverse Polish Notation (LC #150) ────────────────────────────
  {
    slug: 'evaluate-reverse-polish-notation',
    lcNumber: 150,
    title: 'Evaluate Reverse Polish Notation',
    difficulty: 'Medium',
    pattern: 'Stack',
    tags: ['array', 'stack'],
    descriptionMd: `You are given an arithmetic expression written in Reverse Polish Notation (postfix)
as a list of token strings. Each token is either an integer literal or one of the operators
\`"+"\`, \`"-"\`, \`"*"\`, \`"/"\`. Evaluate the expression and return the resulting integer.

Division between integers must **truncate toward zero** (so \`13 / 5\` is \`2\` and \`-7 / 2\`
is \`-3\`). The canonical solution walks the tokens with a stack: push integers, and on an
operator pop the top two operands, apply the operator, and push the result back.`,
    examples: [
      {
        input: 'tokens = ["4","13","5","/","+"]',
        output: '6',
        explanation: '13 / 5 truncates to 2, and 4 + 2 = 6.',
      },
      {
        input: 'tokens = ["3","4","*"]',
        output: '12',
      },
    ],
    constraints: [
      '`1 <= len(tokens) <= 10^4`',
      'Each token is either a valid integer literal or one of `+`, `-`, `*`, `/`.',
      'The expression is guaranteed to be well-formed.',
    ],
    starterCode: {
      python: `class Solution:
    def evalRPN(self, tokens: list[str]) -> int:
        # Return the integer result of evaluating the postfix expression.
        pass
`,
    },
    methodName: 'evalRPN',
    argKeys: ['tokens'],
    defaultTests: [
      { label: 'Add and divide', inputJson: '{"tokens":["4","13","5","/","+"]}', expectedJson: '6'  },
      { label: 'Multiply',       inputJson: '{"tokens":["3","4","*"]}',          expectedJson: '12' },
      { label: 'Single value',   inputJson: '{"tokens":["5"]}',                  expectedJson: '5'  },
      { label: 'Subtract',       inputJson: '{"tokens":["10","6","-"]}',         expectedJson: '4'  },
    ],
    resultCompare: 'exact',
  },

  // ─── Min Stack (LC #155) ───────────────────────────────────────────────────
  {
    slug: 'min-stack',
    lcNumber: 155,
    title: 'Min Stack',
    difficulty: 'Medium',
    pattern: 'Design',
    tags: ['stack', 'design'],
    descriptionMd: `Design a stack that supports \`push(x)\`, \`pop()\`, \`top()\`, and
\`getMin()\` — where **every operation runs in O(1) time**, including retrieving the current
minimum.

The trick is to keep a parallel "minimum so far" stack alongside the data stack, pushing the
new minimum on every \`push\` and popping it alongside every \`pop\`.

Because our grader calls a single Python method per test, expose the class behaviour through
a driver \`runMinStackOps(ops, vals)\` that instantiates your \`MinStack\`, runs each operation
in order, and returns a list of results (using \`None\` for ops that return nothing).`,
    examples: [
      {
        input: 'ops = ["push","push","push","getMin","pop","top","getMin"], vals = [[-2],[0],[-3],[],[],[],[]]',
        output: '[None, None, None, -3, None, 0, -2]',
      },
    ],
    constraints: [
      '`1 <= len(ops) <= 3 * 10^4`',
      'Each op is one of `"push"`, `"pop"`, `"top"`, `"getMin"`.',
      '`pop`, `top`, `getMin` are only called on non-empty stacks.',
    ],
    starterCode: {
      python: `class MinStack:
    def __init__(self):
        pass

    def push(self, val: int) -> None:
        pass

    def pop(self) -> None:
        pass

    def top(self) -> int:
        pass

    def getMin(self) -> int:
        pass


class Solution:
    def runMinStackOps(self, ops: list[str], vals: list[list[int]]) -> list:
        st = MinStack()
        out = []
        for op, args in zip(ops, vals):
            result = getattr(st, op)(*args)
            out.append(result)
        return out
`,
    },
    methodName: 'runMinStackOps',
    argKeys: ['ops', 'vals'],
    defaultTests: [
      {
        label: 'Classic sequence',
        inputJson: '{"ops":["push","push","push","getMin","pop","top","getMin"],"vals":[[-2],[0],[-3],[],[],[],[]]}',
        expectedJson: '[null,null,null,-3,null,0,-2]',
      },
      {
        label: 'Single element',
        inputJson: '{"ops":["push","getMin","top"],"vals":[[42],[],[]]}',
        expectedJson: '[null,42,42]',
      },
      {
        label: 'Track rising min',
        inputJson: '{"ops":["push","push","push","getMin"],"vals":[[5],[1],[3],[]]}',
        expectedJson: '[null,null,null,1]',
      },
    ],
    resultCompare: 'exact',
  },

  // ─── Daily Temperatures (LC #739) ──────────────────────────────────────────
  {
    slug: 'daily-temperatures',
    lcNumber: 739,
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    pattern: 'Monotonic Stack',
    tags: ['array', 'stack', 'monotonic-stack'],
    descriptionMd: `Given a list of daily temperatures \`temperatures\`, return an array \`answer\`
such that \`answer[i]\` is the **number of days you have to wait** after day \`i\` to see a
strictly warmer temperature. If no such day exists, put \`0\` in that slot.

The classic solution uses a monotonic decreasing stack of indices: for each new temperature,
pop every index whose temperature is smaller than the current one and record the distance
from that popped index to \`i\`.`,
    examples: [
      {
        input: 'temperatures = [60, 65, 63, 70]',
        output: '[1, 2, 1, 0]',
      },
      {
        input: 'temperatures = [30, 30, 30]',
        output: '[0, 0, 0]',
      },
    ],
    constraints: [
      '`1 <= len(temperatures) <= 10^5`',
      '`-50 <= temperatures[i] <= 150`',
    ],
    starterCode: {
      python: `class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        # For each day, return how many days until a strictly warmer temperature (0 if never).
        pass
`,
    },
    methodName: 'dailyTemperatures',
    argKeys: ['temperatures'],
    defaultTests: [
      { label: 'Mixed',       inputJson: '{"temperatures":[60,65,63,70]}', expectedJson: '[1,2,1,0]' },
      { label: 'All flat',    inputJson: '{"temperatures":[30,30,30]}',    expectedJson: '[0,0,0]'   },
      { label: 'Ascending',   inputJson: '{"temperatures":[1,2,3]}',       expectedJson: '[1,1,0]'   },
      { label: 'Single day',  inputJson: '{"temperatures":[42]}',          expectedJson: '[0]'       },
    ],
    resultCompare: 'exact',
  },

  // ─── Online Stock Span (LC #901) ───────────────────────────────────────────
  {
    slug: 'online-stock-span',
    lcNumber: 901,
    title: 'Online Stock Span',
    difficulty: 'Medium',
    pattern: 'Monotonic Stack',
    tags: ['stack', 'monotonic-stack', 'design'],
    descriptionMd: `Design a \`StockSpanner\` class that supports \`next(price)\`. Each call returns
the **span** of the price — that is, the maximum number of **consecutive days (including
today, working backward)** for which the price was less than or equal to today's price.

The monotonic-stack solution keeps pairs of \`(price, span)\` on a stack, collapsing any
tail whose price is \`<= price\` and summing their spans.

Because our grader calls a single Python method per test, expose the class behaviour through
a driver \`runStockSpanOps(ops, vals)\` that instantiates your \`StockSpanner\`, runs each
\`next\` call in order, and returns the list of span values.`,
    examples: [
      {
        input: 'ops = ["next","next","next","next","next","next"], vals = [[100],[80],[60],[70],[60],[75]]',
        output: '[1, 1, 1, 2, 1, 4]',
      },
    ],
    constraints: [
      '`1 <= len(ops) <= 10^4`',
      'Every op is `"next"`.',
      '`1 <= price <= 10^5`',
    ],
    starterCode: {
      python: `class StockSpanner:
    def __init__(self):
        pass

    def next(self, price: int) -> int:
        pass


class Solution:
    def runStockSpanOps(self, ops: list[str], vals: list[list[int]]) -> list[int]:
        ss = StockSpanner()
        out = []
        for op, args in zip(ops, vals):
            out.append(ss.next(*args))
        return out
`,
    },
    methodName: 'runStockSpanOps',
    argKeys: ['ops', 'vals'],
    defaultTests: [
      {
        label: 'Classic run',
        inputJson: '{"ops":["next","next","next","next","next","next"],"vals":[[100],[80],[60],[70],[60],[75]]}',
        expectedJson: '[1,1,1,2,1,4]',
      },
      {
        label: 'Single call',
        inputJson: '{"ops":["next"],"vals":[[50]]}',
        expectedJson: '[1]',
      },
      {
        label: 'Monotone up',
        inputJson: '{"ops":["next","next","next"],"vals":[[10],[20],[30]]}',
        expectedJson: '[1,2,3]',
      },
    ],
    resultCompare: 'exact',
  },

  // ─── Remove K Digits (LC #402) ─────────────────────────────────────────────
  {
    slug: 'remove-k-digits',
    lcNumber: 402,
    title: 'Remove K Digits',
    difficulty: 'Medium',
    pattern: 'Monotonic Stack',
    tags: ['string', 'stack', 'monotonic-stack', 'greedy'],
    descriptionMd: `Given a non-negative integer represented as the string \`num\` and an integer
\`k\`, remove exactly \`k\` digits from \`num\` so the resulting number is as **small as
possible**. Return the result as a string with no leading zeros (except the number itself
may be \`"0"\`).

The monotonic-stack solution walks the digits left to right: while the top of the stack is
greater than the current digit and there are still removals remaining, pop the top. At the
end remove any remaining from the right, strip leading zeros, and return \`"0"\` if empty.`,
    examples: [
      {
        input: 'num = "10200", k = 1',
        output: '"200"',
      },
      {
        input: 'num = "9", k = 1',
        output: '"0"',
      },
    ],
    constraints: [
      '`1 <= k <= len(num) <= 10^5`',
      '`num` consists only of digits and has no leading zeros unless it is `"0"`.',
    ],
    starterCode: {
      python: `class Solution:
    def removeKdigits(self, num: str, k: int) -> str:
        # Remove exactly k digits to produce the smallest possible number string.
        pass
`,
    },
    methodName: 'removeKdigits',
    argKeys: ['num', 'k'],
    defaultTests: [
      { label: 'Leading drop',  inputJson: '{"num":"10200","k":1}', expectedJson: '"200"' },
      { label: 'All gone',      inputJson: '{"num":"9","k":1}',     expectedJson: '"0"'   },
      { label: 'Trailing drop', inputJson: '{"num":"112","k":1}',   expectedJson: '"11"'  },
      { label: 'Two digit all', inputJson: '{"num":"10","k":2}',    expectedJson: '"0"'   },
    ],
    resultCompare: 'exact',
  },

  // ─── Decode String (LC #394) ───────────────────────────────────────────────
  {
    slug: 'decode-string',
    lcNumber: 394,
    title: 'Decode String',
    difficulty: 'Medium',
    pattern: 'Stack',
    tags: ['string', 'stack'],
    descriptionMd: `Given an encoded string \`s\`, return its decoded form. The encoding rule is
\`k[encoded_string]\` — the \`encoded_string\` inside the brackets is repeated \`k\` times.
Encodings may nest.

The standard stack-based solution keeps two stacks: one for the accumulated string before
the current bracket and one for the multipliers. On \`'['\` push the current partial
result and the current multiplier; on \`']'\` pop them and expand.`,
    examples: [
      {
        input: 's = "2[ab]"',
        output: '"abab"',
      },
      {
        input: 's = "3[a2[b]]"',
        output: '"abbabbabb"',
        explanation: 'The inner "2[b]" expands to "bb", giving "abb" — then repeated 3 times.',
      },
      {
        input: 's = "a"',
        output: '"a"',
      },
    ],
    constraints: [
      '`1 <= len(s) <= 30`',
      '`s` is guaranteed to be a well-formed encoded string.',
      'Multiplication factors are positive integers.',
    ],
    starterCode: {
      python: `class Solution:
    def decodeString(self, s: str) -> str:
        # Return the decoded form of the k[substring] run-length encoding.
        pass
`,
    },
    methodName: 'decodeString',
    argKeys: ['s'],
    defaultTests: [
      { label: 'Simple',    inputJson: '{"s":"2[ab]"}',    expectedJson: '"abab"'      },
      { label: 'Nested',    inputJson: '{"s":"3[a2[b]]"}', expectedJson: '"abbabbabb"' },
      { label: 'No repeat', inputJson: '{"s":"a"}',        expectedJson: '"a"'         },
    ],
    resultCompare: 'exact',
  },

  // ─── Largest Rectangle in Histogram (LC #84) ───────────────────────────────
  {
    slug: 'largest-rectangle-in-histogram',
    lcNumber: 84,
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    pattern: 'Monotonic Stack',
    tags: ['array', 'stack', 'monotonic-stack'],
    descriptionMd: `Given an array of non-negative integers \`heights\` representing bar heights of a
histogram where every bar has width 1, return the **area of the largest rectangle** that fits
entirely inside the histogram.

The classic \`O(n)\` solution uses a monotonic increasing stack of indices. For each new bar
strictly shorter than the stack top, pop the top and compute the area of the rectangle with
that popped bar as the shortest bar inside it. A common trick is to append a sentinel
\`0\` bar at the end so the stack flushes cleanly.`,
    examples: [
      {
        input: 'heights = [3, 2, 5, 4, 6]',
        output: '12',
        explanation: 'The rectangle over bars [5, 4, 6] trimmed to height 4 has area 3 * 4 = 12.',
      },
      {
        input: 'heights = [4]',
        output: '4',
      },
    ],
    constraints: [
      '`1 <= len(heights) <= 10^5`',
      '`0 <= heights[i] <= 10^4`',
    ],
    starterCode: {
      python: `class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        # Return the largest rectangle area that fits inside the histogram.
        pass
`,
    },
    methodName: 'largestRectangleArea',
    argKeys: ['heights'],
    defaultTests: [
      { label: 'Mixed',     inputJson: '{"heights":[3,2,5,4,6]}', expectedJson: '12' },
      { label: 'Single',    inputJson: '{"heights":[4]}',          expectedJson: '4'  },
      { label: 'Flat',      inputJson: '{"heights":[2,2,2]}',      expectedJson: '6'  },
    ],
    resultCompare: 'exact',
  },
];
