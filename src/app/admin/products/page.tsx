import { getAdminCategories, getAdminProducts } from "@/lib/admin/queries.server";
import { ProductsPageClient } from "./products-page-client";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <ProductsPageClient
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
