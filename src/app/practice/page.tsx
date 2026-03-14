import { getCategoriesWithStats } from "@/app/_actions";
import { PracticeCategories } from "@/components/review/practice-categories";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const categories = await getCategoriesWithStats();

  return <PracticeCategories categories={categories} />;
}
