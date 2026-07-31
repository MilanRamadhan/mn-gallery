import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategories } from "@/lib/queries/stories";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <header className="admin-page-heading"><div><p className="eyebrow">Taxonomy</p><h1>Categories</h1><p>Simple shelves for finding a memory again.</p></div></header>
      <CategoryManager categories={categories} />
    </>
  );
}
