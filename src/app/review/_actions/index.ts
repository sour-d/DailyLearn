"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateSM2 } from "@/lib/spaced-repetition";
import type { Entry, Category } from "@/lib/supabase/types";

export interface ReviewQueue {
  category: Category;
  entries: Entry[];
}

export async function getReviewQueue(): Promise<ReviewQueue[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (!categories || categories.length === 0) return [];

  const queue: ReviewQueue[] = [];

  for (const category of categories) {
    const { data: entries } = await supabase
      .from("entries")
      .select("*")
      .eq("category_id", category.id)
      .eq("is_archived", false)
      .lte("next_review_date", today)
      .order("next_review_date", { ascending: true })
      .limit(category.daily_review_limit);

    if (entries && entries.length > 0) {
      queue.push({ category, entries });
    }
  }

  return queue;
}

export async function submitReview(entryId: string, rating: number) {
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("entries")
    .select("ease_factor, interval, repetitions")
    .eq("id", entryId)
    .single();

  if (!entry) throw new Error("Entry not found");

  const result = calculateSM2(
    {
      easeFactor: entry.ease_factor,
      interval: entry.interval,
      repetitions: entry.repetitions,
    },
    rating
  );

  await supabase
    .from("entries")
    .update({
      ease_factor: result.easeFactor,
      interval: result.interval,
      repetitions: result.repetitions,
      next_review_date: result.nextReviewDate,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", entryId);

  await supabase.from("review_history").insert({
    entry_id: entryId,
    rating,
  });

  // Update daily stats
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("date", today)
    .single();

  if (existing) {
    await supabase
      .from("daily_stats")
      .update({ entries_reviewed: (existing.entries_reviewed ?? 0) + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("daily_stats").insert({
      date: today,
      entries_reviewed: 1,
    });
  }

  // Update streak
  await updateStreak();

  revalidatePath("/review");
  revalidatePath("/");
}

async function updateStreak() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: config } = await supabase
    .from("app_config")
    .select("*")
    .limit(1)
    .single();

  if (!config) return;

  const lastActive = config.last_active_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = config.current_streak;

  if (lastActive === today) {
    return;
  } else if (lastActive === yesterdayStr) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(config.longest_streak, newStreak);

  await supabase
    .from("app_config")
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_active_date: today,
    })
    .eq("id", config.id);
}

export async function refreshReviewQueue(categoryId: string): Promise<Entry[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: category } = await supabase
    .from("categories")
    .select("daily_review_limit")
    .eq("id", categoryId)
    .single();

  if (!category) return [];

  const { data: entries } = await supabase
    .from("entries")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_archived", false)
    .lte("next_review_date", today)
    .order("next_review_date", { ascending: true })
    .limit(category.daily_review_limit);

  return entries ?? [];
}
