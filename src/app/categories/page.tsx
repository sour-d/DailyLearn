import { getCategories } from "./_actions";
import { CategoryList } from "@/components/categories/category-list";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return <CategoryList categories={categories} />;
}
