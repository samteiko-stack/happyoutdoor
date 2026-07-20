import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth.server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapProduct, mapTemplate } from "@/lib/mappers";
import { getFirstName, getGreeting } from "@/lib/dashboard-greeting";
import { PageStack } from "@/components/layout";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTemplateCard } from "@/components/admin/admin-template-card";
import { AdminProductCard } from "@/components/admin/admin-product-card";
import { AdminAddCard } from "@/components/admin/admin-add-card";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ScrollRail } from "@/components/ui/scroll-rail";
import { Button } from "@/components/ui/button";

async function getAdminDashboardData() {
  const admin = createAdminClient();

  const [templateRows, productRows] = await Promise.all([
    admin.from("templates").select("*").order("updated_at", { ascending: false }).limit(12),
    admin
      .from("products")
      .select("*, categories(*)")
      .order("updated_at", { ascending: false })
      .limit(12),
  ]);

  return {
    templates: (templateRows.data ?? []).map((row) => mapTemplate(row)),
    products: (productRows.data ?? []).map((row) => mapProduct(row, row.categories)),
  };
}

export default async function AdminOverviewPage() {
  const session = await auth();
  const { templates, products } = await getAdminDashboardData();
  const firstName = getFirstName(session?.user?.name, session?.user?.email ?? "");

  return (
    <PageStack>
      <AdminPageHeader
        title={`${getGreeting()}, ${firstName}`}
        description="Manage catalog, templates, and users."
        actions={
          <div className="button-group">
            <Button asChild variant="outline">
              <Link href="/admin/products">
                <Plus className="size-4" />
                Add product
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/templates?new=1">
                <Plus className="size-4" />
                Add template
              </Link>
            </Button>
          </div>
        }
      />

      <DashboardSection
        title="Templates"
        href="/admin/templates"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/templates?new=1">Add template</Link>
          </Button>
        }
      >
        {templates.length > 0 ? (
          <ScrollRail visibleCount={4} bleed={false}>
            {templates.map((template) => (
              <AdminTemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                balconyWidthCm={template.balconyWidthCm}
                balconyHeightCm={template.balconyHeightCm}
                thumbnailUrl={template.thumbnailUrl}
                isPublished={template.isPublished}
                className="h-full"
              />
            ))}
            <AdminAddCard href="/admin/templates?new=1" label="Add template" />
          </ScrollRail>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AdminAddCard href="/admin/templates?new=1" label="Add template" />
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        title="Products"
        href="/admin/products"
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">Add product</Link>
          </Button>
        }
      >
        {products.length > 0 ? (
          <ScrollRail visibleCount={5} bleed={false}>
            {products.map((product) => (
              <AdminProductCard
                key={product.id}
                name={product.name}
                categoryName={product.category?.name}
                categorySlug={product.category?.slug}
                imageUrl={product.imageUrl}
                topViewImageUrl={product.topViewImageUrl}
                widthCm={product.widthCm}
                heightCm={product.heightCm}
                className="h-full"
              />
            ))}
            <AdminAddCard href="/admin/products" label="Add product" />
          </ScrollRail>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AdminAddCard href="/admin/products" label="Add product" />
          </div>
        )}
      </DashboardSection>
    </PageStack>
  );
}
