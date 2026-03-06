import { SearchView } from "@/components/search/search-view";
import { getCategories } from "@/app/categories/_actions";

export default async function SearchPage() {
  const categories = await getCategories();
  return <SearchView categories={categories} />;
}
