"use server";

import { createClient } from "@/lib/supabase/server";
import type { AppConfig, DailyStats, CategoryWithStats } from "@/lib/supabase/types";

export async function getAppConfig(): Promise<AppConfig | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_config").select("*").limit(1).single();
  return data;
}

export async function updateDailyGoal(goal: number) {
  const supabase = await createClient();
  const { data: config } = await supabase
    .from("app_config")
    .select("id")
    .limit(1)
    .single();

  if (!config) return;

  await supabase
    .from("app_config")
    .update({ daily_review_goal: goal })
    .eq("id", config.id);
}

export async function getTodayStats(): Promise<DailyStats | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("date", today)
    .single();
  return data;
}

export async function getCategoriesWithStats(): Promise<CategoryWithStats[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (!categories) return [];

  const result: CategoryWithStats[] = [];

  for (const cat of categories) {
    const { count: totalEntries } = await supabase
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("category_id", cat.id)
      .eq("is_archived", false);

    const { count: dueToday } = await supabase
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("category_id", cat.id)
      .eq("is_archived", false)
      .lte("next_review_date", today);

    const { data: masteredEntries } = await supabase
      .from("entries")
      .select("id")
      .eq("category_id", cat.id)
      .eq("is_archived", false)
      .gt("interval", 21)
      .gte("ease_factor", 2.5);

    result.push({
      ...cat,
      total_entries: totalEntries ?? 0,
      due_today: dueToday ?? 0,
      mastered_count: masteredEntries?.length ?? 0,
    });
  }

  return result;
}
