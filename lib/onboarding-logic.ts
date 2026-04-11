// Pure logic — no 'use server', safe to import from client components.

export interface OnboardingAnswers {
  pythonLevel: 0 | 1 | 2;
  dsLevel: 0 | 1 | 2;
  patternLevel: 0 | 1 | 2;
}

const PATH1_FIRST_4 = ['p1-variables', 'p1-operators', 'p1-conditionals', 'p1-loops'];
const PATH1_ALL = [
  ...PATH1_FIRST_4,
  'p1-functions', 'p1-lists', 'p1-dicts', 'p1-solve', 'p1-solve-practice-1',
];

const PATH2_FIRST_4 = ['p2-arrays', 'p2-hashmaps', 'p2-sets', 'p2-stacks'];
const PATH2_ALL_LESSONS = [
  ...PATH2_FIRST_4,
  'p2-queues', 'p2-linked', 'p2-trees', 'p2-heaps', 'p2-graphs',
];

const PATH3_FIRST_4 = ['p3-twopointers', 'p3-window', 'p3-prefix', 'p3-bsearch'];
const PATH3_ALL_LESSONS = [
  ...PATH3_FIRST_4,
  'p3-hashing', 'p3-stackpat', 'p3-bfs', 'p3-dfs', 'p3-treepat', 'p3-heappat', 'p3-dp',
];

export function computeSkippedBlocks(answers: OnboardingAnswers): string[] {
  const ids: string[] = [];

  if (answers.pythonLevel === 1) ids.push(...PATH1_FIRST_4);
  else if (answers.pythonLevel === 2) ids.push(...PATH1_ALL);

  if (answers.dsLevel === 1) ids.push(...PATH2_FIRST_4);
  else if (answers.dsLevel === 2) ids.push(...PATH2_ALL_LESSONS);

  if (answers.patternLevel === 1) ids.push(...PATH3_FIRST_4);
  else if (answers.patternLevel === 2) ids.push(...PATH3_ALL_LESSONS);

  return ids;
}
