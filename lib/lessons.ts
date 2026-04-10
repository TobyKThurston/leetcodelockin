import { getSupabase } from '@/lib/supabase';

// ─── Content block types (JSONB payload stored in lessons.content) ──────────

export type ContentBlock =
  | { type: 'paragraph'; html: string }
  | { type: 'signal'; color: string; label: string; html: string }
  | { type: 'heading'; text: string }
  | { type: 'code'; language?: string; code: string };

export interface LessonCard {
  blocks: ContentBlock[];
}

export interface LessonContent {
  cards?: LessonCard[];
  quiz?: {
    heading?: string;
    subheading?: string;
  };
}

// ─── Shapes returned to UI ──────────────────────────────────────────────────

export interface QuizQuestion {
  order_idx: number;
  question: string;
  options: string[];
  correct_idx: number;
  explanation: string;
}

export interface Lesson {
  slug: string;
  order_idx: number;
  title: string;
  tag: string;
  xp: number;
  content: LessonContent;
  quiz_questions?: QuizQuestion[];
}

export interface Module {
  id: string;
  idx: string;
  title: string;
  description: string;
  total_xp: number;
  lessons: Lesson[];
}

// ─── Row types from Supabase (snake_case) ───────────────────────────────────

interface LessonRow {
  id: string;
  slug: string;
  order_idx: number;
  title: string;
  tag: string;
  xp: number;
  content: LessonContent;
}

interface ModuleRow {
  id: string;
  idx: string;
  title: string;
  description: string;
  total_xp: number;
}

interface QuizQuestionRow extends QuizQuestion {
  lesson_id: string;
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export async function getModule(moduleId: string): Promise<Module | null> {
  const db = getSupabase();
  if (!db) return null;

  const { data: moduleRow, error: moduleErr } = await db
    .from('modules')
    .select('id, idx, title, description, total_xp')
    .eq('id', moduleId)
    .single<ModuleRow>();

  if (moduleErr || !moduleRow) return null;

  const { data: lessonRows, error: lessonsErr } = await db
    .from('lessons')
    .select('id, slug, order_idx, title, tag, xp, content')
    .eq('module_id', moduleId)
    .order('order_idx', { ascending: true })
    .returns<LessonRow[]>();

  if (lessonsErr || !lessonRows) return null;

  // Fetch all quiz questions for lessons in this module in a single query
  const lessonIds = lessonRows.map(l => l.id);
  const { data: quizRows } = await db
    .from('quiz_questions')
    .select('lesson_id, order_idx, question, options, correct_idx, explanation')
    .in('lesson_id', lessonIds)
    .order('order_idx', { ascending: true })
    .returns<QuizQuestionRow[]>();

  const quizByLessonId = new Map<string, QuizQuestion[]>();
  for (const row of quizRows ?? []) {
    const arr = quizByLessonId.get(row.lesson_id) ?? [];
    arr.push({
      order_idx: row.order_idx,
      question: row.question,
      options: row.options,
      correct_idx: row.correct_idx,
      explanation: row.explanation,
    });
    quizByLessonId.set(row.lesson_id, arr);
  }

  const lessons: Lesson[] = lessonRows.map(row => ({
    slug: row.slug,
    order_idx: row.order_idx,
    title: row.title,
    tag: row.tag,
    xp: row.xp,
    content: row.content ?? { cards: [] },
    quiz_questions: quizByLessonId.get(row.id),
  }));

  return {
    id: moduleRow.id,
    idx: moduleRow.idx,
    title: moduleRow.title,
    description: moduleRow.description,
    total_xp: moduleRow.total_xp,
    lessons,
  };
}
