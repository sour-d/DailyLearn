"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Category } from "@/lib/supabase/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function createCategory(formData: {
  name: string;
  description?: string;
  color: string;
  icon: string;
  daily_review_limit: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: formData.name,
    description: formData.description || null,
    color: formData.color,
    icon: formData.icon,
    daily_review_limit: formData.daily_review_limit,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/categories");
  revalidatePath("/");
}

export async function updateCategory(
  id: string,
  formData: {
    name: string;
    description?: string;
    color: string;
    icon: string;
    daily_review_limit: number;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: formData.name,
      description: formData.description || null,
      color: formData.color,
      icon: formData.icon,
      daily_review_limit: formData.daily_review_limit,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/categories");
  revalidatePath(`/categories/${id}`);
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/categories");
  revalidatePath("/");
}
