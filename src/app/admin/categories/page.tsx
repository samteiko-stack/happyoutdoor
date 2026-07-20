import { getAdminCategories } from "@/lib/admin/queries.server";
import { CategoriesPageClient } from "./categories-page-client";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();
  return <CategoriesPageClient initialCategories={categories} />;
}
