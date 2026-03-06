export type EntryType = "note" | "qa" | "snippet" | "vocabulary" | "link";
export type EntrySource = "manual" | "ai";
export type MasteryLevel = "new" | "learning" | "reviewing" | "mastered";

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  daily_review_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  category_id: string;
  type: EntryType;
  source: EntrySource;
  title: string;
  content: string | null;
  answer: string | null;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewHistory {
  id: string;
  entry_id: string;
  rating: number;
  reviewed_at: string;
}

export interface DailyStats {
  id: string;
  date: string;
  entries_added: number;
  entries_reviewed: number;
  created_at: string;
}

export interface AppConfig {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  daily_review_goal: number;
  updated_at: string;
}

export interface AiGenerationLog {
  id: string;
  category_id: string;
  prompt: string | null;
  model: string | null;
  entries_generated: number;
  created_at: string;
}

export interface CategoryWithStats extends Category {
  total_entries: number;
  due_today: number;
  mastered_count: number;
}

export function getMasteryLevel(entry: Pick<Entry, "repetitions" | "interval" | "ease_factor">): MasteryLevel {
  if (entry.repetitions === 0) return "new";
  if (entry.interval <= 7) return "learning";
  if (entry.interval > 21 && entry.ease_factor >= 2.5) return "mastered";
  return "reviewing";
}

export const MASTERY_CONFIG: Record<MasteryLevel, { label: string; color: string }> = {
  new: { label: "New", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  learning: { label: "Learning", color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" },
  reviewing: { label: "Reviewing", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  mastered: { label: "Mastered", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
};
