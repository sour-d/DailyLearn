import { notFound } from "next/navigation";
import { getCategoryById, getCategories } from "../_actions";
import { getEntriesByCategory } from "@/app/entries/_actions";
import { CategoryDetailView } from "@/components/categories/category-detail-view";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CategoryDetailPage({ params }: Props) {
  const { id } = await params;
  const [category, entries, categories] = await Promise.all([
    getCategoryById(id),
    getEntriesByCategory(id),
    getCategories(),
  ]);

  if (!category) notFound();

  return (
    <CategoryDetailView
      category={category}
      entries={entries}
      categories={categories}
    />
  );
}
