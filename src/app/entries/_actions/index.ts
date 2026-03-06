"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Entry, EntryType, EntrySource } from "@/lib/supabase/types";

export async function getEntriesByCategory(
  categoryId: string,
  includeArchived = false
): Promise<Entry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("entries")
    .select("*")
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false });

  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getEntryById(id: string): Promise<Entry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function createEntry(formData: {
  category_id: string;
  type: EntryType;
  source?: EntrySource;
  title: string;
  content?: string;
  answer?: string;
  tags?: string[];
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("entries").insert({
    category_id: formData.category_id,
    type: formData.type,
    source: formData.source ?? "manual",
    title: formData.title,
    content: formData.content || null,
    answer: formData.answer || null,
    tags: formData.tags ?? [],
  });

  if (error) throw new Error(error.message);

  // Update daily stats
  await incrementDailyStat("entries_added");

  revalidatePath(`/categories/${formData.category_id}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function createEntries(
  entries: {
    category_id: string;
    type: EntryType;
    source?: EntrySource;
    title: string;
    content?: string;
    answer?: string;
    tags?: string[];
  }[]
) {
  if (entries.length === 0) return;

  const supabase = await createClient();
  const rows = entries.map((e) => ({
    category_id: e.category_id,
    type: e.type,
    source: e.source ?? "manual",
    title: e.title,
    content: e.content || null,
    answer: e.answer || null,
    tags: e.tags ?? [],
  }));

  const { error } = await supabase.from("entries").insert(rows);
  if (error) throw new Error(error.message);

  await incrementDailyStat("entries_added", entries.length);

  const categoryId = entries[0].category_id;
  revalidatePath(`/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function updateEntry(
  id: string,
  formData: {
    title?: string;
    content?: string;
    answer?: string;
    type?: EntryType;
    tags?: string[];
    is_favorite?: boolean;
    is_archived?: boolean;
    category_id?: string;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update(formData)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function deleteEntry(id: string, categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("entries").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function deleteEntries(ids: string[], categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("entries").delete().in("id", ids);

  if (error) throw new Error(error.message);
  revalidatePath(`/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function archiveEntries(ids: string[], categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update({ is_archived: true })
    .in("id", ids);

  if (error) throw new Error(error.message);
  revalidatePath(`/categories/${categoryId}`);
  revalidatePath("/");
}

export async function moveEntries(
  ids: string[],
  fromCategoryId: string,
  toCategoryId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update({ category_id: toCategoryId })
    .in("id", ids);

  if (error) throw new Error(error.message);
  revalidatePath(`/categories/${fromCategoryId}`);
  revalidatePath(`/categories/${toCategoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update({ is_favorite: !isFavorite })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

async function incrementDailyStat(
  field: "entries_added" | "entries_reviewed",
  amount = 1
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("date", today)
    .single();

  if (existing) {
    await supabase
      .from("daily_stats")
      .update({ [field]: (existing[field] ?? 0) + amount })
      .eq("id", existing.id);
  } else {
    await supabase.from("daily_stats").insert({
      date: today,
      [field]: amount,
    });
  }
}
